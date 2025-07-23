from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.utils.anonymize_core import anonymize_cv_content

router = APIRouter()

class AnonymizeRequest(BaseModel):
    cvContent: str
    ollamaEndpoint: str
    ollamaKey: str

class AnonymizeResponse(BaseModel):
    entidades: dict[str, str]

@router.post("/anonymize", response_model=AnonymizeResponse)
async def anonymize_cv_endpoint(request: AnonymizeRequest):
    try:
        entidades = anonymize_cv_content(
            cv_content=request.cvContent,
            ollama_endpoint=request.ollamaEndpoint,
            ollama_key=request.ollamaKey
        )
        return AnonymizeResponse(entidades=entidades)   
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor al procesar el CV: {str(e)}"
        )
