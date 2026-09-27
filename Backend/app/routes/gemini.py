"""Gemini Q&A with city-level environmental context."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..services.city_metrics import aggregate_city_metrics
from ..services.http_client import http_post_json

router = APIRouter(prefix="/gemini", tags=["Gemini"])


def _build_prompt(question: str, city: str | None, metrics: dict | None) -> str:
    ctx = f"Current environmental metrics for {city}: {metrics}" if metrics else "No city metrics available."
    return (
        "You are AirHealth India, an assistant that explains air quality and health risk "
        "in clear language for people in Indian cities.\n"
        f"{ctx}\n\nUser question: {question}"
    )


def _fallback_answer(question: str, city: str | None, metrics: dict | None) -> str:
    if not metrics:
        return (
            "I could not reach the AI model just now. Check current AQI on the dashboard "
            "and limit outdoor exertion if the category is Unhealthy or worse."
        )
    aqi = metrics.get("aqi")
    pm25 = metrics.get("pm25")
    city_label = city or "your city"
    return (
        f"Live AI is unavailable, so here is a local summary for {city_label}: "
        f"average AQI is {aqi}, PM2.5 is {pm25} µg/m³. "
        "Sensitive groups should reduce prolonged outdoor exposure when AQI is above 100. "
        f"Your question was: {question}"
    )


def _call_gemini(prompt: str) -> str:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("Gemini API key not configured")

    try:
        from google import genai

        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )
        text = getattr(response, "text", None)
        if text:
            return text
    except Exception:
        pass

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent"
    )
    data = http_post_json(
        url,
        params={"key": settings.gemini_api_key},
        json={"contents": [{"parts": [{"text": prompt}]}]},
        headers={"Content-Type": "application/json"},
        timeout=20.0,
    )
    return data["candidates"][0]["content"]["parts"][0]["text"]


@router.post("/ask", summary="Ask Gemini a question with context")
def ask_gemini_endpoint(
    question: str = Query(..., description="The user's question to be answered by Gemini"),
    city: str | None = Query(None, description="Optional city name to provide context"),
    db: Session = Depends(get_db),
):
    metrics = None
    if city:
        try:
            metrics = aggregate_city_metrics(db, city)
            if all(v is None for v in metrics.values()):
                metrics = None
        except Exception:
            metrics = None

    prompt = _build_prompt(question, city, metrics)
    try:
        answer_text = _call_gemini(prompt)
    except Exception:
        answer_text = _fallback_answer(question, city, metrics)

    return {"answer": answer_text}
