from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import secrets
import uuid

db = SQLAlchemy()
bcrypt = Bcrypt()

# Tabla de asociación many-to-many entre clientes y vendedores
client_vendor_association = db.Table('client_vendor',
    db.Column('client_id', db.Integer, db.ForeignKey('client.id'), primary_key=True),
    db.Column('vendor_id', db.Integer, db.ForeignKey('vendor.id'), primary_key=True),
    db.Column('assigned_at', db.DateTime, default=datetime.utcnow)
)

class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    phone_numbers = db.relationship('PhoneNumber', backref='admin', lazy=True, 
                                   foreign_keys='PhoneNumber.admin_id', cascade='all, delete-orphan')

class Vendor(db.Model):
    __tablename__ = 'vendor'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    phone_numbers = db.relationship('PhoneNumber', backref='vendor', lazy=True,
                                   foreign_keys='PhoneNumber.vendor_id', cascade='all, delete-orphan')
    clients = db.relationship('Client', secondary=client_vendor_association, 
                             back_populates='vendors', lazy='dynamic')
    referral_links = db.relationship('ReferralLink', backref='vendor', lazy=True,
                                    foreign_keys='ReferralLink.vendor_id')

class Client(db.Model):
    __tablename__ = 'client'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    referral_code = db.Column(db.String(20), unique=True, nullable=False)
    referred_by = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=True)
    reward_points = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Client state tracking
    state = db.Column(db.String(20), default='affiliated', nullable=False)  # affiliated, contacted, visited, completed
    state_updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    phone_numbers = db.relationship('PhoneNumber', backref='client', lazy=True,
                                   foreign_keys='PhoneNumber.client_id', cascade='all, delete-orphan')
    vendors = db.relationship('Vendor', secondary=client_vendor_association,
                             back_populates='clients', lazy='dynamic')
    referrals = db.relationship('Client', backref=db.backref('referrer', remote_side=[id]), 
                               foreign_keys=[referred_by])
    referral_links = db.relationship('ReferralLink', backref='client', lazy=True,
                                    foreign_keys='ReferralLink.client_id')
    state_history = db.relationship('ClientStateHistory', backref='client', lazy=True,
                                   foreign_keys='ClientStateHistory.client_id',
                                   cascade='all, delete-orphan')

class PhoneNumber(db.Model):
    __tablename__ = 'phone_number'
    id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(20), nullable=False)
    
    # Foreign keys para cada tipo de usuario
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendor.id'), nullable=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ReferralLink(db.Model):
    __tablename__ = 'referral_link'
    id = db.Column(db.Integer, primary_key=True)
    # Puede pertenecer a un cliente o a un vendedor
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendor.id'), nullable=True)
    link_code = db.Column(db.String(50), unique=True, nullable=False)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class ReferralClick(db.Model):
    __tablename__ = 'referral_click'
    id = db.Column(db.Integer, primary_key=True)
    link_id = db.Column(db.Integer, db.ForeignKey('referral_link.id'), nullable=False)
    ip_address = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.String(500), nullable=True)
    clicked_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    link = db.relationship('ReferralLink', backref='click_records')

class RewardPointConfig(db.Model):
    __tablename__ = 'reward_point_config'
    id = db.Column(db.Integer, primary_key=True)
    state_name = db.Column(db.String(50), unique=True, nullable=False)  # affiliated, contacted, visited, completed
    points = db.Column(db.Integer, default=0, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Reward(db.Model):
    __tablename__ = 'reward'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    points_required = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ClientStateHistory(db.Model):
    __tablename__ = 'client_state_history'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    from_state = db.Column(db.String(20), nullable=True)
    to_state = db.Column(db.String(20), nullable=False)
    points_awarded = db.Column(db.Integer, default=0)
    awarded_to_client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=True)  # Referrer who gets the points
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendor.id'), nullable=True)  # Vendor who made the change
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    awarded_to = db.relationship('Client', foreign_keys=[awarded_to_client_id], backref='points_received')
    vendor = db.relationship('Vendor', backref='state_changes')

class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    
    # User references - notification can be for admin, vendor, or client
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendor.id'), nullable=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=True)
    
    # Notification content
    type = db.Column(db.String(20), nullable=False)  # success, info, warning, error
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    
    # Notification state
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)
    
    # Optional reference to related entity
    related_entity_type = db.Column(db.String(50), nullable=True)  # client, referral_link, payment, etc.
    related_entity_id = db.Column(db.Integer, nullable=True)
    
    # Relationships
    admin = db.relationship('Admin', backref='notifications', foreign_keys=[admin_id])
    vendor = db.relationship('Vendor', backref='notifications', foreign_keys=[vendor_id])
    client = db.relationship('Client', backref='notifications', foreign_keys=[client_id])

# Helper functions
def generate_referral_code():
    return secrets.token_urlsafe(8)

def generate_link_code():
    return str(uuid.uuid4())[:8]

def generate_reset_token():
    return secrets.token_urlsafe(32)

def send_reset_email(user_email, reset_token):
    # Por ahora solo log, luego implementaremos email real
    reset_url = f"http://localhost:3000/reset-password/{reset_token}"
    print(f"📧 Email de reset para {user_email}: {reset_url}")
    return True

# Helper functions to get phone numbers
def get_phone_numbers(entity):
    """Get all phone numbers for an entity (Admin, Vendor, or Client)"""
    return [pn.phone_number for pn in entity.phone_numbers]

def get_primary_phone(entity):
    """Get primary (first) phone number for an entity"""
    phones = get_phone_numbers(entity)
    return phones[0] if phones else None

def add_phone_numbers(entity, phone_list, entity_type):
    """Add phone numbers to an entity"""
    if not isinstance(phone_list, list):
        phone_list = [phone_list]
    
    for phone in phone_list:
        phone_number = PhoneNumber(phone_number=phone)
        if entity_type == 'admin':
            phone_number.admin_id = entity.id
        elif entity_type == 'vendor':
            phone_number.vendor_id = entity.id
        elif entity_type == 'client':
            phone_number.client_id = entity.id
        db.session.add(phone_number)

def create_notification(user_type, user_id, notification_type, title, message, related_entity_type=None, related_entity_id=None):
    """
    Create a notification for a user
    
    Args:
        user_type: 'admin', 'vendor', or 'client'
        user_id: ID of the user
        notification_type: 'success', 'info', 'warning', or 'error'
        title: Notification title
        message: Notification message
        related_entity_type: Optional entity type (e.g., 'client', 'referral_link')
        related_entity_id: Optional entity ID
    """
    notification = Notification(
        type=notification_type,
        title=title,
        message=message,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id
    )
    
    if user_type == 'admin':
        notification.admin_id = user_id
    elif user_type == 'vendor':
        notification.vendor_id = user_id
    elif user_type == 'client':
        notification.client_id = user_id
    
    db.session.add(notification)
    return notification
