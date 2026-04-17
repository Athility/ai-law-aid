import chromadb
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer
import os

# 1. Setup local embedding function (no API key needed)
# Using a lightweight but accurate model: all-MiniLM-L6-v2
EMBED_MODEL = "all-MiniLM-L6-v2"
CHROMA_PATH = "./chroma_db"

print(f"Loading embedding model: {EMBED_MODEL}...")
# We use sentence_transformers directly to ensure offline reliability
embedding_model = SentenceTransformer(EMBED_MODEL)

class LocalEmbeddingFunction:
    def __call__(self, input: list):
        return embedding_model.encode(input).tolist()

def get_chroma_client():
    return chromadb.PersistentClient(path=CHROMA_PATH)

def index_legal_docs(docs_dir="./knowledge"):
    client = get_chroma_client()
    # Create or get the legal collection
    collection = client.get_or_create_collection(
        name="indian_law",
        embedding_function=LocalEmbeddingFunction()
    )

    if not os.path.exists(docs_dir):
        print(f"Directory {docs_dir} not found. Creating it.")
        os.makedirs(docs_dir)
        return

    # Index files
    for filename in os.listdir(docs_dir):
        if filename.endswith(".txt"):
            path = os.path.join(docs_dir, filename)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                
                # Simple chunking: Split by double newlines (paragraphs)
                chunks = [c.strip() for c in content.split("\n\n") if len(c.strip()) > 50]
                
                print(f"Indexing {len(chunks)} chunks from {filename}...")
                
                ids = [f"{filename}_{i}" for i in range(len(chunks))]
                metadatas = [{"source": filename} for _ in range(len(chunks))]
                
                collection.add(
                    documents=chunks,
                    ids=ids,
                    metadatas=metadatas
                )
    print("Indexing complete.")

if __name__ == "__main__":
    # Mock some basic legal knowledge if empty
    sample_path = "./knowledge/basic_rights.txt"
    if not os.path.exists("./knowledge"):
        os.makedirs("./knowledge")
        
    if not os.path.exists(sample_path):
        with open(sample_path, "w", encoding="utf-8") as f:
            f.write("""The Right to Information Act (RTI), 2005 allows any citizen to request information from a public authority. The authority must respond within 30 days.

Under Section 498A of the IPC, cruelty by a husband or his relatives is a punishable offense. This covers harassment for dowry and physical or mental harm.

The Consumer Protection Act, 2019 provides consumers with the right to be protected against marketing of goods which are hazardous to life and property. Consumers can file complaints in District, State, or National Commissions.""")

    index_legal_docs()
