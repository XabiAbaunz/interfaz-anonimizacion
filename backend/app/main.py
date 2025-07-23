from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import anonymize

app = FastAPI(title="API de Anonimización de CVs")

origins = [
    "http://localhost",
    "http://localhost:3000", # Puerto de desarrollo de React
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(anonymize.router, prefix="/api") 

@app.get("/")
async def root():
    return {"message": "API de Anonimización de CVs lista. Usa /api/anonymize para anonimizar."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)