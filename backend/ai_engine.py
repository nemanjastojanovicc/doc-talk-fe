import whisper
import os
import ollama
import json
import re

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

    try:
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
            "recommendations": ["Check Ollama connection", "Ensure gemma:7b is pulled"]
        }