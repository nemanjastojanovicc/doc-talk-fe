import whisper
import os
import ollama  # Ensure this is at the top with other imports
import json    # Needed to parse the AI's response
import re # We use this to find JSON in the AI's text
# --- AI SETUP ---

# We load the model GLOBALLY so it only loads once when the server starts.
# 'base' is the best balance of speed and accuracy for a laptop.
# If it's too slow, you can change this to 'tiny'.
print("🚀 Loading Whisper Model (this may take a moment)...")
whisper_model = whisper.load_model("base")

# Define the Ollama model we will use later
OLLAMA_MODEL = "gemma:7b" 

# --- CORE FUNCTIONS ---

def transcribe_audio(file_path: str) -> str:
    """
    Takes a path to an audio file (.wav, .mp3, etc.) and 
    returns the transcribed text as a string.
    """
    try:
        # Check if the file actually exists before trying to transcribe
        if not os.path.exists(file_path):
            return f"Error: File not found at {file_path}"

        print(f"👂 Transcribing file: {file_path}")
        
        # The transcribe function handles the heavy lifting
        # It automatically detects the language and converts speech to text
        result = whisper_model.transcribe(file_path)
        
        # The result is a dictionary; we only need the 'text' key
        raw_text = result.get("text", "").strip()
        
        print("✅ Transcription complete.")
        return raw_text

    except Exception as e:
        # If something goes wrong (like a memory issue or corrupted file), 
        # we catch the error so the whole server doesn't crash.
        print(f"❌ Transcription Error: {str(e)}")
        return f"Error during transcription: {str(e)}"

### 💡 What this code does:
"""
1.  **Imports**: It brings in `whisper` for speech-to-text and `ollama` for the analysis we will do later.
2.  **Model Loading**: It loads the `base` model into your computer's memory one time. This prevents the "lag" that would happen if you tried to load it every time a doctor clicked a button.
3.  **`transcribe_audio`**:
    *   It checks for the file first (safety check).
    *   It uses `whisper_model.transcribe()` to turn the sound into text.[[1]
"""
def analyze_medical_transcript(transcript_text: str):
    """
   Uses Ollama (Gemma:7b) to analyze a medical transcript.
    """
    print("🧠 Analyzing transcript with Llama 3...")

    # The System Prompt tells the AI exactly how to behave.
    # We force it to return JSON so our Python code can read it easily.
    system_instruction = (
        "You are an expert medical scribe. Analyze the provided doctor-patient transcript. "
        "Return your response in strict JSON format with exactly two keys: "
        "'soap_note' and 'recommendations'. "
        "The 'soap_note' should follow the S.O.A.P format (Subjective, Objective, Assessment, Plan). "
        "The 'recommendations' should be a list of 3-5 possible diagnoses or next steps. "
        "IMPORTANT: Return ONLY raw JSON. Do not include any intro, outro, or explanations."
    )

    try:
        # Call the local Ollama service
        response = ollama.chat(
            model=OLLAMA_MODEL, 
            messages=[
                {'role': 'system', 'content': system_instruction},
                {'role': 'user', 'content': f"Transcript: {transcript_text}"}
            ]
        )

        # Get the text content from the AI response
        raw_content = response['message']['content'].strip()

         # DEBUG: See what the AI actually said
        print(f"🤖 Raw AI Output: {raw_content[:100]}...")

        # CHANGE: Use Regex to find the JSON object. 
        # This is much safer for Gemma than using .split()
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        
        if match:
            clean_json = match.group(0)
            analysis_data = json.loads(clean_json)
            print("✅ AI Analysis complete.")
            return analysis_data
        else:
            raise ValueError("No JSON found in AI response")

    except Exception as e:
        print(f"❌ Error during AI analysis: {str(e)}")
        # Fallback so the backend doesn't return "Internal analysis error"
        return {
            "soap_note": f"Manual Analysis: {raw_content[:300] if 'raw_content' in locals() else 'No content'}",
            "recommendations": ["Check Ollama connection", "Ensure gemma:7b is pulled"]
        }