from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

app = FastAPI(title="QuorumMD API", version="0.1.0")

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://quorummd.web.app"],  # tighten to Firebase URL before the actual pitch
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "QuorumMD API running"}

@app.get("/health")
def health():
    return {"status": "ok"}