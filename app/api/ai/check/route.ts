import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Missing GEMINI_API_KEY in environment variables');
    return NextResponse.json(
      { error: 'Missing GEMINI_API_KEY' },
      { status: 500 }
    )
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  try {
    const body = await request.json();
    const { question, correctAnswer, userAnswer, type } = body;

    if (!question || !correctAnswer || !userAnswer) {
       console.error('❌ Missing required fields in request body', body);
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = `
      Bạn là một giáo viên tiếng Nhật. Hãy kiểm tra câu trả lời của học sinh.
      
      Loại bài tập: ${type}
      Câu hỏi: "${question}"
      Đáp án chuẩn: "${correctAnswer}"
      Câu trả lời của học sinh: "${userAnswer}"
      
      Nhiệm vụ:
      1. Xác định xem câu trả lời của học sinh có đúng về mặt ý nghĩa và ngữ pháp không (chấp nhận các cách diễn đạt tương đương).
      2. Giải thích ngắn gọn bằng tiếng Việt (tối đa 2 câu).
      
      Trả về định dạng JSON KHÔNG có markdown block:
      {
        "isCorrect": boolean,
        "explanation": "string"
      }
    `

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('❌ Unexpected Gemini response structure:', JSON.stringify(data, null, 2));
        throw new Error('Invalid response from Gemini');
    }

    const text = data.candidates[0].content.parts[0].text
    
    // Clean up markdown if present (Gemini sometimes adds ```json ... ```)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
    
    try {
        const result = JSON.parse(jsonStr)
        return NextResponse.json(result)
    } catch (parseError) {
        console.error('❌ Failed to parse JSON from Gemini:', jsonStr);
        throw new Error('Failed to parse AI response');
    }

  } catch (error: any) {
    console.error('❌ AI Check Internal Error:', error.message || error)
    return NextResponse.json(
      { error: error.message || 'Failed to check answer' },
      { status: 500 }
    )
  }
}
