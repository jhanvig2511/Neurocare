# app.py

from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from pydub import AudioSegment
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from autocorrect import Speller
import emoji
import re
import whisper
from gtts import gTTS
import uuid
import os

# =========================
# APP SETUP
# =========================
app = FastAPI(title="NeuroCare AI - Smart Mental Health Bot")

# Serve audio files
app.mount("/audio", StaticFiles(directory="."), name="audio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# MODELS
# =========================
emotion_model = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None
)

whisper_model = whisper.load_model("base")
spell = Speller(lang="en")

# =========================
# MEMORY
# =========================
conversation_history = {}

# =========================
# INPUT SCHEMA
# =========================
class Message(BaseModel):
    session_id: str
    message: str

# =========================
# CONSTANTS
# =========================
CRISIS_WORDS = [
    "suicide", "kill myself", "end my life",
    "want to die", "die", "hopeless",
    "no reason to live"
]

CONTACT_KEYWORDS = [
    "doctor", "psychiatrist", "counsellor",
    "contact", "help number", "phone", "ph no",
    "call", "consult"
]

SHARE_KEYWORDS = [
    "share", "tell something", "can i tell",
    "i want to talk", "i want to say"
]

POSITIVE_EMOTIONS = [
    "joy", "approval", "love", "admiration", "gratitude"
]

# =========================
# PREPROCESSING
# =========================
def preprocess(text: str) -> str:
    text = text.lower()
    text = spell(text)
    text = emoji.demojize(text)
    text = re.sub(r"(.)\1{2,}", r"\1", text)
    return text.strip()

# =========================
# HELPERS
# =========================
def is_crisis(text: str) -> bool:
    return any(word in text for word in CRISIS_WORDS)

def is_asking_for_contact(text: str) -> bool:
    return any(word in text for word in CONTACT_KEYWORDS)

def user_wants_to_share(text: str) -> bool:
    return any(word in text for word in SHARE_KEYWORDS)

# =========================
# CONTACT DETAILS
# =========================
def psychiatrist_contact():
    return (
        "🧑‍⚕️ Psychiatrist Contact:\n"
        "• Dr. Lovely Verma\n"
        "• 📞 +91 9717101995"
    )

def counsellor_contact():
    return (
        "🚨 Crisis Counsellor Support:\n"
        "• Dr. Shivam Mehta\n"
        "• 📞 +91 9667978445"
    )

# =========================
# EMOTION → CONDITION
# =========================
def map_condition(emotion: str) -> str:
    if emotion == "sadness":
        return "depression"
    if emotion == "fear":
        return "anxiety"
    if emotion == "anger":
        return "anger"
    if emotion in POSITIVE_EMOTIONS:
        return "happy"
    return "stress"

# =========================
# SUGGESTIONS ENGINE
# =========================
def get_suggestions(condition: str) -> str:

    responses = {
        "depression": (
            "I'm really sorry you're going through this. 💛\n"
            "Here are a few things that might help:\n"
            "• Do one small task today\n"
            "• Talk to someone you trust\n"
            "• Take a 2-minute walk\n"
            "• Write down your thoughts"
        ),
        "anxiety": (
            "It sounds like you're feeling anxious. 😟\n"
            "Try:\n"
            "• Deep breathing (4s in, 6s out)\n"
            "• Grounding: name 5 things\n"
            "• Focus only on what's in your control"
        ),
        "anger": (
            "I sense frustration. 😠\n"
            "Try:\n"
            "• Pause before reacting\n"
            "• Step away briefly\n"
            "• Take 10 slow breaths"
        ),
        "stress": (
            "You're going through something stressful. 😔\n"
            "Try:\n"
            "• Short break\n"
            "• Light stretching\n"
            "• One task at a time"
        ),
        "happy": (
            "That's wonderful! 😄💚\n"
            "I'm glad you're feeling good.\n"
            "Keep it up!"
        )
    }

    return responses.get(condition, responses["stress"])

# =========================
# MAIN RESPONSE ENGINE
# =========================
def generate_response(session_id: str, text: str, emotion: str) -> str:

    if is_crisis(text):
        return (
            "I'm really sorry you're feeling this way. 💔\n"
            "You matter. Please reach out:\n\n"
            + counsellor_contact()
        )

    if user_wants_to_share(text):
        return "Of course 💛. I'm here for you. Tell me anything."

    if is_asking_for_contact(text):
        return psychiatrist_contact()

    condition = map_condition(emotion)
    return get_suggestions(condition)

# =========================
# TEXT CHAT ROUTE
# =========================
@app.post("/chat")
def chat(data: Message):

    session_id = data.session_id
    raw_text = data.message
    clean_text = preprocess(raw_text)

    try:
        result = emotion_model(clean_text)[0]
        emotion = max(result, key=lambda x: x["score"])["label"]
    except:
        emotion = "neutral"

    reply = generate_response(session_id, clean_text, emotion)

    return {"emotion": emotion, "bot": reply}

# =========================
# VOICE CHAT ROUTE
# =========================
@app.post("/voice-chat")
async def voice_chat(audio: UploadFile = File(...)):

    session_id = "voice-user"

    # Save audio
    audio_path = f"temp_{uuid.uuid4()}.wav"
    with open(audio_path, "wb") as f:
        f.write(await audio.read())

    # STT
    result = whisper_model.transcribe(audio_path)
    user_text = result["text"].strip()

    # Emotion
    try:
        emo = emotion_model(user_text)[0]
        emotion = max(emo, key=lambda x: x["score"])["label"]
    except:
        emotion = "neutral"

    # Generate reply
    reply_text = generate_response(session_id, user_text.lower(), emotion)

    # TTS
    audio_output = f"tts_{uuid.uuid4()}.mp3"
    tts = gTTS(reply_text)
    tts.save(audio_output)

    os.remove(audio_path)

    return {
        "user_text": user_text,
        "emotion": emotion,
        "bot_text": reply_text,
        "audio_url": f"http://localhost:8000/audio/{audio_output}"
    }

# =========================
# ROOT
# =========================
@app.get("/")
def home():
    return {"status": "Bot running 🚀"}