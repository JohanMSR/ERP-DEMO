#!/usr/bin/env python3
"""
Database initialization script
Creates all tables and default admin user
"""

from app import app, db, Admin, bcrypt, PhoneNumber, RewardPointConfig, Reward

def init_database():
    """Initialize database and create default data if needed"""
    with app.app_context():
        print("🔧 Creating database tables...")
        # Create all tables if they don't exist
        db.create_all()
        print("✅ Database tables created!")
        
        # Create admin user only if it doesn't exist
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            print("👤 Creating admin user...")
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
        else:
            print("ℹ️  Admin user already exists")
        
        # Initialize default reward point configurations
        print("⚙️  Initializing reward configurations...")
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
        print("🎁 Initializing sample rewards...")
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
        print("\n🎉 Database initialization complete!")

if __name__ == '__main__':
    init_database()

