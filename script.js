const chatbotBox = document.getElementById("chatbot-box");
const messages = document.getElementById("chatbot-messages");
const input = document.getElementById("chatbot-input");

// Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

// Conversation history for context
let conversationHistory = [];

function toggleChat() {
  chatbotBox.style.display = chatbotBox.style.display === "flex" ? "none" : "flex";
  
  // Focus on input when opening chat
  if (chatbotBox.style.display === "flex") {
    input.focus();
  }
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // Add user message to UI
  addMessage(text, "user");
  input.value = "";
  
  // Add to conversation history
  conversationHistory.push({ role: 'user', content: text });

  // Show typing indicator
  const typingIndicator = addTypingIndicator();

  try {
    // Send message to backend
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        conversationHistory: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Remove typing indicator
    typingIndicator.remove();
    
    // Add bot response
    addMessage(data.reply, "bot", data.emotion);
    
    // Add to conversation history
    conversationHistory.push({ role: 'assistant', content: data.reply });
    
    // Keep conversation history manageable (last 10 messages)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

  } catch (error) {
    console.error('Error sending message:', error);
    typingIndicator.remove();
    
    // Fallback to local responses if backend is unavailable
    const fallbackReply = getFallbackResponse(text);
    addMessage(fallbackReply, "bot");
  }
}

function addMessage(text, sender, emotion = null) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  
  // Handle multiline text
  div.innerHTML = text.replace(/\n/g, '<br>');
  
  // Add emotion indicator if present
  if (emotion && sender === "bot") {
    div.setAttribute('data-emotion', emotion);
  }
  
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  
  return div;
}

function addTypingIndicator() {
  const div = document.createElement("div");
  div.classList.add("message", "bot", "typing-indicator");
  div.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function getFallbackResponse(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("sad") || lowerText.includes("down")) {
    return "I'm here for you 💜 It's okay to feel sad sometimes. Would you like to talk about what's making you feel this way?";
  } else if (lowerText.includes("happy") || lowerText.includes("great")) {
    return "That's wonderful! 🌈 I'm so glad you're feeling happy. Keep that positive energy flowing!";
  } else if (lowerText.includes("anxious") || lowerText.includes("anxiety") || lowerText.includes("worried")) {
    return "Anxiety can feel overwhelming, but you're not alone. Try this: Take a deep breath in for 4 counts, hold for 4, exhale for 4. 🌬️";
  } else if (lowerText.includes("stress") || lowerText.includes("stressed")) {
    return "Try this breathing technique: Inhale for 4 seconds, hold for 4, exhale for 6. This activates your calm response. 🌬️";
  } else if (lowerText.includes("help") || lowerText.includes("crisis")) {
    return "If you need immediate help, please call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. I'm here to support you too. 💜";
  } else {
    return "I'm listening 👂 Tell me more about what's on your mind. I'm here for you. 💙";
  }
}

// Handle Enter key press
input.addEventListener('keypress', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// Load daily affirmation on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(`${API_URL}/affirmation`);
    if (response.ok) {
      const data = await response.json();
      console.log('Daily affirmation:', data.affirmation);
    }
  } catch (error) {
    console.log('Could not load daily affirmation');
  }
});

// Service worker for offline support (optional enhancement)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service worker registration optional');
    });
  });
}
