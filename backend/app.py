from flask import Flask, request, jsonify, session, redirect, url_for, render_template, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from sqlalchemy import func
import os
import io
import secrets
from datetime import datetime, timedelta
import uuid
from openpyxl import Workbook, load_workbook
from flask_migrate import Migrate

# Importar modelos actualizados
from models import db, bcrypt, Admin, Vendor, Client, PhoneNumber, ReferralLink, ReferralClick, client_vendor_association
from models import RewardPointConfig, Reward, ClientStateHistory, Notification
from models import generate_referral_code, generate_link_code, generate_reset_token, send_reset_email
from models import get_phone_numbers, get_primary_phone, add_phone_numbers, create_notification

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')

# CONFIGURACIÓN COMPATIBLE CON DOCKER Y DESARROLLO
database_url = os.environ.get('DATABASE_URL')
if database_url:
    # Docker/Producción: Usar PostgreSQL
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    print("✅ Usando PostgreSQL (Docker/Producción)")
else:
    # Desarrollo: Usar SQLite (para tu compañero)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///referral_program.db'
    print("✅ Usando SQLite (Desarrollo)")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt.init_app(app)

# ===  ===
migrate = Migrate(app, db) 
# ==========================

# Configuración CORS simplificada pero efectiva
def get_cors_origins():
    origins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://frontend:3000']
    production_url = os.environ.get('FRONTEND_URL')
    if production_url and production_url not in origins:
        origins.append(production_url)
    return origins

CORS(app, origins=get_cors_origins(), supports_credentials=True)

# Helper functions para nuevo sistema multi-usuario
def find_user_by_username(username):
    """Buscar usuario en Admin, Vendor o Client tables"""
    user = Admin.query.filter_by(username=username).first()
    if user:
        return user, 'admin'
    
    user = Vendor.query.filter_by(username=username).first()
    if user:
        return user, 'vendor'
    
    user = Client.query.filter_by(username=username).first()
    if user:
        return user, 'client'
    
    return None, None

def find_user_by_email(email):
    """Buscar usuario por email en cualquier tabla"""
    user = Admin.query.filter_by(email=email).first()
    if user:
        return user, 'admin'
    
    user = Vendor.query.filter_by(email=email).first()
    if user:
        return user, 'vendor'
    
    user = Client.query.filter_by(email=email).first()
    if user:
        return user, 'client'
    
    return None, None

def get_current_user():
    """Obtener usuario actual basado en session"""
    if 'user_id' not in session or 'user_type' not in session:
        return None, None
    
    user_type = session['user_type']
    user_id = session['user_id']
    
    if user_type == 'admin':
        return Admin.query.get(user_id), 'admin'
    elif user_type == 'vendor':
        return Vendor.query.get(user_id), 'vendor'
    elif user_type == 'client':
        return Client.query.get(user_id), 'client'
    
    return None, None

# ========== RUTAS DE AUTENTICACIÓN ==========
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    # Buscar usuario en todas las tablas
    user, user_type = find_user_by_username(data['username'])
    
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        session['user_id'] = user.id
        session['user_type'] = user_type
        session['is_admin'] = (user_type == 'admin')
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone_numbers': get_phone_numbers(user),
            'user_type': user_type,
            'is_admin': (user_type == 'admin'),
            'is_vendor': (user_type == 'vendor'),
            'is_client': (user_type == 'client')
        }
        
        # Add client-specific data
        if user_type == 'client':
            user_data['referral_code'] = user.referral_code
            user_data['reward_points'] = user.reward_points
            user_data['vendor_ids'] = [v.id for v in user.vendors.all()]
        
        return jsonify({
            'message': 'Login successful',
            'user': user_data
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password') or not data.get('phone'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists in any table
    if Admin.query.filter_by(username=data['username']).first() or \
       Vendor.query.filter_by(username=data['username']).first() or \
       Client.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if Admin.query.filter_by(email=data['email']).first() or \
       Vendor.query.filter_by(email=data['email']).first() or \
       Client.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    try:
        # Get referral link code if provided
        referral_link_code = data.get('referralLinkCode')
        referrer_client = None
        referrer_vendors = []
        
        # If there's a referral link, find the referrer and their vendors
        if referral_link_code:
            referral_link = ReferralLink.query.filter_by(link_code=referral_link_code, is_active=True).first()
            
            if referral_link:
                # If the referral link belongs to a client
                if referral_link.client_id:
                    referrer_client = Client.query.get(referral_link.client_id)
                    if referrer_client:
                        # Get all vendors of the referring client
                        referrer_vendors = referrer_client.vendors.all()
                
                # If the referral link belongs to a vendor, use that vendor
                elif referral_link.vendor_id:
                    vendor = Vendor.query.get(referral_link.vendor_id)
                    if vendor:
                        referrer_vendors = [vendor]
        
        # Create client user with hashed password
        password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        referral_code = generate_referral_code()
        
        new_client = Client(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash,
            referral_code=referral_code,
            referred_by=referrer_client.id if referrer_client else None,
            reward_points=0
        )
        
        db.session.add(new_client)
        db.session.flush()  # Get the client ID
        
        # Add phone numbers
        phones = data['phone'] if isinstance(data['phone'], list) else [data['phone']]
        add_phone_numbers(new_client, phones, 'client')
        
        # Link to vendors (either from referrer or ensure at least one vendor exists)
        if referrer_vendors:
            # Link to all vendors of the referring client
            for vendor in referrer_vendors:
                new_client.vendors.append(vendor)
        else:
            # If no vendors found, try to link to the first available vendor
            # This ensures every client has at least one vendor
            first_vendor = Vendor.query.first()
            if first_vendor:
                new_client.vendors.append(first_vendor)
            # If no vendors exist at all, the client will be created without a vendor
            # The admin will need to assign a vendor manually
        
        # Update referral link conversion count if applicable
        if referral_link_code:
            referral_link = ReferralLink.query.filter_by(link_code=referral_link_code).first()
            if referral_link:
                referral_link.conversions += 1
                
                # Create notification for the referrer about new conversion
                if referral_link.client_id:
                    create_notification(
                        'client',
                        referral_link.client_id,
                        'success',
                        'New Conversion!',
                        f'{new_client.username} signed up using your referral link',
                        'client',
                        new_client.id
                    )
                elif referral_link.vendor_id:
                    create_notification(
                        'vendor',
                        referral_link.vendor_id,
                        'success',
                        'New Conversion!',
                        f'{new_client.username} signed up using your referral link',
                        'client',
                        new_client.id
                    )
        
        # Award points to referrer for initial "affiliated" state
        if referrer_client:
            # Get points for affiliated state
            affiliated_config = RewardPointConfig.query.filter_by(state_name='affiliated').first()
            affiliated_points = affiliated_config.points if affiliated_config else 0
            
            if affiliated_points > 0:
                # Award points to referrer
                referrer_client.reward_points += affiliated_points
                
                # Create history record for initial affiliated state
                history = ClientStateHistory(
                    client_id=new_client.id,
                    from_state=None,  # No previous state
                    to_state='affiliated',
                    points_awarded=affiliated_points,
                    awarded_to_client_id=referrer_client.id,
                    vendor_id=None  # System action, not vendor
                )
                db.session.add(history)
                
                # Notify referrer about points earned
                create_notification(
                    'client',
                    referrer_client.id,
                    'success',
                    'Points Earned!',
                    f'You earned {affiliated_points} points! {new_client.username} joined using your referral code',
                    'client',
                    new_client.id
                )
            else:
                # Notify referrer about new referral (no points)
                create_notification(
                    'client',
                    referrer_client.id,
                    'info',
                    'New Referral Active',
                    f'{new_client.username} has joined using your referral code',
                    'client',
                    new_client.id
                )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Registration successful',
            'client': {
                'id': new_client.id,
                'username': new_client.username,
                'email': new_client.email,
                'referral_code': new_client.referral_code,
                'referred_by': referrer_client.username if referrer_client else None,
                'vendor_count': len(referrer_vendors) if referrer_vendors else (1 if first_vendor else 0)
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 400

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    user, user_type = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    profile_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone_numbers': get_phone_numbers(user),
        'user_type': user_type,
        'is_admin': (user_type == 'admin'),
        'is_vendor': (user_type == 'vendor'),
        'is_client': (user_type == 'client')
    }
    
    # Add client-specific data
    if user_type == 'client':
        profile_data['referral_code'] = user.referral_code
        profile_data['reward_points'] = user.reward_points
        profile_data['referred_by'] = user.referred_by
        profile_data['referrals_count'] = len(user.referrals)
        profile_data['vendor_ids'] = [v.id for v in user.vendors.all()]
    
    return jsonify(profile_data), 200

@app.route('/api/user/update-profile', methods=['PUT'])
def update_user_profile():
    user, user_type = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    print(f"[UPDATE PROFILE] User: {user.username}, Type: {user_type}, Data: {data}")
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Update name/username
        if 'name' in data:
            new_name = data['name'].strip()
            if not new_name:
                return jsonify({'error': 'Name cannot be empty'}), 400
            print(f"[UPDATE PROFILE] Updating username from {user.username} to {new_name}")
            user.username = new_name
        
        # Update password if provided
        if 'newPassword' in data and data['newPassword']:
            current_password = data.get('currentPassword')
            print(f"[UPDATE PROFILE] Password change requested")
            
            if not current_password:
                print(f"[UPDATE PROFILE] Error: Current password not provided")
                return jsonify({'error': 'Current password is required'}), 400
            
            # Verify current password
            print(f"[UPDATE PROFILE] Verifying current password...")
            if not bcrypt.check_password_hash(user.password_hash, current_password):
                print(f"[UPDATE PROFILE] Error: Current password incorrect")
                return jsonify({'error': 'Current password is incorrect'}), 401
            
            # Validate new password
            new_password = data['newPassword']
            if len(new_password) < 6:
                print(f"[UPDATE PROFILE] Error: New password too short")
                return jsonify({'error': 'Password must be at least 6 characters'}), 400
            
            # Update password
            print(f"[UPDATE PROFILE] Generating new password hash...")
            user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
            print(f"[UPDATE PROFILE] Password hash updated successfully")
        
        print(f"[UPDATE PROFILE] Committing changes to database...")
        db.session.commit()
        print(f"[UPDATE PROFILE] Changes committed successfully")
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"[UPDATE PROFILE] ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    user, user_type = find_user_by_email(data['email'])
    
    # Siempre devolver éxito (por seguridad)
    if not user:
        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
    
    # En sistema actual, solo log (implementar tokens después)
    print(f"📧 Password reset requested for {user.email} ({user_type})")
    
    return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200

# ========== RUTAS DE ADMIN ==========
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    users_data = []
    
    # Get all admins
    admins = Admin.query.all()
    for admin in admins:
        users_data.append({
            'id': admin.id,
            'username': admin.username,
            'email': admin.email,
            'phone_numbers': get_phone_numbers(admin),
            'user_type': 'admin',
            'is_admin': True,
            'is_vendor': False,
            'is_client': False,
            'created_at': admin.created_at.isoformat()
        })
    
    # Get all vendors
    vendors = Vendor.query.all()
    for vendor in vendors:
        users_data.append({
            'id': vendor.id,
            'username': vendor.username,
            'email': vendor.email,
            'phone_numbers': get_phone_numbers(vendor),
            'user_type': 'vendor',
            'is_admin': False,
            'is_vendor': True,
            'is_client': False,
            'clients_count': vendor.clients.count(),
            'created_at': vendor.created_at.isoformat()
        })
    
    # Get all clients
    clients = Client.query.all()
    for client in clients:
        referred_by_username = None
        if client.referred_by:
            referrer = Client.query.get(client.referred_by)
            if referrer:
                referred_by_username = referrer.username
        
        vendor_usernames = [v.username for v in client.vendors.all()]
        
        users_data.append({
            'id': client.id,
            'username': client.username,
            'email': client.email,
            'phone_numbers': get_phone_numbers(client),
            'user_type': 'client',
            'is_admin': False,
            'is_vendor': False,
            'is_client': True,
            'referral_code': client.referral_code,
            'reward_points': client.reward_points,
            'referred_by_username': referred_by_username,
            'vendor_usernames': vendor_usernames,
            'referrals_count': len(client.referrals),
            'created_at': client.created_at.isoformat()
        })
    
    return jsonify(users_data), 200

# Admin: Create vendor
@app.route('/api/admin/vendors', methods=['POST'])
def create_vendor():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password') or not data.get('phone'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists in any table
    if Vendor.query.filter_by(username=data['username']).first() or \
       Client.query.filter_by(username=data['username']).first() or \
       Admin.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if Vendor.query.filter_by(email=data['email']).first() or \
       Client.query.filter_by(email=data['email']).first() or \
       Admin.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create vendor user
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    vendor = Vendor(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash
    )
    
    db.session.add(vendor)
    db.session.flush()  # Get the vendor ID
    
    # Add phone numbers
    phones = data['phone'] if isinstance(data['phone'], list) else [data['phone']]
    add_phone_numbers(vendor, phones, 'vendor')
    
    db.session.commit()
    
    return jsonify({
        'message': 'Vendor created successfully',
        'vendor': {
            'id': vendor.id,
            'username': vendor.username,
            'email': vendor.email,
            'phone_numbers': get_phone_numbers(vendor)
        }
    }), 201

# Admin: Get all vendors
@app.route('/api/admin/vendors', methods=['GET'])
def get_all_vendors():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    vendors = Vendor.query.all()
    vendors_data = []
    
    for vendor in vendors:
        clients_count = vendor.clients.count()
        vendors_data.append({
            'id': vendor.id,
            'username': vendor.username,
            'email': vendor.email,
            'phone_numbers': get_phone_numbers(vendor),
            'clients_count': clients_count,
            'created_at': vendor.created_at.isoformat()
        })
    
    return jsonify(vendors_data), 200

# Admin: Get vendors for dropdown
@app.route('/api/admin/vendors/dropdown', methods=['GET'])
def get_vendors_dropdown():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    vendors = Vendor.query.all()
    vendors_data = []
    
    for vendor in vendors:
        vendors_data.append({
            'id': vendor.id,
            'username': vendor.username,
            'email': vendor.email
        })
    
    return jsonify(vendors_data), 200

# ========== RUTAS DE IMPORTACIÓN DE USUARIOS ==========
# Download template for vendors import
@app.route('/api/admin/vendors/import/template', methods=['GET'])
def download_vendors_template():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    # Create a new workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Vendors"
    
    # Add headers
    headers = ['Username', 'Email', 'Password', 'Phone']
    ws.append(headers)
    
    # Add example row
    ws.append(['john_vendor', 'john@example.com', 'securepass123', '+1234567890'])
    
    # Style headers
    for cell in ws[1]:
        cell.font = cell.font.copy(bold=True)
    
    # Save to BytesIO
    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)
    
    return send_file(
        excel_file,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='vendors_import_template.xlsx'
    )

# Download template for clients import
@app.route('/api/admin/clients/import/template', methods=['GET'])
def download_clients_template():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    # Create a new workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Clients"
    
    # Add headers
    headers = ['Username', 'Email', 'Password', 'Phone', 'Referral Code (Optional)']
    ws.append(headers)
    
    # Add example row
    ws.append(['jane_client', 'jane@example.com', 'securepass123', '+1234567890', 'ABC123'])
    
    # Style headers
    for cell in ws[1]:
        cell.font = cell.font.copy(bold=True)
    
    # Save to BytesIO
    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)
    
    return send_file(
        excel_file,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='clients_import_template.xlsx'
    )

# Preview vendors import
@app.route('/api/admin/vendors/import/preview', methods=['POST'])
def preview_vendors_import():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        return jsonify({'error': 'File must be an Excel file (.xlsx or .xls)'}), 400
    
    try:
        # Load workbook from stream
        file_content = file.read()
        wb = load_workbook(filename=io.BytesIO(file_content), read_only=True)
        ws = wb.active
        
        # Parse data (skip header row)
        vendors_preview = []
        valid_count = 0
        
        for idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if not any(row):  # Skip empty rows
                continue
            
            username, email, password, phone = row[:4]
            
            # Validate required fields
            if not username or not email or not password or not phone:
                vendors_preview.append({
                    'row': idx,
                    'username': str(username) if username else '',
                    'email': str(email) if email else '',
                    'phone': str(phone) if phone else '',
                    'status': 'Missing required fields'
                })
                continue
            
            # Check for duplicates
            error_msg = None
            existing_user, _ = find_user_by_username(str(username).strip())
            if existing_user:
                error_msg = 'Username already exists'
            
            if not error_msg:
                existing_user, _ = find_user_by_email(str(email).strip())
                if existing_user:
                    error_msg = 'Email already exists'
            
            if error_msg:
                vendors_preview.append({
                    'row': idx,
                    'username': str(username).strip(),
                    'email': str(email).strip(),
                    'phone': str(phone).strip(),
                    'status': error_msg
                })
            else:
                vendors_preview.append({
                    'row': idx,
                    'username': str(username).strip(),
                    'email': str(email).strip(),
                    'phone': str(phone).strip(),
                    'password': str(password).strip(),  # Store password for import
                    'status': 'ready'
                })
                valid_count += 1
        
        # Store only valid data in session for confirmation
        valid_data = [v for v in vendors_preview if v['status'] == 'ready']
        session['import_preview'] = {
            'type': 'vendors',
            'data': valid_data
        }
        
        return jsonify({
            'preview': vendors_preview,
            'total': len(vendors_preview),
            'valid': valid_count,
            'invalid': len(vendors_preview) - valid_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to parse Excel file: {str(e)}'}), 400

# Preview clients import
@app.route('/api/admin/clients/import/preview', methods=['POST'])
def preview_clients_import():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    vendor_id = request.form.get('vendor_id')
    
    if not vendor_id:
        return jsonify({'error': 'Vendor ID is required for client import'}), 400
    
    # Verify vendor exists
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Invalid vendor ID'}), 400
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        return jsonify({'error': 'File must be an Excel file (.xlsx or .xls)'}), 400
    
    try:
        # Load workbook from stream
        file_content = file.read()
        wb = load_workbook(filename=io.BytesIO(file_content), read_only=True)
        ws = wb.active
        
        # Parse data (skip header row)
        clients_preview = []
        valid_count = 0
        
        for idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if not any(row):  # Skip empty rows
                continue
            
            username, email, password, phone = row[:4]
            referral_code = row[4] if len(row) > 4 else None
            
            # Validate required fields
            if not username or not email or not password or not phone:
                clients_preview.append({
                    'row': idx,
                    'username': str(username) if username else '',
                    'email': str(email) if email else '',
                    'phone': str(phone) if phone else '',
                    'referral_code': str(referral_code).strip() if referral_code else None,
                    'referred_by': None,
                    'status': 'Missing required fields'
                })
                continue
            
            # Check for duplicates
            error_msg = None
            existing_user, _ = find_user_by_username(str(username).strip())
            if existing_user:
                error_msg = 'Username already exists'
            
            if not error_msg:
                existing_user, _ = find_user_by_email(str(email).strip())
                if existing_user:
                    error_msg = 'Email already exists'
            
            # Validate referral code if provided
            referred_by_username = None
            if referral_code:
                referrer = Client.query.filter_by(referral_code=str(referral_code).strip()).first()
                if referrer:
                    referred_by_username = referrer.username
            
            if error_msg:
                clients_preview.append({
                    'row': idx,
                    'username': str(username).strip(),
                    'email': str(email).strip(),
                    'phone': str(phone).strip(),
                    'referral_code': str(referral_code).strip() if referral_code else None,
                    'referred_by': referred_by_username,
                    'status': error_msg
                })
            else:
                clients_preview.append({
                    'row': idx,
                    'username': str(username).strip(),
                    'email': str(email).strip(),
                    'phone': str(phone).strip(),
                    'password': str(password).strip(),  # Store password for import
                    'referral_code': str(referral_code).strip() if referral_code else None,
                    'referred_by': referred_by_username,
                    'status': 'ready'
                })
                valid_count += 1
        
        # Store only valid data in session for confirmation
        valid_data = [c for c in clients_preview if c['status'] == 'ready']
        session['import_preview'] = {
            'type': 'clients',
            'data': valid_data,
            'vendor_id': vendor_id
        }
        
        return jsonify({
            'preview': clients_preview,
            'total': len(clients_preview),
            'valid': valid_count,
            'invalid': len(clients_preview) - valid_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to parse Excel file: {str(e)}'}), 400

# Confirm vendors import
@app.route('/api/admin/vendors/import/confirm', methods=['POST'])
def confirm_vendors_import():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    if 'import_preview' not in session:
        return jsonify({'error': 'No import preview found'}), 400
    
    import_data = session['import_preview']
    
    if import_data['type'] != 'vendors':
        return jsonify({'error': 'Invalid import type'}), 400
    
    created_count = 0
    errors = []
    
    try:
        for vendor_data in import_data['data']:
            try:
                # Create vendor with hashed password from Excel
                password_hash = bcrypt.generate_password_hash(vendor_data['password']).decode('utf-8')
                
                vendor = Vendor(
                    username=vendor_data['username'],
                    email=vendor_data['email'],
                    password_hash=password_hash
                )
                
                db.session.add(vendor)
                db.session.flush()
                
                # Add phone number
                add_phone_numbers(vendor, [vendor_data['phone']], 'vendor')
                
                created_count += 1
                
            except Exception as e:
                errors.append(f"Failed to create vendor '{vendor_data['username']}': {str(e)}")
        
        db.session.commit()
        
        # Clear preview from session
        session.pop('import_preview', None)
        
        return jsonify({
            'message': f'Successfully imported {created_count} vendors',
            'created': created_count,
            'errors': errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Import failed: {str(e)}'}), 400

# Confirm clients import
@app.route('/api/admin/clients/import/confirm', methods=['POST'])
def confirm_clients_import():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    if 'import_preview' not in session:
        return jsonify({'error': 'No import preview found'}), 400
    
    import_data = session['import_preview']
    
    if import_data['type'] != 'clients':
        return jsonify({'error': 'Invalid import type'}), 400
    
    vendor_id = import_data.get('vendor_id')
    if not vendor_id:
        return jsonify({'error': 'No vendor ID found'}), 400
    
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 400
    
    created_count = 0
    errors = []
    
    try:
        for client_data in import_data['data']:
            try:
                # Find referrer if referral code provided
                referred_by_id = None
                referrer = None
                if client_data.get('referral_code'):
                    referrer = Client.query.filter_by(referral_code=client_data['referral_code']).first()
                    if referrer:
                        referred_by_id = referrer.id
                
                # Create client with hashed password from Excel
                password_hash = bcrypt.generate_password_hash(client_data['password']).decode('utf-8')
                referral_code = generate_referral_code()
                
                client = Client(
                    username=client_data['username'],
                    email=client_data['email'],
                    password_hash=password_hash,
                    referral_code=referral_code,
                    referred_by=referred_by_id,
                    reward_points=0
                )
                
                db.session.add(client)
                db.session.flush()
                
                # Add phone number
                add_phone_numbers(client, [client_data['phone']], 'client')
                
                # Link to vendor
                client.vendors.append(vendor)
                
                # Award points to referrer for initial "affiliated" state
                if referrer:
                    affiliated_config = RewardPointConfig.query.filter_by(state_name='affiliated').first()
                    affiliated_points = affiliated_config.points if affiliated_config else 0
                    
                    if affiliated_points > 0:
                        referrer.reward_points += affiliated_points
                        
                        # Create history record
                        history = ClientStateHistory(
                            client_id=client.id,
                            from_state=None,
                            to_state='affiliated',
                            points_awarded=affiliated_points,
                            awarded_to_client_id=referrer.id,
                            vendor_id=None
                        )
                        db.session.add(history)
                        
                        # Notify referrer
                        create_notification(
                            'client',
                            referrer.id,
                            'success',
                            'Points Earned!',
                            f'You earned {affiliated_points} points! {client.username} joined using your referral code',
                            'client',
                            client.id
                        )
                
                created_count += 1
                
            except Exception as e:
                errors.append(f"Failed to create client '{client_data['username']}': {str(e)}")
        
        db.session.commit()
        
        # Clear preview from session
        session.pop('import_preview', None)
        
        return jsonify({
            'message': f'Successfully imported {created_count} clients',
            'created': created_count,
            'errors': errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Import failed: {str(e)}'}), 400

# ========== RUTAS DE VENDOR ==========
@app.route('/api/vendor/clients', methods=['GET'])
def get_vendor_clients():
    if 'user_id' not in session or session.get('user_type') != 'vendor':
        return jsonify({'error': 'Vendor access required'}), 403
    
    vendor = Vendor.query.get(session['user_id'])
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    
    clients = vendor.clients.all()
    clients_data = []
    
    for client in clients:
        # Get referrer info if exists
        referred_by_username = None
        if client.referred_by:
            referrer = Client.query.get(client.referred_by)
            if referrer:
                referred_by_username = referrer.username
        
        clients_data.append({
            'id': client.id,
            'username': client.username,
            'email': client.email,
            'phone_numbers': get_phone_numbers(client),
            'referral_code': client.referral_code,
            'reward_points': client.reward_points,
            'created_at': client.created_at.isoformat(),
            'referrals_count': len(client.referrals),
            'state': client.state,
            'state_updated_at': client.state_updated_at.isoformat() if client.state_updated_at else None,
            'referred_by_username': referred_by_username
        })
    
    return jsonify(clients_data), 200

@app.route('/api/vendor/clients/<int:client_id>/referral-tree', methods=['GET'])
def get_vendor_client_referral_tree(client_id):
    """Direct referrals only (single-level uni-tree)."""
    if 'user_id' not in session or session.get('user_type') != 'vendor':
        return jsonify({'error': 'Vendor access required'}), 403

    vendor = Vendor.query.get(session['user_id'])
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    client = Client.query.get(client_id)
    if not client:
        return jsonify({'error': 'Client not found'}), 404

    if client not in vendor.clients.all():
        return jsonify({'error': 'Client not assigned to this vendor'}), 403

    direct_referrals = Client.query.filter_by(referred_by=client.id).order_by(Client.username).all()
    return jsonify({
        'root': {
            'id': client.id,
            'username': client.username,
            'email': client.email,
        },
        'direct_referrals': [
            {
                'id': ref.id,
                'username': ref.username,
                'email': ref.email,
            }
            for ref in direct_referrals
        ],
        'direct_referrals_count': len(direct_referrals),
    }), 200

@app.route('/api/vendor/analytics', methods=['GET'])
def get_vendor_analytics():
    if 'user_id' not in session or session.get('user_type') != 'vendor':
        return jsonify({'error': 'Vendor access required'}), 403
    
    vendor = Vendor.query.get(session['user_id'])
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    
    # Get vendor's clients
    clients = vendor.clients.all()
    
    # Calculate real stats
    total_clients = len(clients)
    total_referrals = sum(len(client.referrals) for client in clients)
    active_clients = len([client for client in clients if len(client.referrals) > 0])
    
    # Calculate commission (example: $25 per referral)
    total_commission = total_referrals * 25
    
    # Calculate active client percentage
    active_client_percentage = (active_clients / total_clients * 100) if total_clients > 0 else 0
    
    # Get referral links for this vendor
    vendor_referral_links = ReferralLink.query.filter_by(vendor_id=vendor.id).all()
    total_vendor_clicks = sum(link.clicks for link in vendor_referral_links)
    total_vendor_conversions = sum(link.conversions for link in vendor_referral_links)
    
    # Calculate vendor conversion rate
    vendor_conversion_rate = (total_vendor_conversions / total_vendor_clicks * 100) if total_vendor_clicks > 0 else 0
    
    analytics_data = {
        'totalClients': total_clients,
        'totalReferrals': total_referrals,
        'totalCommission': total_commission,
        'activeClients': active_clients,
        'activeClientPercentage': round(active_client_percentage, 1),
        'totalVendorClicks': total_vendor_clicks,
        'totalVendorConversions': total_vendor_conversions,
        'vendorConversionRate': round(vendor_conversion_rate, 1),
        'topClient': None
    }
    
    # Find top performing client
    if clients:
        top_client = max(clients, key=lambda client: len(client.referrals))
        analytics_data['topClient'] = {
            'username': top_client.username,
            'referrals_count': len(top_client.referrals)
        }
    
    return jsonify(analytics_data), 200

@app.route('/api/vendor/trends', methods=['GET'])
def get_vendor_trends():
    if 'user_id' not in session or session.get('user_type') != 'vendor':
        return jsonify({'error': 'Vendor access required'}), 403
    
    vendor = Vendor.query.get(session['user_id'])
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    
    # Calculate real trends from database
    from datetime import timedelta
    from sqlalchemy import func
    
    # Get counts for last 7 days
    today = datetime.utcnow().date()
    seven_days_ago = today - timedelta(days=6)
    
    clients_data = []
    commission_data = []
    conversion_data = []
    
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        next_day = day + timedelta(days=1)
        
        # Count clients assigned to this vendor up to this day
        daily_client_count = db.session.query(func.count(Client.id)).select_from(
            client_vendor_association
        ).join(
            Client, Client.id == client_vendor_association.c.client_id
        ).filter(
            client_vendor_association.c.vendor_id == vendor.id,
            func.date(Client.created_at) <= day
        ).scalar() or 0
        
        # Count referrals made by this vendor's clients on this day
        daily_referrals = db.session.query(func.count(Client.id)).filter(
            Client.referred_by.in_(
                db.session.query(Client.id).join(
                    client_vendor_association,
                    Client.id == client_vendor_association.c.client_id
                ).filter(
                    client_vendor_association.c.vendor_id == vendor.id
                )
            ),
            func.date(Client.created_at) == day
        ).scalar() or 0
        
        daily_commission = daily_referrals * 25  # $25 per referral
        
        clients_data.append(daily_client_count)
        commission_data.append(daily_commission)
        
        # Conversion rate: percentage of clients who have made referrals
        if daily_client_count > 0:
            clients_with_referrals = db.session.query(func.count(Client.id)).select_from(
                client_vendor_association
            ).join(
                Client, Client.id == client_vendor_association.c.client_id
            ).filter(
                client_vendor_association.c.vendor_id == vendor.id,
                Client.id.in_(
                    db.session.query(Client.referred_by).filter(Client.referred_by.isnot(None))
                ),
                func.date(Client.created_at) <= day
            ).scalar() or 0
            
            conversion_rate = (clients_with_referrals / daily_client_count * 100) if daily_client_count > 0 else 0
        else:
            conversion_rate = 0
        
        conversion_data.append(round(conversion_rate, 1))
    
    # Calculate changes
    def calculate_change(data):
        if len(data) < 2:
            return 0.0, 'neutral'
        
        first_val = sum(data[:3]) / 3 if sum(data[:3]) > 0 else 0
        last_val = sum(data[4:]) / 3 if sum(data[4:]) > 0 else 0
        
        if first_val == 0:
            return 100.0 if last_val > 0 else 0.0, 'positive' if last_val > 0 else 'neutral'
        
        change = ((last_val - first_val) / first_val) * 100
        change_type = 'positive' if change >= 0 else 'negative'
        return round(change, 1), change_type
    
    clients_change, clients_type = calculate_change(clients_data)
    commission_change, commission_type = calculate_change(commission_data)
    conversion_change, conversion_type = calculate_change(conversion_data)
    
    trends = {
        'clients': {
            'data': clients_data,
            'period': 'Last 7 days',
            'change': clients_change,
            'changeType': clients_type
        },
        'commission': {
            'data': commission_data,
            'period': 'Last 7 days',
            'change': commission_change,
            'changeType': commission_type
        },
        'conversionRate': {
            'data': conversion_data,
            'period': 'Last 7 days',
            'change': conversion_change,
            'changeType': conversion_type
        }
    }
    
    return jsonify(trends), 200

# ========== RUTAS DE REFERRAL LINKS ==========
@app.route('/api/referral-links', methods=['GET'])
def get_referral_links():
    if 'user_id' not in session or 'user_type' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_type = session['user_type']
    user_id = session['user_id']
    
    # Only clients and vendors can have referral links
    if user_type == 'client':
        links = ReferralLink.query.filter_by(client_id=user_id, is_active=True).all()
    elif user_type == 'vendor':
        links = ReferralLink.query.filter_by(vendor_id=user_id, is_active=True).all()
    else:
        return jsonify({'error': 'Only clients and vendors can have referral links'}), 403
    
    links_data = []
    for link in links:
        links_data.append({
            'id': link.id,
            'link_code': link.link_code,
            'clicks': link.clicks,
            'conversions': link.conversions,
            'created_at': link.created_at.isoformat(),
            'url': f"http://localhost:3000/referral/{link.link_code}"
        })
    
    return jsonify(links_data), 200

@app.route('/api/referral-links', methods=['POST'])
def create_referral_link():
    if 'user_id' not in session or 'user_type' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_type = session['user_type']
    user_id = session['user_id']
    
    # Only clients and vendors can create referral links
    if user_type not in ['client', 'vendor']:
        return jsonify({'error': 'Only clients and vendors can create referral links'}), 403
    
    link_code = generate_link_code()
    
    referral_link = ReferralLink(link_code=link_code)
    if user_type == 'client':
        referral_link.client_id = user_id
    else:  # vendor
        referral_link.vendor_id = user_id
    
    db.session.add(referral_link)
    db.session.commit()
    
    return jsonify({
        'id': referral_link.id,
        'link_code': link_code,
        'url': f"http://localhost:3000/referral/{link_code}",
        'created_at': referral_link.created_at.isoformat()
    }), 201

@app.route('/api/referral/<link_code>', methods=['GET'])
def track_referral_click(link_code):
    referral_link = ReferralLink.query.filter_by(link_code=link_code, is_active=True).first()
    
    if not referral_link:
        return jsonify({'error': 'Invalid referral link'}), 404
    
    # Track the click
    click = ReferralClick(
        link_id=referral_link.id,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.add(click)
    referral_link.clicks += 1
    db.session.commit()
    
    # Get referrer username
    referrer_username = None
    if referral_link.client_id:
        client = Client.query.get(referral_link.client_id)
        if client:
            referrer_username = client.username
    elif referral_link.vendor_id:
        vendor = Vendor.query.get(referral_link.vendor_id)
        if vendor:
            referrer_username = vendor.username
    
    return jsonify({
        'message': 'Referral link tracked',
        'referrer': referrer_username
    }), 200

@app.route('/api/referral/<link_code>/convert', methods=['POST'])
def convert_referral(link_code):
    referral_link = ReferralLink.query.filter_by(link_code=link_code, is_active=True).first()
    
    if not referral_link:
        return jsonify({'error': 'Invalid referral link'}), 404
    
    referral_link.conversions += 1
    db.session.commit()
    
    return jsonify({'message': 'Conversion tracked successfully'}), 200

# ========== RUTAS DE ANALYTICS Y ESTADÍSTICAS ==========
@app.route('/api/network', methods=['GET'])
def get_user_network():
    if 'user_id' not in session or 'user_type' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Only clients have referral networks
    if session['user_type'] != 'client':
        return jsonify({'error': 'Only clients have referral networks'}), 403
    
    current_client = Client.query.get(session['user_id'])
    if not current_client:
        return jsonify({'error': 'Client not found'}), 404
    
    # Get clients referred by current client
    referred_clients = Client.query.filter_by(referred_by=current_client.id).all()
    
    network_data = []
    for client in referred_clients:
        # Count how many people this client has referred
        sub_referrals = Client.query.filter_by(referred_by=client.id).count()
        
        client_data = {
            'id': client.id,
            'name': client.username,
            'email': client.email,
            'referrals': sub_referrals,
            'joined': client.created_at.isoformat(),
            'status': 'active'
        }
        network_data.append(client_data)
    
    return jsonify(network_data), 200

@app.route('/api/stats', methods=['GET'])
def get_user_stats():
    if 'user_id' not in session or 'user_type' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Only clients have detailed stats
    if session['user_type'] != 'client':
        return jsonify({'error': 'Only clients have stats'}), 403
    
    current_client = Client.query.get(session['user_id'])
    if not current_client:
        return jsonify({'error': 'Client not found'}), 404
    
    # Calculate comprehensive stats
    referrals_count = len(current_client.referrals)
    total_links = len(current_client.referral_links)
    total_clicks = sum(link.clicks for link in current_client.referral_links)
    total_conversions = sum(link.conversions for link in current_client.referral_links)
    active_links = len([link for link in current_client.referral_links if link.is_active])
    
    # Calculate earnings (example: $15 per conversion)
    earnings = total_conversions * 15
    
    # Calculate conversion rate
    conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
    
    # Simulate weekly stats (30% of total for demo)
    weekly_clicks = int(total_clicks * 0.3)
    weekly_growth = 12.5  # Example growth percentage
    
    stats = {
        'totalClicks': total_clicks,
        'totalConversions': total_conversions,
        'conversionRate': round(conversion_rate, 1),
        'activeLinks': active_links,
        'earnings': earnings,
        'weeklyClicks': weekly_clicks,
        'weeklyGrowth': weekly_growth,
        'referralsCount': referrals_count,
        'totalLinks': total_links,
        'rewardPoints': current_client.reward_points
    }
    
    return jsonify(stats), 200

@app.route('/api/analytics/trends', methods=['GET'])
def get_analytics_trends():
    if 'user_id' not in session or 'user_type' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Only clients have analytics trends
    if session['user_type'] != 'client':
        return jsonify({'error': 'Only clients have analytics'}), 403
    
    current_client = Client.query.get(session['user_id'])
    if not current_client:
        return jsonify({'error': 'Client not found'}), 404
    
    # Calculate real trends from database
    from datetime import timedelta
    from sqlalchemy import func
    
    # Get counts for last 7 days
    today = datetime.utcnow().date()
    seven_days_ago = today - timedelta(days=6)
    
    clicks_data = []
    conversions_data = []
    earnings_data = []
    conversion_rate_data = []
    
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        next_day = day + timedelta(days=1)
        
        # Count clicks on this client's referral links on this day
        daily_clicks = db.session.query(func.sum(ReferralClick.id.isnot(None).cast(db.Integer))).join(
            ReferralLink, ReferralLink.id == ReferralClick.link_id
        ).filter(
            ReferralLink.client_id == current_client.id,
            func.date(ReferralClick.clicked_at) == day
        ).scalar() or 0
        
        # Count of referral links that belong to this client
        client_link_ids = [link.id for link in current_client.referral_links]
        
        # Count clicks for this day (simpler approach)
        daily_link_clicks = db.session.query(func.count(ReferralClick.id)).filter(
            ReferralClick.link_id.in_(client_link_ids) if client_link_ids else False,
            func.date(ReferralClick.clicked_at) == day
        ).scalar() if client_link_ids else 0
        
        # Count conversions (new referrals created on this day)
        daily_conversions = Client.query.filter(
            Client.referred_by == current_client.id,
            func.date(Client.created_at) == day
        ).count()
        
        # Calculate earnings ($15 per conversion as per /api/stats endpoint)
        daily_earnings = daily_conversions * 15
        
        # Calculate conversion rate
        daily_conversion_rate = (daily_conversions / daily_link_clicks * 100) if daily_link_clicks > 0 else 0
        
        clicks_data.append(daily_link_clicks)
        conversions_data.append(daily_conversions)
        earnings_data.append(daily_earnings)
        conversion_rate_data.append(round(daily_conversion_rate, 1))
    
    # Calculate changes
    def calculate_change(data):
        if len(data) < 2:
            return 0.0, 'neutral'
        
        first_val = sum(data[:3]) / 3 if sum(data[:3]) > 0 else 0
        last_val = sum(data[4:]) / 3 if sum(data[4:]) > 0 else 0
        
        if first_val == 0:
            return 100.0 if last_val > 0 else 0.0, 'positive' if last_val > 0 else 'neutral'
        
        change = ((last_val - first_val) / first_val) * 100
        change_type = 'positive' if change >= 0 else 'negative'
        return round(change, 1), change_type
    
    clicks_change, clicks_type = calculate_change(clicks_data)
    conversions_change, conversions_type = calculate_change(conversions_data)
    earnings_change, earnings_type = calculate_change(earnings_data)
    conversion_rate_change, conversion_rate_type = calculate_change(conversion_rate_data)
    
    trends = {
        'clicks': {
            'data': clicks_data,
            'period': 'Last 7 days',
            'change': clicks_change,
            'changeType': clicks_type
        },
        'conversions': {
            'data': conversions_data,
            'period': 'Last 7 days',
            'change': conversions_change,
            'changeType': conversions_type
        },
        'earnings': {
            'data': earnings_data,
            'period': 'Last 7 days',
            'change': earnings_change,
            'changeType': earnings_type
        },
        'conversionRate': {
            'data': conversion_rate_data,
            'period': 'Last 7 days',
            'change': conversion_rate_change,
            'changeType': conversion_rate_type
        }
    }
    
    return jsonify(trends), 200

@app.route('/api/analytics/admin-trends', methods=['GET'])
def get_admin_analytics_trends():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    # Calculate real trends from database
    from datetime import timedelta
    from sqlalchemy import func
    
    # Get counts for last 7 days
    today = datetime.utcnow().date()
    seven_days_ago = today - timedelta(days=6)
    
    # Calculate daily user registrations (last 7 days)
    users_data = []
    referrals_data = []
    revenue_data = []
    
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        next_day = day + timedelta(days=1)
        
        # Count new users for this day (all types)
        daily_users = db.session.query(func.count()).select_from(
            db.session.query(Admin.id, Admin.created_at).union_all(
                db.session.query(Vendor.id, Vendor.created_at),
                db.session.query(Client.id, Client.created_at)
            ).subquery()
        ).filter(
            func.date(Admin.created_at) == day
        ).scalar() or 0
        
        # Count clients with referrals (created on this day)
        daily_clients = Client.query.filter(
            func.date(Client.created_at) == day
        ).count()
        
        # Count referrals (clients who have referred_by set, created on this day)
        daily_referrals = Client.query.filter(
            Client.referred_by.isnot(None),
            func.date(Client.created_at) == day
        ).count()
        
        users_data.append(daily_users)
        referrals_data.append(daily_referrals)
        revenue_data.append(daily_referrals * 25)  # $25 per referral
    
    # Calculate changes
    def calculate_change(data):
        if len(data) < 2 or sum(data[:3]) == 0:
            return 0.0, 'neutral'
        
        first_half = sum(data[:3]) / 3
        second_half = sum(data[4:]) / 3
        
        if first_half == 0:
            return 100.0 if second_half > 0 else 0.0, 'positive' if second_half > 0 else 'neutral'
        
        change = ((second_half - first_half) / first_half) * 100
        change_type = 'positive' if change >= 0 else 'negative'
        return round(change, 1), change_type
    
    revenue_change, revenue_type = calculate_change(revenue_data)
    users_change, users_type = calculate_change(users_data)
    referrals_change, referrals_type = calculate_change(referrals_data)
    
    # Calculate engagement (active clients percentage trend)
    total_clients = Client.query.count()
    clients_with_referrals = Client.query.filter(
        Client.id.in_(
            db.session.query(Client.referred_by).filter(Client.referred_by.isnot(None))
        )
    ).count() if total_clients > 0 else 0
    
    engagement_rate = (clients_with_referrals / total_clients * 100) if total_clients > 0 else 0
    engagement_data = [max(0, engagement_rate - 10), max(0, engagement_rate - 8), 
                      max(0, engagement_rate - 5), max(0, engagement_rate - 3),
                      max(0, engagement_rate - 1), engagement_rate, engagement_rate]
    
    trends = {
        'revenue': {
            'data': revenue_data,
            'period': 'Last 7 days',
            'change': revenue_change,
            'changeType': revenue_type
        },
        'users': {
            'data': users_data,
            'period': 'Last 7 days',
            'change': users_change,
            'changeType': users_type
        },
        'referrals': {
            'data': referrals_data,
            'period': 'Last 7 days',
            'change': referrals_change,
            'changeType': referrals_type
        },
        'engagement': {
            'data': engagement_data,
            'period': 'Last 7 days',
            'change': 0.0,
            'changeType': 'neutral'
        }
    }
    
    return jsonify(trends), 200

@app.route('/api/achievements', methods=['GET'])
def get_user_achievements():
    if 'user_id' not in session or 'user_type' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Only clients have achievements
    if session['user_type'] != 'client':
        return jsonify({'error': 'Only clients have achievements'}), 403
    
    current_client = Client.query.get(session['user_id'])
    if not current_client:
        return jsonify({'error': 'Client not found'}), 404
    
    # Calculate user stats
    referrals_count = len(current_client.referrals)
    total_links = len(current_client.referral_links)
    total_clicks = sum(link.clicks for link in current_client.referral_links)
    
    # Define achievements with real progress
    achievements = [
        {
            'id': 1,
            'title': 'First Referral',
            'description': 'Made your first successful referral',
            'completed': referrals_count >= 1,
            'icon': '🎯',
            'reward': '$10'
        },
        {
            'id': 2,
            'title': 'Network Builder',
            'description': 'Referred 5 people',
            'completed': referrals_count >= 5,
            'icon': '🏗️',
            'reward': '$50',
            'progress': min(referrals_count, 5)
        },
        {
            'id': 3,
            'title': 'Super Referrer',
            'description': 'Referred 10 people',
            'completed': referrals_count >= 10,
            'icon': '⭐',
            'reward': '$100',
            'progress': min(referrals_count, 10)
        },
        {
            'id': 4,
            'title': 'Click Master',
            'description': 'Generated 100 clicks on your links',
            'completed': total_clicks >= 100,
            'icon': '🖱️',
            'reward': '$25',
            'progress': min(total_clicks, 100)
        }
    ]
    
    return jsonify(achievements), 200

# ========== RUTAS DE REWARDS SYSTEM ==========
@app.route('/api/admin/reward-configs', methods=['GET'])
def get_reward_configs():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    configs = RewardPointConfig.query.all()
    configs_data = []
    
    for config in configs:
        configs_data.append({
            'id': config.id,
            'state_name': config.state_name,
            'points': config.points,
            'description': config.description,
            'updated_at': config.updated_at.isoformat()
        })
    
    return jsonify(configs_data), 200

@app.route('/api/admin/reward-configs', methods=['POST'])
def update_reward_configs():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data or 'configs' not in data:
        return jsonify({'error': 'Missing configs data'}), 400
    
    try:
        for config_data in data['configs']:
            state_name = config_data.get('state_name')
            points = config_data.get('points', 0)
            description = config_data.get('description', '')
            
            config = RewardPointConfig.query.filter_by(state_name=state_name).first()
            if config:
                config.points = points
                config.description = description
                config.updated_at = datetime.utcnow()
            else:
                config = RewardPointConfig(
                    state_name=state_name,
                    points=points,
                    description=description
                )
                db.session.add(config)
        
        db.session.commit()
        return jsonify({'message': 'Reward configurations updated successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update configurations: {str(e)}'}), 400

@app.route('/api/admin/rewards', methods=['GET'])
def get_rewards():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    rewards = Reward.query.all()
    rewards_data = []
    
    for reward in rewards:
        rewards_data.append({
            'id': reward.id,
            'name': reward.name,
            'description': reward.description,
            'points_required': reward.points_required,
            'is_active': reward.is_active,
            'created_at': reward.created_at.isoformat(),
            'updated_at': reward.updated_at.isoformat()
        })
    
    return jsonify(rewards_data), 200

@app.route('/api/admin/rewards', methods=['POST'])
def create_reward():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('points_required'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        reward = Reward(
            name=data['name'],
            description=data.get('description', ''),
            points_required=data['points_required'],
            is_active=data.get('is_active', True)
        )
        
        db.session.add(reward)
        db.session.commit()
        
        return jsonify({
            'message': 'Reward created successfully',
            'reward': {
                'id': reward.id,
                'name': reward.name,
                'description': reward.description,
                'points_required': reward.points_required,
                'is_active': reward.is_active
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create reward: {str(e)}'}), 400

@app.route('/api/admin/rewards/<int:reward_id>', methods=['PUT'])
def update_reward(reward_id):
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    reward = Reward.query.get(reward_id)
    if not reward:
        return jsonify({'error': 'Reward not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            reward.name = data['name']
        if 'description' in data:
            reward.description = data['description']
        if 'points_required' in data:
            reward.points_required = data['points_required']
        if 'is_active' in data:
            reward.is_active = data['is_active']
        
        reward.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Reward updated successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update reward: {str(e)}'}), 400

@app.route('/api/admin/rewards/<int:reward_id>', methods=['DELETE'])
def delete_reward(reward_id):
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    reward = Reward.query.get(reward_id)
    if not reward:
        return jsonify({'error': 'Reward not found'}), 404
    
    try:
        db.session.delete(reward)
        db.session.commit()
        return jsonify({'message': 'Reward deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete reward: {str(e)}'}), 400

# ========== RUTAS DE CLIENT STATE PROGRESSION ==========
@app.route('/api/vendor/clients/<int:client_id>/advance-state', methods=['POST'])
def advance_client_state(client_id):
    if 'user_id' not in session or session.get('user_type') != 'vendor':
        return jsonify({'error': 'Vendor access required'}), 403
    
    vendor = Vendor.query.get(session['user_id'])
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    
    client = Client.query.get(client_id)
    if not client:
        return jsonify({'error': 'Client not found'}), 404
    
    # Verify vendor has access to this client
    if client not in vendor.clients.all():
        return jsonify({'error': 'Client not assigned to this vendor'}), 403
    
    # Define state progression
    state_order = ['affiliated', 'contacted', 'visited', 'completed']
    current_state = client.state
    
    try:
        current_index = state_order.index(current_state)
    except ValueError:
        current_index = 0
        client.state = 'affiliated'
    
    if current_index >= len(state_order) - 1:
        return jsonify({'error': 'Client already at final state'}), 400
    
    new_state = state_order[current_index + 1]
    
    # Get points for this state
    config = RewardPointConfig.query.filter_by(state_name=new_state).first()
    points_to_award = config.points if config else 0
    
    try:
        # Update client state
        old_state = client.state
        client.state = new_state
        client.state_updated_at = datetime.utcnow()
        
        # Award points to referrer if exists
        awarded_to_client_id = None
        if client.referred_by and points_to_award > 0:
            referrer = Client.query.get(client.referred_by)
            if referrer:
                referrer.reward_points += points_to_award
                awarded_to_client_id = referrer.id
                
                # Notify referrer about points earned
                create_notification(
                    'client',
                    referrer.id,
                    'success',
                    'Points Earned!',
                    f'You earned {points_to_award} points! {client.username} advanced to {new_state}',
                    'client',
                    client.id
                )
        
        # Create history record
        history = ClientStateHistory(
            client_id=client.id,
            from_state=old_state,
            to_state=new_state,
            points_awarded=points_to_award,
            awarded_to_client_id=awarded_to_client_id,
            vendor_id=vendor.id
        )
        
        db.session.add(history)
        
        # Notify vendor about successful state change
        create_notification(
            'vendor',
            vendor.id,
            'success',
            'Client Progress Updated',
            f'{client.username} has been moved from {old_state} to {new_state}',
            'client',
            client.id
        )
        
        # Notify the client themselves about their progress
        create_notification(
            'client',
            client.id,
            'info',
            'Status Updated',
            f'Your status has been updated to {new_state}',
            'client_state',
            client.id
        )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Client state advanced successfully',
            'new_state': new_state,
            'points_awarded': points_to_award,
            'awarded_to_client_id': awarded_to_client_id
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to advance state: {str(e)}'}), 400

@app.route('/api/vendor/clients/<int:client_id>/state-history', methods=['GET'])
def get_client_state_history(client_id):
    if 'user_id' not in session or session.get('user_type') != 'vendor':
        return jsonify({'error': 'Vendor access required'}), 403
    
    vendor = Vendor.query.get(session['user_id'])
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    
    client = Client.query.get(client_id)
    if not client:
        return jsonify({'error': 'Client not found'}), 404
    
    # Verify vendor has access to this client
    if client not in vendor.clients.all():
        return jsonify({'error': 'Client not assigned to this vendor'}), 403
    
    history = ClientStateHistory.query.filter_by(client_id=client_id).order_by(ClientStateHistory.created_at.desc()).all()
    history_data = []
    
    for record in history:
        awarded_to_username = None
        if record.awarded_to_client_id:
            awarded_to = Client.query.get(record.awarded_to_client_id)
            if awarded_to:
                awarded_to_username = awarded_to.username
        
        history_data.append({
            'id': record.id,
            'from_state': record.from_state,
            'to_state': record.to_state,
            'points_awarded': record.points_awarded,
            'awarded_to_username': awarded_to_username,
            'created_at': record.created_at.isoformat()
        })
    
    return jsonify(history_data), 200

# ========== CLIENT REWARDS ENDPOINTS ==========
@app.route('/api/client/rewards/available', methods=['GET'])
def get_available_rewards():
    """Get all active rewards available for clients"""
    if 'user_id' not in session or session.get('user_type') != 'client':
        return jsonify({'error': 'Client access required'}), 403
    
    current_client = Client.query.get(session['user_id'])
    if not current_client:
        return jsonify({'error': 'Client not found'}), 404
    
    rewards = Reward.query.filter_by(is_active=True).order_by(Reward.points_required.asc()).all()
    rewards_data = []
    
    for reward in rewards:
        can_redeem = current_client.reward_points >= reward.points_required
        points_needed = max(0, reward.points_required - current_client.reward_points)
        
        rewards_data.append({
            'id': reward.id,
            'name': reward.name,
            'description': reward.description,
            'points_required': reward.points_required,
            'can_redeem': can_redeem,
            'points_needed': points_needed,
            'created_at': reward.created_at.isoformat()
        })
    
    return jsonify(rewards_data), 200

@app.route('/api/client/rewards/points-history', methods=['GET'])
def get_client_points_history():
    """Get the history of points earned by the current client"""
    if 'user_id' not in session or session.get('user_type') != 'client':
        return jsonify({'error': 'Client access required'}), 403
    
    current_client = Client.query.get(session['user_id'])
    if not current_client:
        return jsonify({'error': 'Client not found'}), 404
    
    # Get all history records where this client received points
    history = ClientStateHistory.query.filter_by(
        awarded_to_client_id=current_client.id
    ).order_by(ClientStateHistory.created_at.desc()).all()
    
    history_data = []
    for record in history:
        # Get the client who was advanced (the one they referred)
        referred_client = Client.query.get(record.client_id)
        referred_username = referred_client.username if referred_client else 'Unknown'
        
        # Get vendor who made the change
        vendor_username = None
        if record.vendor_id:
            vendor = Vendor.query.get(record.vendor_id)
            vendor_username = vendor.username if vendor else None
        
        history_data.append({
            'id': record.id,
            'points_awarded': record.points_awarded,
            'from_state': record.from_state,
            'to_state': record.to_state,
            'referred_client': referred_username,
            'vendor': vendor_username,
            'created_at': record.created_at.isoformat(),
            'date': record.created_at.strftime('%Y-%m-%d %H:%M')
        })
    
    return jsonify(history_data), 200

@app.route('/api/client/rewards/summary', methods=['GET'])
def get_client_rewards_summary():
    """Get comprehensive rewards summary for the current client"""
    if 'user_id' not in session or session.get('user_type') != 'client':
        return jsonify({'error': 'Client access required'}), 403
    
    current_client = Client.query.get(session['user_id'])
    if not current_client:
        return jsonify({'error': 'Client not found'}), 404
    
    # Get total points earned (sum of all points received)
    total_points_earned = db.session.query(
        db.func.sum(ClientStateHistory.points_awarded)
    ).filter_by(awarded_to_client_id=current_client.id).scalar() or 0
    
    # Get next available reward
    next_reward = Reward.query.filter(
        Reward.is_active == True,
        Reward.points_required > current_client.reward_points
    ).order_by(Reward.points_required.asc()).first()
    
    next_reward_data = None
    if next_reward:
        points_needed = next_reward.points_required - current_client.reward_points
        progress_percentage = (current_client.reward_points / next_reward.points_required) * 100
        
        next_reward_data = {
            'id': next_reward.id,
            'name': next_reward.name,
            'description': next_reward.description,
            'points_required': next_reward.points_required,
            'points_needed': points_needed,
            'progress_percentage': round(progress_percentage, 1)
        }
    
    # Count active referrals
    active_referrals_count = len([r for r in current_client.referrals if r.state != 'completed'])
    completed_referrals_count = len([r for r in current_client.referrals if r.state == 'completed'])
    
    summary = {
        'current_points': current_client.reward_points,
        'total_points_earned': int(total_points_earned),
        'next_reward': next_reward_data,
        'active_referrals': active_referrals_count,
        'completed_referrals': completed_referrals_count,
        'total_referrals': len(current_client.referrals)
    }
    
    return jsonify(summary), 200

# ========== ADMIN ANALYTICS ENDPOINTS ==========
@app.route('/api/admin/analytics/overview', methods=['GET'])
def get_admin_analytics_overview():
    """Get comprehensive admin analytics overview"""
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    # Total counts
    total_admins = Admin.query.count()
    total_vendors = Vendor.query.count()
    total_clients = Client.query.count()
    total_users = total_admins + total_vendors + total_clients
    
    # Referral statistics
    total_referrals = Client.query.filter(Client.referred_by.isnot(None)).count()
    clients_with_referrals = len(set([c.referred_by for c in Client.query.filter(Client.referred_by.isnot(None)).all()]))
    
    # Revenue calculation
    total_revenue = total_referrals * 25  # $25 per referral
    
    # Client states breakdown
    clients_by_state = {
        'affiliated': Client.query.filter_by(state='affiliated').count(),
        'contacted': Client.query.filter_by(state='contacted').count(),
        'visited': Client.query.filter_by(state='visited').count(),
        'completed': Client.query.filter_by(state='completed').count()
    }
    
    # Active referral links
    active_referral_links = ReferralLink.query.filter_by(is_active=True).count()
    total_clicks = db.session.query(func.sum(ReferralLink.clicks)).scalar() or 0
    total_conversions = db.session.query(func.sum(ReferralLink.conversions)).scalar() or 0
    
    # Average metrics
    avg_referrals_per_client = total_referrals / total_clients if total_clients > 0 else 0
    avg_clients_per_vendor = total_clients / total_vendors if total_vendors > 0 else 0
    conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
    
    # Top performers
    top_vendors = []
    for vendor in Vendor.query.all():
        vendor_clients = vendor.clients.count()
        vendor_referrals = sum([len(c.referrals) for c in vendor.clients.all()])
        top_vendors.append({
            'id': vendor.id,
            'username': vendor.username,
            'clients_count': vendor_clients,
            'referrals_count': vendor_referrals,
            'commission': vendor_referrals * 25
        })
    
    top_vendors = sorted(top_vendors, key=lambda x: x['referrals_count'], reverse=True)[:5]
    
    top_clients = []
    for client in Client.query.all():
        client_referrals = len(client.referrals)
        if client_referrals > 0:
            top_clients.append({
                'id': client.id,
                'username': client.username,
                'referrals_count': client_referrals,
                'reward_points': client.reward_points
            })
    
    top_clients = sorted(top_clients, key=lambda x: x['referrals_count'], reverse=True)[:5]
    
    return jsonify({
        'users': {
            'total': total_users,
            'admins': total_admins,
            'vendors': total_vendors,
            'clients': total_clients
        },
        'referrals': {
            'total': total_referrals,
            'active_referrers': clients_with_referrals,
            'avg_per_client': round(avg_referrals_per_client, 2)
        },
        'revenue': {
            'total': total_revenue,
            'per_referral': 25,
            'per_vendor': round(total_revenue / total_vendors, 2) if total_vendors > 0 else 0
        },
        'client_states': clients_by_state,
        'links': {
            'active': active_referral_links,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'conversion_rate': round(conversion_rate, 2)
        },
        'averages': {
            'referrals_per_client': round(avg_referrals_per_client, 2),
            'clients_per_vendor': round(avg_clients_per_vendor, 2)
        },
        'top_performers': {
            'vendors': top_vendors,
            'clients': top_clients
        }
    }), 200

@app.route('/api/vendor/analytics/detailed', methods=['GET'])
def get_vendor_detailed_analytics():
    """Get detailed vendor analytics including monthly breakdown"""
    if 'user_id' not in session or session.get('user_type') != 'vendor':
        return jsonify({'error': 'Vendor access required'}), 403
    
    vendor = Vendor.query.get(session['user_id'])
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    
    from datetime import timedelta
    from sqlalchemy import func
    
    # Get current month data
    today = datetime.utcnow()
    first_day_of_month = today.replace(day=1)
    
    # Monthly stats
    monthly_clients = db.session.query(func.count(Client.id)).select_from(
        client_vendor_association
    ).join(
        Client, Client.id == client_vendor_association.c.client_id
    ).filter(
        client_vendor_association.c.vendor_id == vendor.id,
        Client.created_at >= first_day_of_month
    ).scalar() or 0
    
    monthly_referrals = db.session.query(func.count(Client.id)).filter(
        Client.referred_by.in_(
            db.session.query(Client.id).join(
                client_vendor_association,
                Client.id == client_vendor_association.c.client_id
            ).filter(
                client_vendor_association.c.vendor_id == vendor.id
            )
        ),
        Client.created_at >= first_day_of_month
    ).scalar() or 0
    
    monthly_commission = monthly_referrals * 25
    
    # Client states breakdown
    vendor_client_ids = [c.id for c in vendor.clients.all()]
    states_breakdown = {
        'affiliated': Client.query.filter(Client.id.in_(vendor_client_ids), Client.state == 'affiliated').count() if vendor_client_ids else 0,
        'contacted': Client.query.filter(Client.id.in_(vendor_client_ids), Client.state == 'contacted').count() if vendor_client_ids else 0,
        'visited': Client.query.filter(Client.id.in_(vendor_client_ids), Client.state == 'visited').count() if vendor_client_ids else 0,
        'completed': Client.query.filter(Client.id.in_(vendor_client_ids), Client.state == 'completed').count() if vendor_client_ids else 0
    }
    
    return jsonify({
        'monthly': {
            'new_clients': monthly_clients,
            'referrals': monthly_referrals,
            'commission': monthly_commission
        },
        'client_states': states_breakdown,
        'performance_metrics': {
            'completion_rate': round((states_breakdown['completed'] / len(vendor_client_ids) * 100), 2) if vendor_client_ids else 0,
            'contact_rate': round(((states_breakdown['contacted'] + states_breakdown['visited'] + states_breakdown['completed']) / len(vendor_client_ids) * 100), 2) if vendor_client_ids else 0
        }
    }), 200

# ============================================================
# NOTIFICATION ENDPOINTS
# ============================================================

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get all notifications for the current user"""
    user, user_type = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        # Build query based on user type
        query = Notification.query
        if user_type == 'admin':
            query = query.filter_by(admin_id=user.id)
        elif user_type == 'vendor':
            query = query.filter_by(vendor_id=user.id)
        elif user_type == 'client':
            query = query.filter_by(client_id=user.id)
        
        # Filter by type if specified
        notification_type = request.args.get('type')
        if notification_type:
            query = query.filter_by(type=notification_type)
        
        # Filter by read status if specified
        read_status = request.args.get('read')
        if read_status is not None:
            is_read = read_status.lower() == 'true'
            query = query.filter_by(read=is_read)
        
        # Get notifications ordered by newest first
        notifications = query.order_by(Notification.created_at.desc()).all()
        
        # Format response
        notifications_data = []
        for notification in notifications:
            time_ago = get_time_ago(notification.created_at)
            notifications_data.append({
                'id': notification.id,
                'type': notification.type,
                'title': notification.title,
                'message': notification.message,
                'read': notification.read,
                'created_at': notification.created_at.isoformat(),
                'read_at': notification.read_at.isoformat() if notification.read_at else None,
                'time_ago': time_ago,
                'related_entity_type': notification.related_entity_type,
                'related_entity_id': notification.related_entity_id
            })
        
        return jsonify({
            'notifications': notifications_data,
            'total': len(notifications_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/unread-count', methods=['GET'])
def get_unread_count():
    """Get count of unread notifications for the current user"""
    user, user_type = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        query = Notification.query.filter_by(read=False)
        if user_type == 'admin':
            query = query.filter_by(admin_id=user.id)
        elif user_type == 'vendor':
            query = query.filter_by(vendor_id=user.id)
        elif user_type == 'client':
            query = query.filter_by(client_id=user.id)
        
        count = query.count()
        return jsonify({'count': count}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    user, user_type = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Check ownership
        if (user_type == 'admin' and notification.admin_id != user.id) or \
           (user_type == 'vendor' and notification.vendor_id != user.id) or \
           (user_type == 'client' and notification.client_id != user.id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        notification.read = True
        notification.read_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/mark-all-read', methods=['PUT'])
def mark_all_notifications_read():
    """Mark all notifications as read for the current user"""
    user, user_type = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        query = Notification.query.filter_by(read=False)
        if user_type == 'admin':
            query = query.filter_by(admin_id=user.id)
        elif user_type == 'vendor':
            query = query.filter_by(vendor_id=user.id)
        elif user_type == 'client':
            query = query.filter_by(client_id=user.id)
        
        notifications = query.all()
        for notification in notifications:
            notification.read = True
            notification.read_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'All notifications marked as read',
            'count': len(notifications)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    user, user_type = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Check ownership
        if (user_type == 'admin' and notification.admin_id != user.id) or \
           (user_type == 'vendor' and notification.vendor_id != user.id) or \
           (user_type == 'client' and notification.client_id != user.id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({'message': 'Notification deleted'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Helper function for time formatting
def get_time_ago(timestamp):
    """Convert timestamp to 'time ago' format"""
    now = datetime.utcnow()
    diff = now - timestamp
    
    if diff.days > 7:
        return timestamp.strftime('%b %d, %Y')
    elif diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "just now"

# ========== INICIALIZACIÓN ==========
def init_database():
    """Initialize database and create default data if needed"""
    with app.app_context():
        # Create all tables if they don't exist
        db.create_all()
        
        # Create admin user only if it doesn't exist
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            admin_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = Admin(
                username='admin',
                email='admin@elantar.com',
                password_hash=admin_password
            )
            db.session.add(admin)
            db.session.flush()  # Get admin ID
            
            # Add phone number to admin
            admin_phone = PhoneNumber(phone_number='+1234567890', admin_id=admin.id)
            db.session.add(admin_phone)
            
            db.session.commit()
            print("✅ Admin user created successfully!")
            print("   Username: admin")
            print("   Password: admin123")
            print("   Email: admin@elantar.com")
        
        # Initialize default reward point configurations
        default_configs = [
            {'state_name': 'affiliated', 'points': 10, 'description': 'Points awarded when a client affiliates someone'},
            {'state_name': 'contacted', 'points': 25, 'description': 'Points awarded when vendor contacts the affiliated client'},
            {'state_name': 'visited', 'points': 50, 'description': 'Points awarded when vendor visits the affiliated client'},
            {'state_name': 'completed', 'points': 100, 'description': 'Points awarded when sale is completed'}
        ]
        
        for config_data in default_configs:
            existing = RewardPointConfig.query.filter_by(state_name=config_data['state_name']).first()
            if not existing:
                config = RewardPointConfig(**config_data)
                db.session.add(config)
        
        db.session.commit()
        print("✅ Default reward configurations initialized!")
        
        # Initialize sample rewards
        default_rewards = [
            {'name': 'Bronze Gift Card', 'description': '$10 Amazon gift card', 'points_required': 100, 'is_active': True},
            {'name': 'Silver Gift Card', 'description': '$25 Amazon gift card', 'points_required': 250, 'is_active': True},
            {'name': 'Gold Gift Card', 'description': '$50 Amazon gift card', 'points_required': 500, 'is_active': True},
            {'name': 'Premium Discount', 'description': '10% discount on next purchase', 'points_required': 150, 'is_active': True},
            {'name': 'VIP Membership', 'description': '1 month VIP membership access', 'points_required': 300, 'is_active': True},
            {'name': 'Platinum Reward', 'description': '$100 store credit', 'points_required': 1000, 'is_active': True}
        ]
        
        for reward_data in default_rewards:
            existing = Reward.query.filter_by(name=reward_data['name']).first()
            if not existing:
                reward = Reward(**reward_data)
                db.session.add(reward)
        
        db.session.commit()
        print("✅ Sample rewards initialized!")

# Only initialize when running directly
if __name__ == '__main__':
    init_database()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
