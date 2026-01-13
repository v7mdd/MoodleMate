import os
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Load environment variables
load_dotenv()

# Configuration
CHROMA_PATH = "chroma_db"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def main():
    # Clear existing database for a fresh start (optional, but good for demo)
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)

    print("Loading PDFs...")
    docs = []
    # Load all PDF files in AI Module directory
    pdf_dir = "AI Module"
    if not os.path.exists(pdf_dir):
        print(f"Directory '{pdf_dir}' not found.")
        return

    pdf_files = [os.path.join(pdf_dir, f) for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]
    
    if not pdf_files:
        print("No PDF files found.")
        return

    print(f"Found {len(pdf_files)} PDF files: {pdf_files}")

    for file_path in pdf_files:
        print(f"Loading {file_path}...")
        loader = PyPDFLoader(file_path)
        docs.extend(loader.load())
            
    print(f"Total loaded pages: {len(docs)}")

    print("Splitting text...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(docs)
    print(f"Split into {len(chunks)} chunks.")

    print("Creating embeddings and vector store...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    
    # Create and persist database
    db = Chroma.from_documents(
        chunks, 
        embeddings, 
        persist_directory=CHROMA_PATH
    )
    
    print("Database created successfully!")

if __name__ == "__main__":
    main()
