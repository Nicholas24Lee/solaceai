from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    reply = f"You said: {user_message}"  # placeholder for now
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(port=5000, debug=True)