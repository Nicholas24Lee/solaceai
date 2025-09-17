from flask import Flask, request, jsonify
from flask_cors import CORS
from gpt4all import GPT4All

app = Flask(__name__)
CORS(app)

# Load your GPT4All GGUF model once
model_path = "Meta-Llama-3-8B-Instruct.Q4_0.gguf"
print(f"Loading GPT4All model from: {model_path} ...")
model = GPT4All(model_path)
print("Model loaded successfully!")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message.strip():
        return jsonify({"reply": "Please send a message."})

    try:
        # Open a fresh chat session for this request
        with model.chat_session() as session:
            reply = session.generate(user_message, max_tokens=512)
    except Exception as e:
        reply = f"Error generating response: {str(e)}"

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(port=5000, debug=True)