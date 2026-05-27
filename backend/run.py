import os
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
