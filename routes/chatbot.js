const express = require('express');
const router = express.Router();
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// System prompt for mental health support
const SYSTEM_PROMPT = `You are SoulSync, a compassionate AI mental health companion. Your role is to:
- Provide empathetic, supportive responses
- Listen without judgment
- Offer breathing exercises and mindfulness tips when appropriate
- Detect when someone is in crisis and provide emergency resources
- Use warm, caring language with emojis like 💜 🌿 🌈
- Keep responses concise but meaningful
- Never claim to be a replacement for professional therapy
- Always prioritize user safety and wellbeing

Remember: You're here to support, not diagnose or treat.`;

// Mental health support responses database
const mentalHealthResponses = {
  sad: [
    "I'm here for you 💜 It's okay to feel sad sometimes. Would you like to talk about what's making you feel this way?",
    "I hear you, and your feelings are valid. Let's take this one step at a time together. Can you tell me more about what's going on?",
    "Sadness is a natural emotion, and it's brave of you to acknowledge it. I'm here to listen without judgment. 🌿"
  ],
  happy: [
    "That's wonderful! 🌈 I'm so glad you're feeling happy. What's bringing you joy today?",
    "Your happiness is contagious! Keep that positive energy flowing. Would you like to share what's making you smile? 😊",
    "Amazing! Celebrating the good moments is so important. Tell me more about what's making you feel great!"
  ],
  anxious: [
    "Anxiety can feel overwhelming, but you're not alone. Let's try a grounding exercise: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. 🌬️",
    "I understand anxiety is difficult. Try this: Breathe in slowly for 4 counts, hold for 4, exhale for 4. Repeat this a few times. I'm right here with you. 💙",
    "Let's work through this together. What's making you feel anxious? Sometimes talking about it can help lighten the burden. 🌟"
  ],
  stress: [
    "Stress is tough, but you're tougher. Try this breathing technique: Inhale for 4 seconds, hold for 4, exhale for 6. This activates your calm response. 🌬️",
    "I hear you. Let's tackle this stress together. Can you identify what's causing the most pressure right now? Sometimes breaking things down helps. 💪",
    "Remember: You don't have to handle everything at once. Let's prioritize. What's one small thing you could do right now to feel better? 🌿"
  ],
  depressed: [
    "I'm really glad you reached out. Depression is serious, and you deserve support. While I'm here to listen, please consider reaching out to a mental health professional. You're worth it. 💜",
    "You're taking a brave step by talking about this. Depression can make everything feel heavy, but you don't have to carry this alone. Have you spoken with a counselor or therapist? 🌸",
    "Your feelings matter, and so do you. If you're in crisis, please call 988 (Suicide & Crisis Lifeline). I'm here for support, but professionals can provide the help you deserve. 🆘"
  ],
  angry: [
    "It's okay to feel angry. Let's channel this energy safely. Try: Take 5 deep breaths, or do some physical activity if you can. Would you like to talk about what triggered this? 🔥",
    "Anger is a valid emotion. Let's explore what's beneath it - sometimes anger masks hurt, fear, or frustration. I'm listening. 💭",
    "I hear your frustration. Would a quick anger release help? Try: Squeeze ice cubes, punch a pillow, or write down your feelings and tear up the paper. 🌊"
  ],
  lonely: [
    "Loneliness can feel really heavy. You're not alone right now - I'm here with you. Would you like to talk about what's making you feel isolated? 🤗",
    "I understand feeling lonely is painful. Even small connections can help - maybe reach out to one person today, even just to say hi. You matter. 💜",
    "You deserve connection and companionship. Let's talk about ways to build meaningful relationships. What activities do you enjoy? 🌟"
  ],
  grateful: [
    "Gratitude is powerful! 🙏 Recognizing the good things is wonderful for your mental health. What are you grateful for today?",
    "That's beautiful! Practicing gratitude can really shift our perspective. Tell me more about what's filling your heart. ✨",
    "Love this energy! Gratitude is one of the best practices for wellbeing. Keep noticing those positive moments. 🌈"
  ],
  tired: [
    "Rest is not a luxury, it's a necessity. 🌙 Are you getting enough sleep? Let's talk about your sleep routine and energy levels.",
    "Being tired affects everything. Let's explore: Are you physically tired, mentally exhausted, or emotionally drained? Each needs different care. 💤",
    "Your body might be telling you something. Have you been able to take breaks? Even 5-minute rests can help recharge. 🔋"
  ],
  overwhelmed: [
    "Feeling overwhelmed is a sign you're carrying too much. Let's pause and breathe. What's the most urgent thing right now? We'll tackle one thing at a time. 🌊",
    "When everything feels like too much, we need to simplify. Can you delegate, postpone, or eliminate anything from your plate? You don't have to do it all. 🧘",
    "Let's break this down together. Make a list of everything, then we'll prioritize. Sometimes just organizing thoughts helps. 📝"
  ]
};

const breathingExercises = [
  "Try box breathing: Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times. 🟦",
  "4-7-8 technique: Inhale for 4 seconds, hold for 7, exhale slowly for 8. Great for anxiety! 🌬️",
  "Deep belly breathing: Put your hand on your belly, breathe in deeply so your belly rises, then exhale slowly. Do this 5 times. 🫁"
];

const affirmations = [
  "You are stronger than you think. 💪",
  "Your feelings are valid and important. 💜",
  "You deserve peace and happiness. 🌈",
  "It's okay to not be okay sometimes. 🌿",
  "You are worthy of love and care. ✨",
  "This feeling is temporary. You will get through this. 🌅",
  "You're doing better than you think you are. 🌟",
  "Taking care of your mental health is brave, not weak. 🦋"
];

// Helper function to detect emotion in message
function detectEmotion(message) {
  const lowerMsg = message.toLowerCase();
  
  const emotions = {
    sad: ['sad', 'down', 'unhappy', 'cry', 'crying', 'upset', 'miserable', 'heartbroken', 'blue'],
    happy: ['happy', 'joy', 'joyful', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'glad', 'cheerful'],
    anxious: ['anxious', 'anxiety', 'nervous', 'worried', 'panic', 'fear', 'scared', 'afraid'],
    stress: ['stress', 'stressed', 'pressure', 'overwhelm', 'busy', 'exhausted'],
    depressed: ['depressed', 'depression', 'hopeless', 'worthless', 'suicide', 'kill myself', 'end it all'],
    angry: ['angry', 'mad', 'furious', 'rage', 'frustrated', 'annoyed', 'irritated'],
    lonely: ['lonely', 'alone', 'isolated', 'nobody', 'no one', 'no friends'],
    grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'gratitude', 'thank'],
    tired: ['tired', 'exhausted', 'fatigue', 'drained', 'sleepy', 'weary'],
    overwhelmed: ['overwhelmed', 'too much', 'can\'t handle', 'drowning']
  };
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerMsg.includes(keyword))) {
      return emotion;
    }
  }
  
  return null;
}

// Helper function to generate contextual response
function generateResponse(message, emotion) {
  let response = "";
  
  if (emotion && mentalHealthResponses[emotion]) {
    const responses = mentalHealthResponses[emotion];
    response = responses[Math.floor(Math.random() * responses.length)];
    
    // Add breathing exercise for stress/anxiety
    if (emotion === 'stress' || emotion === 'anxious') {
      const exercise = breathingExercises[Math.floor(Math.random() * breathingExercises.length)];
      response += `\n\n${exercise}`;
    }
    
    // Add affirmation
    const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    response += `\n\n${affirmation}`;
    
  } else {
    // Default empathetic responses
    const defaultResponses = [
      "I'm listening 👂 Tell me more about what's on your mind.",
      "Thank you for sharing that with me. How are you feeling right now? 💜",
      "I'm here for you. Would you like to explore this further? 🌿",
      "That sounds important. Can you tell me more about how this affects you? 🌟",
      "I hear you. Your thoughts and feelings matter. What would help you most right now? 💙"
    ];
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  return response;
}

// Helper function to generate LLM response
async function generateLLMResponse(message, conversationHistory, emotion) {
  try {
    const aiService = process.env.AI_SERVICE || 'local';
    
    // Try OpenAI first if configured
    if (aiService === 'openai' && process.env.OPENAI_API_KEY) {
      return await generateOpenAIResponse(message, conversationHistory, emotion);
    }
    
    // Try Hugging Face if configured
    if (aiService === 'huggingface' && process.env.HUGGINGFACE_API_KEY) {
      return await generateHuggingFaceResponse(message, conversationHistory, emotion);
    }
    
    // Fallback to enhanced rule-based
    return generateEnhancedResponse(message, conversationHistory, emotion);
    
  } catch (error) {
    console.error('❌ LLM Error:', error.message);
    return generateEnhancedResponse(message, conversationHistory, emotion);
  }
}

// OpenAI integration
async function generateOpenAIResponse(message, conversationHistory, emotion) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-4));
    }
    
    const userMessage = emotion ? `[Feeling: ${emotion}] ${message}` : message;
    messages.push({ role: 'user', content: userMessage });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0].message.content.trim();
    console.log('✅ OpenAI response generated');
    return reply;
    
  } catch (error) {
    console.error('OpenAI Error:', error.message);
    throw error;
  }
}

// Hugging Face integration
async function generateHuggingFaceResponse(message, conversationHistory, emotion) {
  try {
    // Build prompt
    let promptParts = [
      "You are SoulSync 💜, a compassionate mental health companion.",
      "Provide warm, empathetic support in 2-3 sentences with caring emojis.\n"
    ];
    
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-3).forEach(msg => {
        promptParts.push(`${msg.role === 'user' ? 'User' : 'SoulSync'}: ${msg.content}`);
      });
    }
    
    if (emotion) promptParts.push(`[Emotion: ${emotion}]`);
    promptParts.push(`User: ${message}`);
    promptParts.push("SoulSync:");
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      { inputs: promptParts.join('\n') },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    let text = '';
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      text = response.data[0].generated_text.split('SoulSync:').pop().trim();
    }
    
    if (text && text.length >= 20) {
      console.log('✅ Hugging Face response generated');
      return text;
    }
    
    throw new Error('Response too short');
    
  } catch (error) {
    console.error('Hugging Face Error:', error.response?.data || error.message);
    throw error;
  }
}

// Enhanced rule-based response with context awareness
function generateEnhancedResponse(message, conversationHistory, emotion) {
  console.log('💡 Using enhanced intelligent response system');
  
  // Use the existing intelligent system
  let response = generateResponse(message, emotion);
  
  // Add contextual follow-up based on conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    const lastUserMsg = conversationHistory.slice(-2).find(m => m.role === 'user');
    if (lastUserMsg && lastUserMsg.content.toLowerCase().includes('help')) {
      response += "\n\n🌟 Remember, I'm here whenever you need to talk.";
    }
  }
  
  return response;
}

// Chatbot endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check for crisis keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'better off dead'];
    const isCrisis = crisisKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (isCrisis) {
      return res.json({
        reply: "🆘 I'm really concerned about you. Please reach out for immediate help:\n\n" +
               "• National Suicide Prevention Lifeline: 988 (24/7)\n" +
               "• Crisis Text Line: Text HOME to 741741\n" +
               "• Emergency Services: 911\n\n" +
               "Your life matters. Please talk to a professional who can provide the support you need right now. 💜",
        emotion: 'crisis',
        requiresHelp: true
      });
    }
    
    // Detect emotion
    const emotion = detectEmotion(message);
    
    let reply;
    let usedLLM = false;
    
    // Check if we should use LLM
    const aiService = process.env.AI_SERVICE || 'local';
    
    if ((aiService === 'huggingface' || aiService === 'openai') && 
        (process.env.HUGGINGFACE_API_KEY || process.env.OPENAI_API_KEY)) {
      console.log(`🤖 Attempting ${aiService.toUpperCase()} LLM response...`);
      reply = await generateLLMResponse(message, conversationHistory, emotion);
      usedLLM = reply.includes('💡') ? false : true; // Check if fallback was used
      
      // Add affirmation if emotion detected and not already in response
      if (emotion && (emotion === 'sad' || emotion === 'anxious' || emotion === 'stressed')) {
        const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        if (!reply.includes(affirmation)) {
          reply += `\n\n${affirmation}`;
        }
      }
    } else {
      console.log('💡 Using intelligent rule-based response system');
      reply = generateResponse(message, emotion);
    }
    
    res.json({
      reply: reply,
      emotion: emotion || 'neutral',
      requiresHelp: false,
      timestamp: new Date().toISOString(),
      usedLLM: usedLLM,
      aiService: usedLLM ? aiService : 'intelligent-rules'
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      reply: "I'm having trouble responding right now. Please try again, or if you need immediate help, call 988. 💜"
    });
  }
});

// Get mental health resources
router.get('/resources', (req, res) => {
  res.json({
    crisisLines: {
      us: {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        available: '24/7'
      },
      textLine: {
        name: 'Crisis Text Line',
        text: 'HOME to 741741',
        available: '24/7'
      }
    },
    breathingExercises: breathingExercises,
    affirmations: affirmations,
    tips: [
      'Practice gratitude daily - write down 3 things you\'re grateful for',
      'Get 7-9 hours of sleep each night',
      'Exercise regularly - even a 10-minute walk helps',
      'Stay connected with loved ones',
      'Limit social media and news consumption',
      'Practice mindfulness or meditation',
      'Eat nutritious meals regularly',
      'Set boundaries and learn to say no',
      'Seek professional help when needed',
      'Be kind to yourself - you\'re doing your best'
    ]
  });
});

// Get daily affirmation
router.get('/affirmation', (req, res) => {
  const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  res.json({ affirmation });
});

// Get breathing exercise
router.get('/breathing', (req, res) => {
  const exercise = breathingExercises[Math.floor(Math.random() * breathingExercises.length)];
  res.json({ exercise });
});

module.exports = router;
