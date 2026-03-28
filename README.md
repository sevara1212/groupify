# Groupify

AI-powered group assignment planner. Upload a rubric, run a team quiz, get a fair task allocation.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Python | 3.10+ |
| Supabase CLI | latest |

Install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

---

## Setup

**1. Fill in environment variables**

Edit `groupify/.env` with your real values — never commit `.env`:
```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_API_URL=http://localhost:8000/api
```

**2. Install Python dependencies**
```bash
cd groupify/backend
pip install -r requirements.txt
```

**3. Install frontend dependencies**
```bash
cd groupify
npm install
```

---

## Run

Open two terminals simultaneously:

**Terminal 1 — API server**
```bash
cd groupify/backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend dev server**
```bash
cd groupify
npm run dev
```

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

---

## Supabase Migration

Link your project and push the schema:
```bash
supabase link --project-ref wzhlzyzfmydqkolbhpbj
supabase db push
```

---

## Test the Flow

1. Open **http://localhost:5173**
2. Click **Create a Project** → fill in project details
3. Upload your assignment brief and marking rubric PDF
4. Copy the invite link and share with team members
5. Each member takes the quiz at **/quiz**
6. View the AI-generated allocation at **/allocation**
7. Click **Accept Plan** → redirected to **/dashboard**
8. Check **Supabase Table Editor** to see all saved data

---

## Project Structure

```
groupify/
├── src/
│   ├── screens/        # Page-level components
│   ├── components/
│   │   ├── ui/         # Button, Card, Badge, Avatar, ProgressBar
│   │   └── layout/     # TopNav
│   ├── context/        # ProjectContext (projectId, memberId)
│   └── styles/         # tokens.js (colors, member colors, status config)
├── backend/
│   ├── main.py         # FastAPI app + CORS
│   ├── db.py           # Supabase client
│   └── routers/
│       ├── projects.py           # CRUD
│       ├── rubric_extraction.py  # Claude extracts criteria from PDF
│       ├── quiz_generation.py    # Claude generates + stores quiz questions
│       ├── allocation.py         # Skill-scored greedy allocation + Claude rationales
│       └── risks.py              # Overdue / at-risk / imbalance detection
└── supabase/
    └── migrations/     # SQL migrations pushed via supabase db push
```

---

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/projects` | Create project |
| `POST` | `/api/projects/{id}/upload` | Upload brief + rubric, extract criteria |
| `POST` | `/api/projects/{id}/quiz/generate` | Generate 5 quiz questions via Claude |
| `GET`  | `/api/projects/{id}/quiz/questions` | Fetch questions |
| `POST` | `/api/projects/{id}/quiz/answers/{member_id}` | Submit quiz answers |
| `POST` | `/api/projects/{id}/allocate` | Run AI allocation (preview) |
| `POST` | `/api/projects/{id}/allocate/confirm` | Save tasks to DB |
| `GET`  | `/api/projects/{id}/risks` | Detect + return risk alerts |
| `POST` | `/risks/{alert_id}/dismiss` | Dismiss an alert |
| `POST` | `/api/projects/{id}/rebalance` | Propose task rebalance |
| `POST` | `/api/projects/{id}/rebalance/confirm` | Apply rebalance |
