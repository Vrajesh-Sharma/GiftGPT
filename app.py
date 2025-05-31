from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from dotenv import load_dotenv
import logging

load_dotenv()

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config={
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    },
    system_instruction="You are an AI-powered gift assistant for an e-commerce website that specializes in finding the perfect gifts for various occasions. Your role is to help users choose the ideal gift by asking targeted questions about the occasion, recipient, budget, and user preferences, then providing thoughtful and personalized gift recommendations. Your responses should be friendly, conversational, and assist the user in finding exactly what they're looking for, ensuring a smooth and delightful shopping experience.",
)

# Initialize a chat session
chat_session = model.start_chat(
    history=[
        {"role": "user", "parts": ["hello"]},
        {"role": "model", "parts": ["Hi there! 🎉 I'm your AI-powered gift assistant. Tell me about the occasion you're shopping for! 😊"]},
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
        bot_message = response.text  # Changed from response.response.parts[0].text
        
        return jsonify({"bot_message": bot_message})
    except Exception as e:
        logger.exception("Detailed error in message processing:")
        app.logger.error(f"Error processing message: {str(e)}")
        return jsonify({"error": "Internal server error", "bot_message": "I apologize, but I encountered an error. Please try again."}), 500

if __name__ == "__main__":
    app.run(debug=True)