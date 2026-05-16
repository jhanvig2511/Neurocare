from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from gtts import gTTS
import whisper
import shutil
import uuid
import os

app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# FOLDERS
# =========================
AUDIO_DIR = "audio_files"
RECORD_DIR = "recordings"

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(RECORD_DIR, exist_ok=True)

# =========================
# LOAD WHISPER MODEL
# =========================
model = whisper.load_model("base")

# =========================
# CHATBOT LOGIC
# =========================
def chatbot_reply(message):

    msg = message.lower()

    if "hello" in msg or "hi" in msg:
        return "Hello! How are you feeling today?"

    if "sad" in msg:
        return "I'm sorry you're feeling sad. I'm here for you."

    if "anxiety" in msg:
        return "Anxiety can feel overwhelming. Try taking slow breaths."

    if "stress" in msg:
        return "Stress can be difficult. Take a small break and relax."

    return "I'm listening. Tell me more."

# =========================
# VOICE CHAT API
# =========================
@app.post("/voicechat")
async def voicechat(file: UploadFile = File(...)):

    try:

        # SAVE USER RECORDING
        file_name = f"{uuid.uuid4()}.webm"
        file_path = os.path.join(RECORD_DIR, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # =========================
        # SPEECH TO TEXT
        # =========================
        result = model.transcribe(file_path)

        user_text = result["text"]

        print("USER SAID:", user_text)

        # =========================
        # BOT REPLY
        # =========================
        reply = chatbot_reply(user_text)

        # =========================
        # TEXT TO SPEECH
        # =========================
        audio_name = f"{uuid.uuid4()}.mp3"
        audio_path = os.path.join(AUDIO_DIR, audio_name)

        tts = gTTS(text=reply, lang="en")
        tts.save(audio_path)

        return {
            "user_text": user_text,
            "reply": reply,
            "audio_url": f"http://localhost:8000/audio/{audio_name}"
        }

    except Exception as e:
        print(e)
        return {
            "user_text": "",
            "reply": "Backend Error",
            "audio_url": ""
        }

# =========================
# AUDIO ROUTE
# =========================
@app.get("/audio/{filename}")
def get_audio(filename: str):
    return FileResponse(
        os.path.join(AUDIO_DIR, filename),
        media_type="audio/mpeg"
    )

# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {"message": "Voice Backend Running"}