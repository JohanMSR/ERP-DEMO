"""
Script to reset and reinitialize the database with the new rewards system structure
Run this script to drop all tables and recreate them with default configurations
"""
import os
from app import app
from models import db, RewardPointConfig, Admin, PhoneNumber
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def reset_database():
    with app.app_context():
        print("🔄 Dropping all existing tables...")
        db.drop_all()
        
        print("✨ Creating all tables with new structure...")
        db.create_all()
        
        # Create admin user
        print("👤 Creating admin user...")
        admin_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin = Admin(
            username='admin',
            email='admin@elantar.com',
            password_hash=admin_password
        )
        db.session.add(admin)
        db.session.flush()
        
        # Add phone number to admin
        admin_phone = PhoneNumber(phone_number='+1234567890', admin_id=admin.id)
        db.session.add(admin_phone)
        
        # Initialize default reward point configurations
        print("⭐ Creating default reward point configurations...")
        default_configs = [
            {'state_name': 'affiliated', 'points': 10, 'description': 'Points awarded when a client affiliates someone'},
            {'state_name': 'contacted', 'points': 25, 'description': 'Points awarded when vendor contacts the affiliated client'},
            {'state_name': 'visited', 'points': 50, 'description': 'Points awarded when vendor visits the affiliated client'},
            {'state_name': 'completed', 'points': 100, 'description': 'Points awarded when sale is completed'}
        ]
        
        for config_data in default_configs:
            config = RewardPointConfig(**config_data)
            db.session.add(config)
        
        db.session.commit()
        
        print("\n✅ Database reset complete!")
        print("\n📋 Default credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Email: admin@elantar.com")
        print("\n💡 Default reward points configuration:")
        print("   - Affiliated: 10 points")
        print("   - Contacted: 25 points")
        print("   - Visited: 50 points")
        print("   - Completed: 100 points")
        print("\n🚀 You can now start the backend and begin using the rewards system!")

if __name__ == '__main__':
    reset_database()

