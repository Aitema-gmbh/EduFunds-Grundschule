const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const port = 3001;

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

app.post('/api/gemini', apiLimiter, async (req, res) => {
  try {
    const { prompt, generationConfig } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent(prompt, generationConfig);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});