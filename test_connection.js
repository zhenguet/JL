
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // There isn't a direct listModels method exposed easily in the simple usage, 
    // but we can try to generate content and see the error which might list models,
    // or just try a simple generation to confirm key validity.
    
    console.log("Attempting simple generation with gemini-pro...");
    const result = await model.generateContent("Hello");
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
