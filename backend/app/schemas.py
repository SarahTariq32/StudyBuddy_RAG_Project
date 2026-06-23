from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    filename: str
    uploaded_at: str
    
    status: str = "ready"

class DocumentRenameRequest(BaseModel):
    filename: str | None = None
    name: str | None = None

class AskRequest(BaseModel):
    session_id: str
    question: str


class AskResponse(BaseModel):
    answer: str
