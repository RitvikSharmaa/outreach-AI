# ChromaDB removed due to build requirements
# import chromadb
# from chromadb.config import Settings as ChromaSettings
from config import get_settings
from typing import Optional

settings = get_settings()

# chroma_client = chromadb.Client(ChromaSettings(
#     persist_directory=settings.chroma_persist_dir,
#     anonymized_telemetry=False
# ))

def get_chroma_client():
    print("Warning: ChromaDB not available. Vector search disabled.")
    return None

def get_or_create_collection(name: str):
    print("Warning: ChromaDB not available. Vector search disabled.")
    return None
