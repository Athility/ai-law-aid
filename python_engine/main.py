from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from llama_cpp import Llama
from typing import List, Dict, Any, Optional
import easyocr
import fitz
import io
import chromadb
from sentence_transformers import SentenceTransformer

app = FastAPI(title="NyayBot Local Inference Engine")

# --- CONFIGURATION ---
MODEL_PATH = "../models/Meta-Llama-3-8B-Instruct.Q4_K_M.gguf"
CHROMA_PATH = "./chroma_db"
EMBED_MODEL = "all-MiniLM-L6-v2"

# --- INITIALIZATION ---

# 1. Load Local LLM
print("Loading model into memory... This may take a moment.")
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=4096, # Increased context window for RAG
    n_gpu_layers=-1,
    verbose=False
)
print("Model loaded successfully!")

# 2. Setup Vector DB (RAG)
print(f"Loading embedding model: {EMBED_MODEL}...")
embedding_model = SentenceTransformer(EMBED_MODEL)

class LocalEmbeddingFunction:
    def __call__(self, input: list):
        return embedding_model.encode(input).tolist()

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
law_collection = chroma_client.get_or_create_collection(
    name="indian_law",
    embedding_function=LocalEmbeddingFunction()
)

# 3. Setup OCR
print("Loading OCR models...")
try:
    reader = easyocr.Reader(['en', 'hi'], gpu=False)
except Exception as e:
    print(f"Failed to load OCR: {e}")
    reader = None

# --- SCHEMAS ---

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    max_tokens: int = 1024
    temperature: float = 0.5
    analysis_mode: Optional[str] = "basic" # basic, advanced, deep

# --- ENDPOINTS ---

@app.post("/v1/chat/completions")
async def create_chat_completion(request: ChatRequest):
    try:
        # RAG Pipeline: Only retrieve if not in 'basic' mode
        context_str = ""
        if request.analysis_mode in ["advanced", "deep"] and len(request.messages) > 0:
            last_user_msg = ""
            # Find the last actual user message for query
            for msg in reversed(request.messages):
                if msg["role"] == "user":
                    last_user_msg = msg["content"]
                    break
            
            if last_user_msg:
                # Retrieve top-K chunks depending on mode
                n_results = 3 if request.analysis_mode == "advanced" else 7
                results = law_collection.query(
                    query_texts=[last_user_msg],
                    n_results=n_results
                )
                
                if results["documents"] and len(results["documents"][0]) > 0:
                    context_str = "\n\n[CONTEXT FROM THE INDIAN LEGAL DATABASE]\n"
                    for idx, doc in enumerate(results["documents"][0]):
                        source = results["metadatas"][0][idx]["source"]
                        context_str += f"- (Ref: {source}): {doc}\n"

        # Inject context into the system prompt or as a new context message
        final_messages = []
        has_system = False
        
        for msg in request.messages:
            if msg["role"] == "system":
                # Enhance existing system prompt with context
                enhanced_content = msg["content"]
                if context_str:
                    enhanced_content += "\n\nUse the following legal context to ground your answer if relevant:" + context_str
                final_messages.append({"role": "system", "content": enhanced_content})
                has_system = True
            else:
                final_messages.append(msg)

        if not has_system and context_str:
            # Add a system prompt if none existed
            final_messages.insert(0, {
                "role": "system", 
                "content": f"You are NyayBot, a friendly legal aid assistant. Use this context if relevant: {context_str}"
            })

        response = llm.create_chat_completion(
            messages=final_messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        return response
    except Exception as e:
        print(f"Chat Completion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/vision")
async def extract_text(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if file.filename.lower().endswith('.pdf'):
            extracted_pages = []
            with fitz.open("pdf", contents) as doc:
                for page in doc:
                    extracted_pages.append(page.get_text())
            return {"extracted_text": "\n".join(extracted_pages).strip()}

        if not reader:
            raise HTTPException(status_code=501, detail="OCR Reader is not initialized.")
            
        results = reader.readtext(contents, detail=0)
        return {"extracted_text": "\n".join(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text Extraction failed: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "engine": "llama-cpp-python", 
        "rag_ready": law_collection.count() > 0,
        "indexed_chunks": law_collection.count()
    }
