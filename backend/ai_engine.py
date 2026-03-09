import whisper
import os
import ollama
import json
import re
from typing import Any, Dict, List

print("Loading Whisper Model (this may take a moment)...")
whisper_model = whisper.load_model("base")

OLLAMA_MODEL = "gemma:7b" 

# --- CORE FUNCTIONS ---

def transcribe_audio(file_path: str) -> str:
    """
    Takes a path to an audio file (.wav, .mp3, etc.) and 
    returns the transcribed text as a string.
    """
    try:
        if not os.path.exists(file_path):
            return f"Error: File not found at {file_path}"

        print(f"👂 Transcribing file: {file_path}")
        
        result = whisper_model.transcribe(file_path)
        
        return result.get("text", "").strip()
        
    except Exception as e:
        print(f"Transcription Error: {str(e)}")
        return f"Error during transcription: {str(e)}"

def analyze_medical_transcript(transcript_text: str):
    """
   Uses Ollama (Gemma:7b) to analyze a medical transcript.
    """
    print("Analyzing transcript with Llama 3...")

    system_instruction = (
        "You are an expert medical scribe. Analyze the provided doctor-patient transcript. "
        "Return your response in strict JSON format with exactly two keys: "
        "'soap_note' and 'recommendations'. "
        "The 'soap_note' should follow the S.O.A.P format (Subjective, Objective, Assessment, Plan). "
        "The 'recommendations' should be a list of 3-5 possible diagnoses or next steps. "
        "IMPORTANT: Return ONLY raw JSON. Do not include any intro, outro, or explanations."
    )

    def _run_ollama() -> Dict[str, Any]:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {'role': 'system', 'content': system_instruction},
                {'role': 'user', 'content': f"Transcript: {transcript_text}"}
            ]
        )

        raw_content = response['message']['content'].strip()
        print(f"Raw AI Output: {raw_content[:100]}...")

        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if not match:
            raise ValueError("No JSON found in AI response")

        clean_json = match.group(0)
        analysis_data = json.loads(clean_json)
        print("AI Analysis complete.")
        return analysis_data

    try:
        return _run_ollama()
    except Exception as e:
        print(f"Error during AI analysis (attempt 1): {str(e)}")
        try:
            return _run_ollama()
        except Exception as e2:
            print(f"Error during AI analysis (attempt 2): {str(e2)}")
            return {
                "soap_note": f"Manual Analysis: {raw_content[:300] if 'raw_content' in locals() else 'No content'}",
                "recommendations": ["Check Ollama connection", "Ensure gemma:7b is pulled"]
            }


def ask_patient_self_service(
    *,
    patient_context: dict,
    question: str,
) -> str:
    """
    Patient-facing AI chat for explaining existing patient data.
    """
    system_instruction = (
        "You are a calm and clear medical information assistant for patients. "
        "Use patient context and recent consultations when relevant, but you may also provide general educational medical guidance. "
        "You can explain possible causes, common diagnostic approaches, and what doctors typically evaluate, even if exact details are not in the record. "
        "Clearly distinguish what is based on this patient record versus general information. "
        "Do not invent patient-specific facts not present in context. "
        "If data is missing, say it is not currently available in the record. "
        "Do not prescribe new medications or change existing doses. "
        "Do not diagnose with certainty; present likely possibilities with uncertainty when needed. "
        "If severe red-flag symptoms are described, advise urgent medical evaluation. "
        "Never say you cannot access records when context is provided in this prompt. "
        "Keep the response short, understandable, and supportive."
    )

    context_text = json.dumps(patient_context, ensure_ascii=False, indent=2)
    messages = [
        {"role": "system", "content": system_instruction},
        {
            "role": "user",
            "content": (
                "Patient context (JSON):\n"
                f"{context_text}\n\n"
                "Please answer this patient question using only the context above."
            ),
        },
        {"role": "user", "content": question.strip()},
    ]

    try:
        response = ollama.chat(model=OLLAMA_MODEL, messages=messages)
        answer = (response.get("message", {}) or {}).get("content", "").strip()
        if not answer:
            return "I cannot find enough information in your current record to answer that."
        return answer
    except Exception as e:
        print(f"Error during patient chat: {str(e)}")
        return "AI assistant is currently unavailable. Please try again shortly."


def summarize_patient_chat(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    transcript = "\n".join(
        [f"{m.get('role', 'unknown').upper()}: {m.get('content', '')}" for m in messages]
    )

    system_instruction = (
        "You summarize patient-AI chat in strict JSON. "
        "Return exactly keys: summary, keyPoints, warningSignals, suggestedDoctorTopics. "
        "summary is a short paragraph string. Other keys are arrays of short strings. "
        "No extra keys and no text outside JSON."
    )

    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"Chat transcript:\n{transcript}"},
            ],
        )
        raw = (response.get("message", {}) or {}).get("content", "").strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        parsed = json.loads(match.group(0)) if match else {}
        return {
            "summary": parsed.get("summary", ""),
            "keyPoints": parsed.get("keyPoints", []) or [],
            "warningSignals": parsed.get("warningSignals", []) or [],
            "suggestedDoctorTopics": parsed.get("suggestedDoctorTopics", []) or [],
        }
    except Exception as e:
        print(f"Error during patient chat summary: {str(e)}")
        return {
            "summary": "",
            "keyPoints": [],
            "warningSignals": [],
            "suggestedDoctorTopics": [],
        }


def detect_significant_patient_info(patient_message: str, ai_answer: str) -> Dict[str, Any]:
    system_instruction = (
        "You detect if a patient message contains clinically significant NEW information for a doctor review. "
        "Return strict JSON with exactly keys: shouldNotify (boolean), reason (string). "
        "No extra text."
    )

    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {
                    "role": "user",
                    "content": (
                        f"Patient message:\n{patient_message}\n\n"
                        f"AI answer:\n{ai_answer}"
                    ),
                },
            ],
        )
        raw = (response.get("message", {}) or {}).get("content", "").strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        parsed = json.loads(match.group(0)) if match else {}
        return {
            "shouldNotify": bool(parsed.get("shouldNotify", False)),
            "reason": str(parsed.get("reason", "")),
        }
    except Exception as e:
        print(f"Error during significance detection: {str(e)}")
        return {"shouldNotify": False, "reason": ""}
