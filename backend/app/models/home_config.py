from app import db
import json


class HomeConfig(db.Model):
    """Singleton — only 1 row (id=1)"""
    __tablename__ = 'home_config'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    show_about = db.Column(db.Boolean, default=True)
    show_services = db.Column(db.Boolean, default=True)
    services_limit = db.Column(db.Integer, default=4)
    selected_services = db.Column(db.Text, default='[]')  # JSON array of IDs
    show_why_us = db.Column(db.Boolean, default=True)
    show_stats = db.Column(db.Boolean, default=True)
    show_customers = db.Column(db.Boolean, default=True)
    customers_limit = db.Column(db.Integer, default=6)
    customers_rows = db.Column(db.Integer, default=3)
    selected_clients = db.Column(db.Text, default='[]')  # JSON array of client IDs
    show_cta = db.Column(db.Boolean, default=True)
    about_section = db.Column(db.Text, default='{}')

    def to_dict(self):
        try:
            selected = json.loads(self.selected_services)
        except (json.JSONDecodeError, TypeError):
            selected = []
        try:
            sel_clients = json.loads(self.selected_clients) if self.selected_clients else []
        except (json.JSONDecodeError, TypeError):
            sel_clients = []
        return {
            'showAbout': self.show_about,
            'showServices': self.show_services,
            'servicesLimit': self.services_limit,
            'selectedServices': selected,
            'showWhyUs': self.show_why_us,
            'showStats': self.show_stats,
            'showCustomers': self.show_customers,
            'customersLimit': self.customers_limit,
            'customersRows': self.customers_rows or 3,
            'selectedClients': sel_clients,
            'showCTA': self.show_cta,
            'aboutSection': json.loads(self.about_section) if self.about_section else {},
        }
