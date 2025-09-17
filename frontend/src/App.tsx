import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", text: input }]);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      setInput("");
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "bot", text: "Error contacting backend." }]);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-box">
        <h2 className="chat-header">SolaceAI</h2>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <span>{m.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;