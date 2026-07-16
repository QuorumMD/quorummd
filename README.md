# QuorumMD

> The AI second opinion. Specialized agents deliberate in real time so no angle gets missed.

Medical error is the third leading cause of death in the United States. Not accidents. Not negligence. Error — the kind that happens when a brilliant physician is overworked, under-resourced, and has no one to turn to at 2 AM with a critical patient on the table.

QuorumMD convenes a board meeting of specialized AI agents the moment a physician calls in. Each agent independently analyzes the case from a different clinical angle. They deliberate. They cross-examine each other's reasoning. Then they present a unified verdict — a synthesized second opinion delivered back through the phone in seconds. The physician verifies and makes the final call.

---

## Team

| Name | Role | Stack |
|---|---|---|
| Ediale | Lead · Frontend · Infra | React · Firebase · Azure |
| Hersh Doshi | ML & RAG Pipeline | FastAPI · HuggingFace · Pinecone · Azure OpenAI |
| Aman Bollam | Evals & Product | OpenAI API · Full-Stack · Supabase |
| Ranita Rajkumar | Mobile & UX | Swift · Azure · Java · Spring Boot |

---

## Repo Structure
quorummd/
├── backend/                  # FastAPI — Hersh
│   ├── app/
│   │   ├── agents/           # Specialist AI agents (one per clinical domain)
│   │   ├── api/               # Route handlers
│   │   ├── core/               # Orchestrator, config, shared utils
│   │   └── models/           # Pydantic schemas
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # React — Ediale
│   ├── src/
│   │   ├── components/       # CaseInput, VerdictPanel
│   │   ├── pages/            # Dashboard
│   │   ├── hooks/            # useQuorum
│   │   └── services/         # API layer
│   └── index.html
└── docs/                     # PRD, architecture diagrams, research

---

## Stack

- **Inference** — Groq (Llama 3.3 70B) — switched from HuggingFace Inference Providers due to latency and free-tier credit limits
- **Vector DB** — Pinecone
- **RAG API** — FastAPI
- **Backend** — Firebase · Azure
- **Models** — HuggingFace Medical (RAG/embeddings only, not primary inference)
- **Frontend** — React

---

## Getting Started

### Backend

**macOS / Linux (bash)**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

**Windows (PowerShell)**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

### Frontend

**bash / PowerShell (same commands)**
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your keys. **Never commit `.env` to the repo.**

```
GROQ_API_KEY=
PINECONE_API_KEY=
PINECONE_ENV=
FIREBASE_PROJECT_ID=
HUGGINGFACE_API_KEY=
```

---

## Contributing

- Branch off `main` for all features: `git checkout -b feature/your-feature`
- Never push directly to `main`
- Open a PR and tag at least one other team member to review
- Keep `.env` out of commits — always