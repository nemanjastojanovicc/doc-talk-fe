import os
import json
import re
from typing import Any, Dict, List
from huggingface_hub import InferenceClient

# HuggingFace API setup
HF_WHISPER_TOKEN = os.environ.get("HF_WHISPER_TOKEN", "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")
HF_GEMMA_TOKEN = os.environ.get("HF_GEMMA_TOKEN", "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")

whisper_client = InferenceClient(token=HF_WHISPER_TOKEN)
gemma_client = InferenceClient(token=HF_GEMMA_TOKEN)

print("Using HuggingFace APIs for transcription and LLM...")

GEMMA_MODEL = "google/gemma-2-9b-it" 

def transcribe_audio(file_path: str) -> str:
    """
    Takes a path to an audio file (.wav, .mp3, etc.) and 
    returns the transcribed text using HuggingFace Whisper API.
    """
    try:
        if not os.path.exists(file_path):
            return f"Error: File not found at {file_path}"

        print(f"👂 Transcribing file via HuggingFace: {file_path}")
        
        with open(file_path, "rb") as audio_file:
            audio_data = audio_file.read()
        
        result = whisper_client.automatic_speech_recognition(
            audio_data,
            model="openai/whisper-large-v3"
        )
        
        # Handle both dict and string responses
        if isinstance(result, dict):
            return result.get("text", "").strip()
        return str(result).strip()
        
    except Exception as e:
        print(f"Transcription Error: {str(e)}")
        return f"Error during transcription: {str(e)}"

def analyze_medical_transcript(transcript_text: str):
    """
    Uses HuggingFace Gemma to analyze a medical transcript.
    """
    print("Analyzing transcript with Gemma via HuggingFace...")

    system_instruction = (
        "You are an expert medical scribe. Analyze the provided doctor-patient transcript. "
        "Return your response in strict JSON format with exactly two keys: "
        "'soap_note' and 'recommendations'. "
        "The 'soap_note' should follow the S.O.A.P format (Subjective, Objective, Assessment, Plan). "
        "The 'recommendations' should be a list of 3-5 possible diagnoses or next steps. "
        "IMPORTANT: Return ONLY raw JSON. Do not include any intro, outro, or explanations."
    )

    try:
        response = gemma_client.chat_completion(
            model=GEMMA_MODEL,
            messages=[
                {'role': 'system', 'content': system_instruction},
                {'role': 'user', 'content': f"Transcript: {transcript_text}"}
            ],
            max_tokens=1024
        )

        raw_content = response.choices[0].message.content.strip()

        print(f"Raw AI Output: {raw_content[:100]}...")

        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        
        if match:
            clean_json = match.group(0)
            analysis_data = json.loads(clean_json)
            print("AI Analysis complete.")
            return analysis_data
        else:
            raise ValueError("No JSON found in AI response")

    except Exception as e:
        print(f"Error during AI analysis: {str(e)}")
        return {
            "soap_note": f"Manual Analysis: {raw_content[:300] if 'raw_content' in locals() else 'No content'}",
            "recommendations": ["Check HuggingFace API connection", "Verify API token"]
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
        response = gemma_client.chat_completion(model=GEMMA_MODEL, messages=messages, max_tokens=512)
        answer = response.choices[0].message.content.strip() if response.choices else ""
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
        response = gemma_client.chat_completion(
            model=GEMMA_MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"Chat transcript:\n{transcript}"},
            ],
            max_tokens=512
        )
        raw = response.choices[0].message.content.strip() if response.choices else ""
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
        response = gemma_client.chat_completion(
            model=GEMMA_MODEL,
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
            max_tokens=256
        )
        raw = response.choices[0].message.content.strip() if response.choices else ""
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        parsed = json.loads(match.group(0)) if match else {}
        return {
            "shouldNotify": bool(parsed.get("shouldNotify", False)),
            "reason": str(parsed.get("reason", "")),
        }
    except Exception as e:
        print(f"Error during significance detection: {str(e)}")
        return {"shouldNotify": False, "reason": ""}