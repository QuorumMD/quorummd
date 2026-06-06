# QuorumMD

> The AI second opinion. Specialized agents deliberate in real time so no angle gets missed.

Medical error is the third leading cause of death in the United States. Not accidents. Not negligence. Error — the kind that happens when a brilliant physician is overworked, under-resourced, and has no one to turn to at 2 AM with a critical patient on the table.

QuorumMD convenes a board meeting of specialized AI agents the moment a physician calls in. Each agent independently analyzes the case from a different clinical angle. They deliberate. They cross-examine each other's reasoning. Then they present a unified verdict — a synthesized second opinion delivered back through the phone in seconds. The physician verifies and makes the final call.

---

## Team

| Name | Role | Stack |
|---|---|---|
| Ediale | Lead · Frontend · Infra | React · Firebase · AWS |
| Hersh Doshi | ML & RAG Pipeline | FastAPI · HuggingFace · Pinecone · Groq |
| Aman Bollam | Evals & Product | OpenAI API · Full-Stack · Supabase |
| Ranita Rajkumar | Mobile & UX | Swift · Azure · Java · Spring Boot |

---

## Repo Structure

```
quorummd/
├── backend/                  # FastAPI — Hersh
│   ├── app/
│   │   ├── agents/           # Specialized AI agents (one per clinical domain)
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, DB connections, shared utils
│   │   └── models/           # Pydantic models / schemas
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # React — Ediale
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── public/
└── docs/                     # PRD, architecture diagrams, research
```

---

## Stack

- **Inference** — Groq
- **Vector DB** — Pinecone
- **RAG API** — FastAPI
- **Backend** — Firebase
- **Models** — HuggingFace Medical
- **Frontend** — React / Vue

---

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend
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
