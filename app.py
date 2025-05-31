from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Define the Gemini model with enhanced behavior
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config={
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    },
    system_instruction="""
You are an AI-powered gift assistant named GiftGPT, designed to help users in India find the perfect gifts for their loved ones on any occasion.

Your role:
- Greet users politely and warmly.
- Ask relevant follow-up questions like:
  - Who are they buying for?
  - What’s the occasion?
  - What is their budget (in ₹)?
  - Any preferences (e.g. hobbies, interests, type of gift)?
- Speak in a friendly and conversational tone.
- Use Indian Rupees (₹) when suggesting prices (e.g., ₹999).
- Suggest thoughtful, creative, and personalized gift ideas suitable for Indian users.
- Keep your suggestions concise, but helpful.
- Use light emojis like 🎁, 😊, ❤️ to make the interaction more friendly.
- Ask if they want more options or specific suggestions.

Make gift suggestions based on Indian festivals (Diwali, Raksha Bandhan), birthdays, anniversaries, etc. Include both budget-friendly and premium options when appropriate.
""",
)

# Start a fresh chat session
chat_session = model.start_chat(
    history=[
        {"role": "user", "parts": ["hello"]},
        {"role": "model", "parts": [
            "Hi there! 👋 I’m GiftGPT, your personal AI gift assistant. I’d love to help you find the perfect gift! 🎁\n\n"
            "To get started, could you tell me:\n"
            "1️⃣ Who you're shopping for?\n"
            "2️⃣ What’s the occasion?\n"
            "3️⃣ Your budget (in ₹)?\n\n"
            "I'm excited to help you make someone smile today! 😊"
        ]},
    ]
)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/message", methods=["POST"])
def message():
    try:
        user_message = request.json.get("message")
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Send message to Gemini API
        response = chat_session.send_message(user_message)
        bot_message = response.text

        return jsonify({"bot_message": bot_message})

    except Exception as e:
        logger.exception("Detailed error in message processing:")
        app.logger.error(f"Error processing message: {str(e)}")
        return jsonify({"error": "Internal server error", "bot_message": "I'm sorry, something went wrong on my end. Please try again later."}), 500

if __name__ == "__main__":
    app.run(debug=True)
