"""
Confidence scoring helpers.

Self-reported confidence from an LLM ("pick a number 0-100") is a weak signal on its own --
models tend to cluster around similar "plausible-sounding" numbers regardless of how well the
case actually fits their specialty. To ground the score in something measurable, we blend the
model's self-report with a deterministic relevance score computed from keyword overlap between
the case text and a per-specialty vocabulary. This guarantees agents differentiate based on real
case content instead of coincidentally matching LLM outputs.
"""

SPECIALTY_KEYWORDS = {
    "cardiology": [
        "chest pain", "heart", "cardiac", "palpitation", "blood pressure", "hypertension",
        "arrhythmia", "murmur", "ecg", "ekg", "shortness of breath", "edema", "syncope",
        "chest tightness", "pulse", "cholesterol",
    ],
    "neurology": [
        "headache", "migraine", "seizure", "numbness", "weakness", "dizziness", "vision",
        "brain", "stroke", "confusion", "tremor", "balance", "speech", "tingling",
        "memory", "consciousness",
    ],
    "infectious disease": [
        "fever", "infection", "rash", "travel", "cough", "sore throat", "exposure",
        "chills", "diarrhea", "vomiting", "antibiotic", "contagious", "night sweats",
        "swollen lymph", "sepsis",
    ],
    "general medicine": [
        "fatigue", "weight loss", "weight gain", "appetite", "nausea", "malaise",
        "generalized", "tired", "sleep", "unspecified", "routine", "check-up",
        "energy", "stress",
    ],
}


def relevance_score(case, specialty: str) -> float:
    """
    Ratio of specialty keywords present in the case text, normalized so that roughly a third of
    a specialty's vocabulary showing up yields a high score. Clamped to [0.05, 0.95] so it never
    fully zeroes out or saturates a specialty regardless of confidence blending weight.
    """
    keywords = SPECIALTY_KEYWORDS.get(specialty, [])
    if not keywords:
        return 0.5

    text = " ".join(
        filter(None, [case.case_description, case.additional_context])
    ).lower()

    hits = sum(1 for kw in keywords if kw in text)
    ratio = hits / max(3, len(keywords) * 0.35)
    return round(min(0.95, max(0.05, ratio)), 3)


def blend_confidence(llm_confidence: float, relevance: float, llm_weight: float = 0.65) -> float:
    """Weighted blend of the model's self-reported confidence and the relevance score."""
    blended = llm_weight * llm_confidence + (1 - llm_weight) * relevance
    return round(min(0.99, max(0.01, blended)), 2)
