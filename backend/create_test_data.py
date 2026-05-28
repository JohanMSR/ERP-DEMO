"""
Script para crear datos de prueba en la nueva estructura de base de datos
"""

from app import app, db, Admin, Vendor, Client, PhoneNumber, bcrypt, generate_referral_code
from sqlalchemy import inspect

def create_test_data():
    with app.app_context():
        if Vendor.query.filter_by(username='vendor1').first():
            print("\n==> Test data already exists (vendor1 found). Skipping seed.")
            return

        print("\n==> Creando datos de prueba...")
        
        # Verificar que las tablas existen
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Tablas en la base de datos: {tables}")
        
        # Crear vendedores de prueba
        print("\n1. Creando vendedores...")
        vendors = []
        for i in range(1, 4):
            vendor = Vendor(
                username=f'vendor{i}',
                email=f'vendor{i}@example.com',
                password_hash=bcrypt.generate_password_hash('password123').decode('utf-8')
            )
            db.session.add(vendor)
            db.session.flush()
            
            # Agregar teléfonos
            phone = PhoneNumber(phone_number=f'+123456789{i}', vendor_id=vendor.id)
            db.session.add(phone)
            vendors.append(vendor)
            print(f"   - Vendedor: {vendor.username}")
        
        db.session.commit()
        
        # Crear clientes de prueba
        print("\n2. Creando clientes...")
        clients = []
        for i in range(1, 11):
            client = Client(
                username=f'client{i}',
                email=f'client{i}@example.com',
                password_hash=bcrypt.generate_password_hash('password123').decode('utf-8'),
                referral_code=generate_referral_code(),
                reward_points=i * 10  # 10, 20, 30, etc.
            )
            db.session.add(client)
            db.session.flush()
            
            # Agregar teléfonos (algunos con múltiples números)
            phone1 = PhoneNumber(phone_number=f'+1234567{i:03d}', client_id=client.id)
            db.session.add(phone1)
            
            if i % 3 == 0:  # Cada tercer cliente tiene 2 números
                phone2 = PhoneNumber(phone_number=f'+9876543{i:03d}', client_id=client.id)
                db.session.add(phone2)
            
            # Asignar vendedores (cada cliente a 1-2 vendedores)
            vendor_idx = (i - 1) % len(vendors)
            client.vendors.append(vendors[vendor_idx])
            if i % 2 == 0 and len(vendors) > 1:  # Algunos clientes tienen 2 vendedores
                client.vendors.append(vendors[(vendor_idx + 1) % len(vendors)])
            
            clients.append(client)
            print(f"   - Cliente: {client.username} (Reward Points: {client.reward_points})")
        
        db.session.commit()
        
        # Crear relaciones de referidos
        print("\n3. Creando relaciones de referidos...")
        # Client2 fue referido por Client1
        clients[1].referred_by = clients[0].id
        # Client3 fue referido por Client1
        clients[2].referred_by = clients[0].id
        # Client5 fue referido por Client2
        clients[4].referred_by = clients[1].id
        
        db.session.commit()
        print("   - Client2 fue referido por Client1")
        print("   - Client3 fue referido por Client1")
        print("   - Client5 fue referido por Client2")
        
        # Resumen
        print("\n" + "="*60)
        print("RESUMEN DE DATOS DE PRUEBA CREADOS")
        print("="*60)
        print(f"\nAdmins: {Admin.query.count()}")
        print(f"Vendors: {Vendor.query.count()}")
        print(f"Clients: {Client.query.count()}")
        print(f"Phone Numbers: {PhoneNumber.query.count()}")
        
        print("\n--- Credenciales de Prueba ---")
        print("Admin:")
        print("  Username: admin")
        print("  Password: admin123")
        
        print("\nVendedores:")
        for i in range(1, 4):
            print(f"  Username: vendor{i}")
            print(f"  Password: password123")
        
        print("\nClientes:")
        for i in range(1, 6):
            print(f"  Username: client{i}")
            print(f"  Password: password123")
        print("  ... (client6 hasta client10 con las mismas credenciales)")
        
        print("\n" + "="*60)
        print("¡Datos de prueba creados exitosamente!")
        print("="*60 + "\n")

if __name__ == '__main__':
    create_test_data()

