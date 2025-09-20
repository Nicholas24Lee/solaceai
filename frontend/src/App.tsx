import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false); // ✅ new state
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    const initialBotMessage = { role: "bot", text: "Hello! I'm SolaceAI. How are you feeling today?" };
    setMessages([initialBotMessage]);
  }, []);  

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const messageToSend = input;
    setMessages(prev => [...prev, { role: "user", text: messageToSend }]);
    setInput("");
    setIsThinking(true);
  
    try {
      const res = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });
  
      if (!res.body) throw new Error("No response body");
  
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";
  
      // Add placeholder bot message
      setMessages(prev => [...prev, { role: "bot", text: "" }]);
  
      let firstToken = true; // ✅ track first token
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botMessage += decoder.decode(value, { stream: true });
  
        // Hide "..." once first token arrives
        if (firstToken) setIsThinking(false);
        firstToken = false;
  
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: "bot", text: botMessage };
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "bot", text: "Error contacting backend." }]);
      setIsThinking(false);
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
          {isThinking && (
            <div className="message bot">
              <span>...</span>
            </div>
          )}
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