from app import create_app, db
from app.models.company import CompanyInfo

app = create_app()
with app.app_context():
    info = CompanyInfo.query.get(1)
    if info:
        print("Current Company Name:", info.name)
        print("Current About:", info.about)
