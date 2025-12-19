from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routes
from routes.syllabus_upload import router as syllabus_upload_router
from routes.syllabus_structure import router as syllabus_structure_router
from routes.practice import router as practice_router

app = FastAPI(title="PREPX API")

# --- CORS Configuration (for frontend access) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # OK for MVP / hackathon
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health Check ---
@app.get("/health")
def health():
    return {"status": "PREPX backend running"}

# --- Register API Routes ---
app.include_router(syllabus_upload_router)
app.include_router(syllabus_structure_router)
app.include_router(practice_router)
