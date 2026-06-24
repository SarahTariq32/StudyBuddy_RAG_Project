from fastapi import APIRouter, HTTPException

from app.history.chat_history import get_recent_history, save_message
from app.llm.factory import get_llm_client
from app.rag.generator import NOT_ENOUGH, generate_answer, non_rag_reply_for_small_talk
from app.rag.pipeline import retrieve_context
from app.schemas import AskRequest, AskResponse
from app.database import get_connection

router = APIRouter(tags=["chat"])

INDEXING_MESSAGE = "Your document is still indexing. Please wait a little and try again."
NO_DOCUMENT_MESSAGE = "No PDF is ready yet. Please upload a PDF and wait until it is indexed."


def _rewrite_with_history(question: str, history: list[dict]) -> str:
    if not history:
        return question

    history_lines = [
        f"{msg.get('role', '')}: {msg.get('message', '').strip()}"
        for msg in history[-6:]
        if msg.get("message")
    ]
    if not history_lines:
        return question

    prompt = (
        "Rewrite the user's latest question into a standalone search query for document retrieval. "
        "Keep names/titles explicit when the latest question uses pronouns. "
        "Return only one short rewritten query and nothing else.\n\n"
        f"Conversation:\n" + "\n".join(history_lines) + "\n"
        f"Latest question: {question}"
    )

    try:
        rewritten = get_llm_client().generate(prompt).strip()
    except Exception:
        return question

    return rewritten or question


def _documents_state() -> tuple[int, int]:
    conn = get_connection()
    try:
        ready = conn.execute("SELECT COUNT(*) FROM documents WHERE status = 'ready'").fetchone()[0]
        total = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
        return ready, total
    finally:
        conn.close()


# @router.post("/ask", response_model=AskResponse)
# def ask(body: AskRequest):
#     """
#     Full RAG chat flow:
#       1. Load recent conversation history for this session
#       2. Retrieve relevant parent chunks from Chroma (multi-query)
#       3. Build prompt with history + context + question, call LLM
#       4. Save the user question and assistant answer to SQLite
#     """
#     history = get_recent_history(body.session_id)
#     context = retrieve_context(body.question)

#     if not context:
#         answer = NOT_ENOUGH
#     else:
#         try:
#             answer = generate_answer(body.question, context, history)
#         except (RuntimeError, ValueError) as exc:
#             raise HTTPException(status_code=502, detail=str(exc)) from exc

#     save_message(body.session_id, "user", body.question)
#     save_message(body.session_id, "assistant", answer)

#     return AskResponse(answer=answer)


# ...existing code...
# @router.post("/ask", response_model=AskResponse)
# def ask(body: AskRequest):
#     """
#     Full RAG chat flow:
#       1. Load recent conversation history for this session
#       2. Retrieve relevant parent chunks from Chroma (multi-query)
#       3. Build prompt with history + context + question, call LLM
#       4. Save the user question and assistant answer to SQLite
#     """
#     history = get_recent_history(body.session_id)
#     context = retrieve_context(body.question)

#     if not context:
#         answer = NOT_ENOUGH
#     else:
#         try:
#             answer = generate_answer(body.question, context, history)
#         except Exception as exc:
#             raise HTTPException(status_code=502, detail=f"LLM error: {exc}") from exc

#     save_message(body.session_id, "user", body.question)
#     save_message(body.session_id, "assistant", answer)

#     return AskResponse(answer=answer)
# ...existing code...


# ...existing code...
@router.post("/ask", response_model=AskResponse)
def ask(body: AskRequest):
    session_id = body.session_id.strip()
    question = body.question.strip()

    if not session_id:
        raise HTTPException(status_code=422, detail="session_id is required")
    if not question:
        raise HTTPException(status_code=422, detail="question is required")

    # Save user message first, so history is preserved even if downstream fails.
    save_message(session_id, "user", question)

    # Handle lightweight chat immediately without invoking retrieval or LLM.
    small_talk_answer = non_rag_reply_for_small_talk(question)
    if small_talk_answer is not None:
        save_message(session_id, "assistant", small_talk_answer)
        return AskResponse(answer=small_talk_answer)

    ready_count, total_docs = _documents_state()
    if ready_count == 0:
        answer = INDEXING_MESSAGE if total_docs > 0 else NO_DOCUMENT_MESSAGE
        save_message(session_id, "assistant", answer)
        return AskResponse(answer=answer)

    history = get_recent_history(session_id)
    try:
        context = retrieve_context(question)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Retrieval error: {exc}") from exc

    # Second-pass retrieval: follow-up questions are often short/ambiguous
    # (for example: "what about his profession?"). If first retrieval fails,
    # blend in recent user + assistant turns to recover missing entities.
    if not context and history:
        recent_user_messages = [
            msg["message"].strip()
            for msg in history
            if msg.get("role") == "user" and msg.get("message")
        ]
        recent_assistant_messages = [
            msg["message"].strip()
            for msg in history
            if msg.get("role") == "assistant"
            and msg.get("message")
            and msg.get("message") != NOT_ENOUGH
        ]

        history_blend = []
        if recent_user_messages:
            history_blend.extend(recent_user_messages[-2:])
        if recent_assistant_messages:
            history_blend.extend(recent_assistant_messages[-1:])

        if history_blend:
            retrieval_query = _rewrite_with_history(question, history)
            expanded_query = "\n".join(history_blend + [retrieval_query])
            try:
                context = retrieve_context(expanded_query)
            except Exception as exc:
                raise HTTPException(status_code=502, detail=f"Retrieval error: {exc}") from exc

    if not context:
        answer = NOT_ENOUGH
    else:
        try:
            answer = generate_answer(question, context, history)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"LLM error: {exc}") from exc

        # Recovery pass: if retrieval returned low-quality context and the model
        # still says NOT_ENOUGH, retry once with history-expanded retrieval.
        if answer == NOT_ENOUGH and history:
            rewritten = _rewrite_with_history(question, history)
            expanded_query = "\n".join([rewritten, question])
            try:
                retry_context = retrieve_context(expanded_query)
            except Exception as exc:
                raise HTTPException(status_code=502, detail=f"Retrieval error: {exc}") from exc

            if retry_context:
                try:
                    retry_answer = generate_answer(question, retry_context, history)
                except Exception as exc:
                    raise HTTPException(status_code=502, detail=f"LLM error: {exc}") from exc

                if retry_answer:
                    answer = retry_answer

    save_message(session_id, "assistant", answer)
    return AskResponse(answer=answer)
# ...existing code...