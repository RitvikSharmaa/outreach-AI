import sys
import os

# Add parent directory to path so we can import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import the FastAPI app
from backend.main import app
from mangum import Mangum

# Create handler for Vercel
handler = Mangum(app, lifespan="off")
