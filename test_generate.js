// Test script for AI generation API
// Run with: node test_generate.js

async function testGenerate() {
  const types = ['grammar', 'multiple-choice', 'reading'];
  
  for (const type of types) {
    console.log(`\n🧪 Testing ${type} generation...`);
    
    try {
      const response = await fetch('http://localhost:3000/JL/api/ai/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          lessonNumber: 1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`❌ Error:`, error);
        continue;
      }

      const data = await response.json();
      console.log(`✅ Success!`);
      console.log(JSON.stringify(data.exercise, null, 2));
    } catch (error) {
      console.error(`❌ Network error:`, error.message);
    }
  }
}

testGenerate();
