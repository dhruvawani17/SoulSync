# SoulSync 💜

Your AI-powered mental health companion — here to listen, support, and guide you.

## 🌟 Features

- **24/7 Emotional Support**: AI-powered chatbot that provides empathetic responses
- **Mindfulness Resources**: Breathing exercises and meditation guidance
- **Crisis Detection**: Immediate crisis resource recommendations
- **Multi-page Navigation**: Seamless browsing experience
- **Responsive Design**: Works on all devices
- **Privacy-Focused**: Anonymous conversations, no data stored

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Shravanidhuri/SoulSync.git
cd SoulSync
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🛠️ Development Mode

For development with auto-reload:

```bash
npm run dev
```

## 📁 Project Structure

```
SoulSync/
├── index.html          # Main landing page
├── about.html          # About page
├── features.html       # Features page
├── contact.html        # Contact page
├── style.css           # Global styles
├── script.js           # Frontend JavaScript
├── server.js           # Express server
├── package.json        # Dependencies
├── .env               # Environment variables
├── routes/
│   └── chatbot.js     # Chatbot API endpoints
└── README.md          # This file
```

## 🔧 Configuration

The chatbot currently uses an intelligent rule-based system. To integrate with AI services:

1. Get an API key from:
   - [OpenAI](https://platform.openai.com/api-keys)
   - [Hugging Face](https://huggingface.co/settings/tokens)
   - [Cohere](https://dashboard.cohere.com/api-keys)

2. Add your key to `.env`:
```env
OPENAI_API_KEY=your_key_here
AI_SERVICE=openai
```

3. The backend will automatically use the configured AI service.

## 🎯 API Endpoints

- `POST /api/chat` - Send a message to the chatbot
- `GET /api/resources` - Get mental health resources
- `GET /api/affirmation` - Get daily affirmation
- `GET /api/breathing` - Get breathing exercise
- `GET /api/health` - Health check

## 🌈 How It Works

1. **Frontend**: User interacts with the chat interface
2. **Backend**: Express server processes messages through `routes/chatbot.js`
3. **Intelligence**: Emotion detection + contextual responses
4. **Response**: Appropriate support message with resources

## 🆘 Crisis Resources

Built-in crisis detection provides immediate access to:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## ⚠️ Disclaimer

SoulSync is an AI companion for emotional support, but it's not a replacement for professional mental health care. If you're experiencing a crisis or need professional help, please contact a licensed therapist or call emergency services.

## 💜 Support

For questions or support, email: soul.sync@gmail.com

---

Made with 💜 by the SoulSync Team | Your Mind Matters