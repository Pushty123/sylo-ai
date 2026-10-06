import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai.routes import router as ai_router
from core.ledger import verify_chain
from core.charter import router as charter_router
app=FastAPI(title="Sylo AI")
app.add_middleware(CORSMiddleware,allow_origins=os.getenv("CORS_ORIGINS","http://localhost:5173").split(","),allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(ai_router); app.include_router(charter_router)
@app.get("/health")
def health(): return {"status":"ok","service":"sylo-ai"}
@app.get("/api/ledger/{project_id}/verify")
def ledger_verify(project_id:str):
    return verify_chain(project_id)
