import os
import sys

# Windows Python 3.8+ DLL loading fix for CUDA bridging
if os.name == 'nt':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    cuda_path = r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\bin\x64"
    if os.path.exists(cuda_path):
        os.add_dll_directory(cuda_path)
    
    # Add Nvidia PyPI bindings if they exist
    nvidia_bin = os.path.join(base_dir, "venv", "Lib", "site-packages", "nvidia")
    for module in ["cuda_runtime", "cublas", "cuda_nvrtc"]:
        mod_bin = os.path.join(nvidia_bin, module, "bin")
        if os.path.exists(mod_bin):
            os.add_dll_directory(mod_bin)
            
    # Add llama_cpp itself (where the jllllll wheel puts CUDA DLLs)
    llama_dir = os.path.join(base_dir, "venv", "Lib", "site-packages", "llama_cpp")
    if os.path.exists(llama_dir):
        print(f"Registering GPU DLL directory: {llama_dir}")
        os.add_dll_directory(llama_dir)
        
        # Hard Fix: Explicitly load dependencies into process memory using ctypes
        import ctypes
        dlls = ["cudart64_12.dll", "cublas64_12.dll", "cublasLt64_12.dll"]
        for dll in dlls:
            dll_path = os.path.join(llama_dir, dll)
            if os.path.exists(dll_path):
                try:
                    ctypes.CDLL(dll_path)
                    print(f"Successfully pre-loaded {dll}")
                except Exception as e:
                    print(f"Failed to pre-load {dll}: {e}")

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from llama_cpp import Llama
from typing import List, Dict, Any, Optional
import easyocr
import fitz
import io
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

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
    n_ctx=8192, # Expanded context for JRF report generation across full dossiers on the RTX 4060
    n_threads=4, # Stable thread count for standard laptops
    n_gpu_layers=-1,
    verbose=True 
)
print("Model loaded successfully!")

# 2. Setup Vector DB (RAG)
print(f"Loading embedding model: {EMBED_MODEL}...")
embedding_function = SentenceTransformerEmbeddingFunction(model_name=EMBED_MODEL)

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
law_collection = chroma_client.get_or_create_collection(
    name="indian_law",
    embedding_function=embedding_function
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
    max_tokens: int = 768 # Capped length for faster generation
    temperature: float = 0.5
    analysis_mode: Optional[str] = "basic" # basic, advanced, deep
    language: Optional[str] = "en-US" # e.g. hi-IN

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
                print(f"--- RAG Search Started: {last_user_msg[:50]}... ---")
                # Retrieve top-K chunks depending on mode
                n_results = 3 if request.analysis_mode == "advanced" else 7
                results = law_collection.query(
                    query_texts=[last_user_msg],
                    n_results=n_results
                )
                
                if results["documents"] and len(results["documents"][0]) > 0:
                    print(f"--- RAG Result: Found {len(results['documents'][0])} matching law chunks ---")
                    context_str = "\n\n[CONTEXT FROM THE INDIAN LEGAL DATABASE]\n"
                    for idx, doc in enumerate(results["documents"][0]):
                        source = results["metadatas"][0][idx]["source"]
                        context_str += f"- (Ref: {source}): {doc}\n"
                else:
                    print("--- RAG Result: No matching laws found in database ---")

        print("--- LLM Inference Started (This may take ~60-90s on CPU) ---")
        # Define the specialized legal system prompt natively in the Python Engine
        is_hindi = request.language and request.language.startswith('hi')
        
        if is_hindi:
            BASE_SYSTEM_PROMPT = """You are NyayBot, a friendly AI Law Helper. Respond strictly in Hindi, using clear, simple, and supportive language.
NEVER say "I am an AI." Support the user simply and directly.

Structure your response exactly like this:

**कानूनी विषय (Legal Theme):**
[विषय का नाम जैसे: किरायेदारी / साइबर धोखाधड़ी / घरेलू हिंसा]

**आपके अधिकार (Your Rights):**
[सरल भाषा में 2-3 वाक्यों में इनके अधिकार समझाएं।]

**प्रासंगिक कानून (Relevant Laws):**
[लागू होने वाले 2-3 कानूनों या धाराओं की सूची।]

**आपको क्या करना चाहिए (What You Should Do):**
[1, 2, 3 कर के स्पष्ट कदम बताएं।]

**कहां संपर्क करें (Where to Approach):**
[उपयुक्त अथॉरिटी या फोरम का नाम बताएं जैसे पुलिस या कोर्ट।]

---
*अस्वीकरण (Disclaimer): यह केवल सामान्य जानकारी है, कानूनी सलाह नहीं। गंभीर मामलों के लिए वकील से संपर्क करें।*
हमेशा अंत में पूछें: "क्या आप चाहते हैं कि मैं इसे और समझाऊं या आपका कोई और सवाल है?"""
        else:
            BASE_SYSTEM_PROMPT = """You are NyayBot, your friendly and approachable "AI Law Helper". Your goal is to guide everyday Indian citizens through their legal problems like a caring, knowledgeable friend would. Do NOT use intimidating legal jargon unless absolutely necessary (and always explain it). 
NEVER say robotic things like "I am a text-based AI assistant" or "I cannot view files." If a user uploads a file and the OCR fails, just say: "I had a little trouble reading that document, could you tell me a bit about what it says?"

When a user describes their problem or uploads evidence, always structure your response like this:

**Legal Theme:** [e.g., Tenant Rules / Shopping Issues / Workplace / Family Safety / Cyber Scams / Police Matters]

**Your Rights (Simply Explained):**
Explain their rights in 2-3 sentences using the simplest language possible. Be empathetic and supportive.

**Relevant Indian Laws:**
List 2-3 specific laws, acts, or sections that apply. 

**What You Should Do:**
Give 3 clear, actionable next steps numbered 1, 2, 3. Be specific — mention where to go, what to file, or who to contact.

**Where to Approach:**
Mention the right forum or authority (e.g., Consumer Forum / District Court / Cyber Cell / Labour Court / RERA / Police Station / Legal Services Authority)

---
*Disclaimer: This is general legal information, not legal advice. For serious matters, please consult a qualified lawyer. Free legal aid is available at your nearest District Legal Services Authority (DLSA).*

Keep responses clear and empathetic. The user may be stressed. Support Hindi queries equally well. **Do not include any internal thoughts, reasoning, or "thinking" steps in your output. Go straight to the structured response.** Always end by asking: "Do you want me to explain any of this further, or do you have a follow-up question?"
"""

        # Inject context into the system prompt or as a new context message
        final_messages = []
        has_system = False
        
        for msg in request.messages:
            if msg["role"] == "system":
                # Enhance existing system prompt with context
                enhanced_content = msg["content"]
                if context_str:
                    enhanced_content += "\n\nUse the following legal context to ground your answer if relevant:\n" + context_str
                final_messages.append({"role": "system", "content": enhanced_content})
                has_system = True
            else:
                final_messages.append(msg)

        if not has_system:
            # Add the robust system prompt if none existed
            system_content = BASE_SYSTEM_PROMPT
            if context_str:
                system_content += "\n\nUse the following legal context to ground your answer if relevant:\n" + context_str
                
            final_messages.insert(0, {
                "role": "system", 
                "content": system_content
            })

        # Llama 3 Manual Prompt Formatting
        prompt = "<|begin_of_text|>"
        for msg in final_messages:
            prompt += f"<|start_header_id|>{msg['role']}<|end_header_id|>\n\n{msg['content']}<|eot_id|>\n"
        
        prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"

        raw_response = llm.create_completion(
            prompt=prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            stop=["<|eot_id|>", "<|end_of_text|>"]
        )
        
        # Re-pack the raw completion into the OpenAI ChatCompletion format expected by the frontend
        response = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": raw_response["choices"][0]["text"]
                    }
                }
            ]
        }
        return response
    except Exception as e:
        print(f"Chat Completion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class JargonRequest(BaseModel):
    raw_history: str

@app.post("/v1/generate-jargon-report")
async def generate_jargon_report(request: JargonRequest):
    try:
        print("--- Jargonize Report Started ---")
        
        system_prompt = """You are a Senior Advocate of the Supreme Court of India. You are reviewing raw chat logs between a client and an AI assistant.
Your task is to REWRITE and JARGONIZE this entire narrative into a formal, highly technical Legal Brief suitable for a fellow advocate.
Do NOT summarize it away into a few bullet points. Retain the detailed facts, but elevate the language strictly using procedural terminology and cite relevant statutory provisions (IPC, crPC, BNS, CPC, etc.).
Structure it into two clear sections: 
1. Statement of Facts (Jargonized)
2. Statutory Analysis & Prima Facie Evaluation

Do NOT use markdown headings (# or ##), but use bolding for titles. Output plain formal text."""

        prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|>\n"
        prompt += f"<|start_header_id|>user<|end_header_id|>\n\nHere are the raw records:\n\n{request.raw_history}<|eot_id|>\n"
        prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"

        raw_response = llm.create_completion(
            prompt=prompt,
            max_tokens=2048,
            temperature=0.3, # Low temp for strict format adherence
            stop=["<|eot_id|>", "<|end_of_text|>"]
        )
        
        return {"report": raw_response["choices"][0]["text"].strip()}
    except Exception as e:
        print(f"Jargon Generation Error: {e}")
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

class LegalNoticeRequest(BaseModel):
    legal_brief: str
    notice_type: str = "general"  # general, cease_desist, demand, complaint

@app.post("/v1/generate-legal-notice")
async def generate_legal_notice(request: LegalNoticeRequest):
    try:
        print(f"--- Legal Notice Generation Started ({request.notice_type}) ---")
        
        notice_prompts = {
            "general": "Draft a formal Legal Notice",
            "cease_desist": "Draft a Cease and Desist Notice",
            "demand": "Draft a formal Demand Notice for recovery/compliance",
            "complaint": "Draft a formal Complaint Letter to the appropriate authority",
        }
        
        action = notice_prompts.get(request.notice_type, notice_prompts["general"])
        
        system_prompt = f"""You are a Senior Advocate drafting legal documents for the High Court of India.
Based on the following Legal Brief / Statutory Analysis, {action} on behalf of the aggrieved party.

Follow this exact structure:

**LEGAL NOTICE**

**To:** [Opposite Party Name/Designation - infer from the brief or use placeholder]

**From:** [Client Name - infer or use "The Aggrieved Party"]

**Date:** [Today's Date]

**Subject:** [Concise subject line based on the legal issue]

**Reference:** [Any applicable case/file references]

---

**Body of the Notice:**
- Open with "Under instructions from and on behalf of my client..."
- State the facts concisely using formal legal language
- Cite all relevant statutory provisions (IPC, BNS, CrPC, CPC, specific Acts)
- State the relief/demand clearly
- Give a timeline for compliance (typically 15-30 days)
- Warn of legal consequences for non-compliance

**Prayer/Demand:**
[Numbered list of specific demands]

**Yours faithfully,**
[Advocate Name Placeholder]
[Enrollment Number Placeholder]

Keep the tone authoritative but professional. Use proper legal terminology. Output plain text, no markdown headings."""

        prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|>\n"
        prompt += f"<|start_header_id|>user<|end_header_id|>\n\nHere is the Legal Brief to base the notice on:\n\n{request.legal_brief}<|eot_id|>\n"
        prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"

        raw_response = llm.create_completion(
            prompt=prompt,
            max_tokens=2048,
            temperature=0.3,
            stop=["<|eot_id|>", "<|end_of_text|>"]
        )
        
        return {"notice": raw_response["choices"][0]["text"].strip()}
    except Exception as e:
        print(f"Legal Notice Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "engine": "llama-cpp-python", 
        "rag_ready": law_collection.count() > 0,
        "indexed_chunks": law_collection.count()
    }
