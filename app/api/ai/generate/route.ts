import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { type, lessonNumber } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    if (!type || !lessonNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: type, lessonNumber' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = '';
    let systemInstruction = 'You are a Japanese language teacher creating JLPT N5 level exercises. Return ONLY valid JSON, no markdown formatting.';

    if (type === 'grammar') {
      prompt = `Create a Japanese grammar exercise for JLPT N5 level, lesson ${lessonNumber}.

Requirements:
- Focus on basic particles (は、が、を、に、で、と、へ), verb forms, or basic sentence patterns
- Provide a Japanese sentence with ONE blank (use ___)
- Provide 4 options in Japanese
- Include explanation in Vietnamese
- Make it appropriate for absolute beginners

Return JSON in this EXACT format:
{
  "id": "grammar-ai-${Date.now()}",
  "type": "grammar",
  "difficulty": "N5",
  "question": "Chọn trợ từ/từ phù hợp",
  "sentence": "Japanese sentence with ___",
  "options": ["option1", "option2", "option3", "option4"],
  "correctIndex": 0,
  "grammarPoint": "Grammar point name",
  "explanation": "Vietnamese explanation"
}`;
    } else if (type === 'multiple-choice') {
      prompt = `Create a Japanese vocabulary or kanji reading multiple choice question for JLPT N5 level, lesson ${lessonNumber}.

Requirements:
- Test vocabulary meaning, kanji reading, or basic usage
- Provide 4 options
- Include explanation in Vietnamese
- Make it appropriate for beginners

Return JSON in this EXACT format:
{
  "id": "mc-ai-${Date.now()}",
  "type": "multiple-choice",
  "difficulty": "N5",
  "question": "Question in Vietnamese",
  "options": ["option1", "option2", "option3", "option4"],
  "correctIndex": 0,
  "explanation": "Vietnamese explanation"
}`;
    } else if (type === 'reading') {
      prompt = `Create a Japanese reading comprehension exercise for JLPT N5 level, lesson ${lessonNumber}.

Requirements:
- Write a SHORT passage (3-5 sentences) in simple Japanese
- Use hiragana, katakana, and basic kanji only
- Create 2-3 comprehension questions with 4 options each
- Include Vietnamese translations and explanations
- Topic: daily life, self-introduction, hobbies, family, school

Return JSON in this EXACT format:
{
  "id": "reading-ai-${Date.now()}",
  "type": "reading",
  "difficulty": "N5",
  "passage": "Japanese passage (3-5 sentences)",
  "questions": [
    {
      "question": "Question in Vietnamese",
      "options": ["option1", "option2", "option3", "option4"],
      "correctIndex": 0,
      "explanation": "Vietnamese explanation"
    }
  ]
}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid exercise type. Use: grammar, multiple-choice, or reading' },
        { status: 400 }
      );
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9, // Higher for more variety
        maxOutputTokens: 1000,
      },
    });

    const response = result.response;
    const text = response.text();

    // Clean up response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    // Parse JSON
    const exercise = JSON.parse(cleanedText);

    // Validate structure
    if (!exercise.id || !exercise.type) {
      throw new Error('Invalid exercise structure from AI: Missing id or type');
    }

    if (exercise.type === 'reading') {
      if (!exercise.passage || !exercise.questions || !Array.isArray(exercise.questions)) {
        throw new Error('Invalid reading exercise structure: Missing passage or questions array');
      }
    } else {
      if (!exercise.question) {
        throw new Error('Invalid exercise structure from AI: Missing question');
      }
    }

    return NextResponse.json({ exercise });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate exercise' },
      { status: 500 }
    );
  }
}
