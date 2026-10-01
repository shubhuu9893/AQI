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
    ctx = f"Current environmental metrics for {city}: {metrics}" if (metrics and city and city != "World") else "Global environmental overview."
    return (
        "You are AirHealth Assistant, an expert environmental and air quality assistant.\n"
        "Explain air quality, pollutant levels (PM2.5, PM10, NO2, O3, CO, SO2), and health impacts "
        "in clean, clear, professional language.\n"
        "IMPORTANT FORMATTING INSTRUCTION: Do NOT use markdown symbols such as asterisks (*** or **) or heading hashtags (##, ###). "
        "Format headers simply with plain text lines or standard capitalization, and use clean bullet dashes (-) without bold asterisks.\n"
        f"{ctx}\n\nUser question: {question}"
    )


def _fallback_answer(question: str, city: str | None, metrics: dict | None) -> str:
    if not metrics:
        return (
            "I could not reach the live AI service at this moment. "
            "Please check current AQI values directly on the map or dashboard. "
            "If AQI is above 100, sensitive individuals should reduce prolonged outdoor exertion. "
            "If above 150, everyone should consider wearing a mask outdoors."
        )
    aqi = metrics.get("aqi")
    pm25 = metrics.get("pm25")
    city_label = city if (city and city != "World") else "your area"
    return (
        f"Live AI is currently taking longer than usual. For {city_label}: "
        f"recorded AQI is {aqi}, PM2.5 is {pm25} µg/m³. "
        "When AQI exceeds 100, limit strenuous outdoor activity."
    )



def _call_gemini(prompt: str) -> str:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("Gemini API key not configured")

    models_to_try = [settings.gemini_model, "gemini-3.6-flash", "gemini-3.7-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    seen = set()
    models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    last_error = None
    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            data = http_post_json(
                url,
                params={"key": settings.gemini_api_key},
                json={"contents": [{"parts": [{"text": prompt}]}]},
                headers={"Content-Type": "application/json"},
                timeout=20.0,
            )
            candidates = data.get("candidates") or []
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts and "text" in parts[0]:
                    return parts[0]["text"]
        except Exception as exc:
            last_error = exc
            continue

    if last_error:
        raise last_error
    raise RuntimeError("No candidate text returned by Gemini")


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
