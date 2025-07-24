from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.utils.anonymize_core import anonymize_cv_content
from app.utils.anonymize_core import refine_anonymization_content

router = APIRouter()

class AnonymizeRequest(BaseModel):
    cvContent: str
    ollamaEndpoint: str
    ollamaKey: str

class AnonymizeResponse(BaseModel):
    entidades: dict[str, str]

class RefineAnonymizeRequest(BaseModel):
    cvContent: str
    currentMapping: dict[str, str]
    userInstruction: str
    ollamaEndpoint: str
    ollamaKey: str

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

@router.post("/refine_anonymization", response_model=AnonymizeResponse)
async def refine_anonymization_endpoint(request: RefineAnonymizeRequest):
    try:
        refined_mapping = refine_anonymization_content(
            cv_content=request.cvContent,
            current_mapping=request.currentMapping,
            user_instruction=request.userInstruction,
            ollama_endpoint=request.ollamaEndpoint,
            ollama_key=request.ollamaKey
        )
        return AnonymizeResponse(entidades=refined_mapping)
    except Exception as e:
        print(f"Error in refine_anonymization_endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error while refining anonymization: {str(e)}"
        )
