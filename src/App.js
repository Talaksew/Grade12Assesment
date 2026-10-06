import "./styles.css";

import React, { useState, useEffect } from "react";

// REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
const API_URL = "https://script.google.com/macros/s/AKfycby1mukVWBGeZiK5L-fhtmEEKlUkQOIQRAIaw3orR8sVaAz9HNa0m0JmDWQbObmyCKfx8g/exec";

export default function App() {
  const [data, setData] = useState({ activeMode: "", tasks: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [codeSubmission, setCodeSubmission] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Get Telegram user info automatically
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user || {
    id: "123",
    first_name: "Test Student",
  };

  useEffect(() => {
    if (tg) tg.expand();
    fetch(API_URL)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  const currentTask = data.tasks[currentIndex];

  const handleSubmit = (submissionValue, score = null) => {
    const payload = {
      userId: user.id,
      userName: `${user.first_name} ${user.last_name || ""}`.trim(),
      taskType: data.activeMode,
      topic: currentTask?.topic || "General",
      submission: submissionValue,
      score: score,
    };

    fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => setSubmitted(true));
  };

  if (!data.tasks.length) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        Loading active classroom tasks...
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>🎉 Submitted Successfully!</h2>
        <p>Your response has been saved to the teacher gradebook.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "sans-serif",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <header style={{ borderBottom: "1px solid #ccc", pb: 10, mb: 20 }}>
        <small style={{ textTransform: "uppercase", color: "#666" }}>
          {data.activeMode} Mode
        </small>
        <h3>{currentTask.topic}</h3>
      </header>

      <h4>{currentTask.prompt}</h4>

      {/* RENDER QUIZ / HOMEWORK CHOICES */}
      {data.activeMode === "Quiz" || data.activeMode === "Homework" ? (
        <div>
          {currentTask.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              style={{
                display: "block",
                width: "100%",
                margin: "8px 0",
                padding: "12px",
                backgroundColor: selectedOption === idx ? "#0088cc" : "#f0f0f0",
                color: selectedOption === idx ? "#fff" : "#000",
                border: "none",
                borderRadius: "6px",
                textAlign: "left",
              }}
            >
              {opt}
            </button>
          ))}
          <button
            disabled={selectedOption === null}
            onClick={() => {
              const isCorrect = selectedOption === currentTask.correctIndex;
              handleSubmit(
                `Selected Option: ${selectedOption}`,
                isCorrect ? 100 : 0
              );
            }}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "12px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Submit Answer
          </button>
        </div>
      ) : null}

      {/* RENDER CODE / ASSIGNMENT INPUT */}
      {data.activeMode === "Assignment" ? (
        <div>
          <textarea
            rows="8"
            placeholder="Type or paste your HTML/CSS code here..."
            value={codeSubmission}
            onChange={(e) => setCodeSubmission(e.target.value)}
            style={{ width: "100%", fontFamily: "monospace", padding: "10px" }}
          />
          <button
            disabled={!codeSubmission.trim()}
            onClick={() => handleSubmit(codeSubmission)}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "12px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Submit Assignment Code
          </button>
        </div>
      ) : null}
    </div>
  );
}
