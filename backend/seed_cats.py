from app import create_app, db
from app.models.gallery import GalleryCategory

def seed_categories():
    app = create_app()
    with app.app_context():
        # Create tables (will only create missing ones, i.e., gallery_categories)
        db.create_all()

        if GalleryCategory.query.first():
            print("Categories already exist.")
            return

        print("Seeding gallery categories...")
        categories = [
            ('Web', 'bi-laptop'),
            ('Mobile', 'bi-phone'),
            ('Design', 'bi-palette'),
            ('Team Building', 'bi-people'),
            ('Seminar', 'bi-easel'),
            ('Event', 'bi-calendar-event'),
            ('Corporate', 'bi-building'),
            ('Other', 'bi-images'),
        ]
        
        for i, (name, icon) in enumerate(categories):
            db.session.add(GalleryCategory(name=name, icon=icon, sort_order=i+1))
            
        db.session.commit()
        print("Done.")

if __name__ == '__main__':
    seed_categories()
