from flask import Flask, request, Response
from flask_cors import CORS
from gpt4all import GPT4All

app = Flask(__name__)
CORS(app)

model_path = "Meta-Llama-3-8B-Instruct.Q4_0.gguf"
model = GPT4All(model_path)

conversation_history = [
    {"role": "system", 
    "content": (
            "You are SolaceAI, a compassionate therapy assistant. "
            "Respond as if you were a thoughtful human therapist: empathetic, supportive, and encouraging. "
            "Keep your answers clear, concise, and conversational so the user feels truly heard and understood. "
        )
    }
]

@app.route("/api/chat", methods=["POST"])
def chat():
    global conversation_history
    data = request.get_json()
    user_message = data.get("message", "")
    conversation_history.append({"role": "user", "content": user_message})

    system_message = conversation_history[0]
    conversation_history = [system_message] + conversation_history[-5:]

    prompt = "".join(f"{m['role']}: {m['content']}\n" for m in conversation_history) + "bot:"

    def generate():
        try:
            with model.chat_session() as session:
                for token in session.generate(prompt, max_tokens=32, streaming=True):
                    yield token
        except Exception as e:
            yield f"[Error: {str(e)}]"

    return Response(generate(), mimetype="text/plain")

if __name__ == "__main__":
    app.run(port=5000, debug=True)
