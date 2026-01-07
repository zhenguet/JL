import json
import os
import random
from pathlib import Path
from typing import List, Dict, Any

BASE_DIR = Path(__file__).parent.parent
QUIZ_DIR = BASE_DIR / "data" / "quiz"
LESSON_DIR = BASE_DIR / "data" / "lesson"


def load_json(file_path: Path) -> Any:
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(file_path: Path, data: Any):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def generate_vocab_questions(lesson_data: List[Dict], num_questions: int = 10) -> List[Dict]:
    """Generate vocabulary questions from lesson data"""
    questions = []
    vocab_items = [item for item in lesson_data if item.get("type") in ["noun", "verb", "other"]]
    
    if len(vocab_items) < 4:
        return questions
    
    random.shuffle(vocab_items)
    
    for i, item in enumerate(vocab_items[:num_questions]):
        question_id = i + 1
        
        # Type 1: Hiragana -> Meaning
        if random.random() < 0.4:
            question = {
                "id": question_id,
                "question": f"<b>{item.get('hiragana', '')}</b>",
                "options": [item.get("vi", "")]
            }
            
            # Add wrong options
            other_items = [v for v in vocab_items if v != item]
            random.shuffle(other_items)
            for wrong_item in other_items[:3]:
                if wrong_item.get("vi") not in question["options"]:
                    question["options"].append(wrong_item.get("vi", ""))
                    if len(question["options"]) >= 4:
                        break
            
            random.shuffle(question["options"])
            correct_idx = question["options"].index(item.get("vi", ""))
            question["correctAnswer"] = correct_idx
            questions.append(question)
        
        # Type 2: Meaning -> Hiragana
        elif random.random() < 0.7:
            question = {
                "id": question_id,
                "question": f"<b>{item.get('vi', '')}</b>",
                "options": [item.get("hiragana", "")]
            }
            
            other_items = [v for v in vocab_items if v != item]
            random.shuffle(other_items)
            for wrong_item in other_items[:3]:
                if wrong_item.get("hiragana") not in question["options"]:
                    question["options"].append(wrong_item.get("hiragana", ""))
                    if len(question["options"]) >= 4:
                        break
            
            random.shuffle(question["options"])
            correct_idx = question["options"].index(item.get("hiragana", ""))
            question["correctAnswer"] = correct_idx
            questions.append(question)
        
        # Type 3: Kanji -> Hiragana
        elif item.get("kanji") and random.random() < 0.9:
            question = {
                "id": question_id,
                "question": f"<b>{item.get('kanji', '')}</b>",
                "options": [item.get("hiragana", "")]
            }
            
            other_items = [v for v in vocab_items if v != item and v.get("hiragana")]
            random.shuffle(other_items)
            for wrong_item in other_items[:3]:
                if wrong_item.get("hiragana") not in question["options"]:
                    question["options"].append(wrong_item.get("hiragana", ""))
                    if len(question["options"]) >= 4:
                        break
            
            random.shuffle(question["options"])
            correct_idx = question["options"].index(item.get("hiragana", ""))
            question["correctAnswer"] = correct_idx
            questions.append(question)
    
    return questions[:num_questions]


def generate_grammar_questions(lesson_data: List[Dict], existing_quiz: List[Dict], num_questions: int = 10) -> List[Dict]:
    """Generate grammar questions based on existing quiz patterns"""
    questions = []
    
    # Extract grammar patterns from existing quiz
    grammar_patterns = []
    for q in existing_quiz:
        if "（　）" in q.get("question", ""):
            grammar_patterns.append(q)
    
    if grammar_patterns:
        random.shuffle(grammar_patterns)
        for i, pattern in enumerate(grammar_patterns[:num_questions]):
            question = pattern.copy()
            question["id"] = len(questions) + 1
            questions.append(question)
    
    return questions[:num_questions]


def generate_conversation_questions(lesson_data: List[Dict], num_questions: int = 5) -> List[Dict]:
    """Generate conversation/dialogue questions"""
    questions = []
    vocab_items = [item for item in lesson_data if item.get("type") in ["noun", "verb", "other"]]
    
    if len(vocab_items) < 2:
        return questions
    
    # Simple conversation patterns
    patterns = [
        {
            "template": "<b>A：{vocab1}は　どこですか。<p>B：（　）です。</p></b>",
            "options": ["ここ", "そこ", "あそこ", "どこ"],
            "correct_answers": [0, 1, 2]
        },
        {
            "template": "<b>A：{vocab1}は　どちらですか。<p>B：（　）です。</p></b>",
            "options": ["こちら", "そちら", "あちら", "どちら"],
            "correct_answers": [0, 1, 2]
        },
        {
            "template": "<b>A：{vocab1}は　なんですか。<p>B：（　）は　{vocab2}です。</p></b>",
            "options": ["それ", "これ", "あれ", "どれ"],
            "correct_answers": [1]
        }
    ]
    
    for i in range(min(num_questions, len(patterns))):
        pattern = patterns[i % len(patterns)]
        vocab1 = random.choice(vocab_items).get("hiragana", "")
        vocab2 = random.choice(vocab_items).get("hiragana", "") if "vocab2" in pattern["template"] else ""
        
        question_text = pattern["template"].format(vocab1=vocab1, vocab2=vocab2)
        correct_answer = random.choice(pattern["correct_answers"])
        
        question = {
            "id": len(questions) + 1,
            "question": question_text,
            "options": pattern["options"].copy(),
            "correctAnswer": correct_answer
        }
        questions.append(question)
    
    return questions


def generate_quiz_set(lesson_number: int, set_number: int, lesson_data: List[Dict], existing_quiz: List[Dict]) -> List[Dict]:
    """Generate a complete quiz set"""
    questions = []
    
    # Generate different types of questions
    vocab_questions = generate_vocab_questions(lesson_data, num_questions=12)
    grammar_questions = generate_grammar_questions(lesson_data, existing_quiz, num_questions=8)
    conversation_questions = generate_conversation_questions(lesson_data, num_questions=5)
    
    # Combine and assign IDs
    all_questions = vocab_questions + grammar_questions + conversation_questions
    random.shuffle(all_questions)
    
    # Ensure we have at least 20 questions
    while len(all_questions) < 20 and vocab_questions:
        extra = generate_vocab_questions(lesson_data, num_questions=5)
        all_questions.extend(extra)
    
    # Limit to 25 questions and assign sequential IDs
    final_questions = all_questions[:25]
    for i, q in enumerate(final_questions):
        q["id"] = i + 1
    
    return final_questions


def main():
    """Main function to generate missing quiz sets"""
    lessons_to_process = [
        (3, [4, 5, 6, 7, 8, 9, 10]),  # quiz3_set4 to quiz3_set10
        (4, [2, 3, 4, 5, 6, 7, 8, 9, 10]),  # quiz4_set2 to quiz4_set10
        (5, [2, 3, 4, 5, 6, 7, 8, 9, 10]),  # quiz5_set2 to quiz5_set10
    ]
    
    for lesson_num, set_numbers in lessons_to_process:
        # Load lesson data
        lesson_file = LESSON_DIR / f"lesson{lesson_num}.json"
        if not lesson_file.exists():
            print(f"Warning: {lesson_file} not found, skipping lesson {lesson_num}")
            continue
        
        lesson_data = load_json(lesson_file)
        
        # Load existing quiz for reference
        existing_quiz_file = QUIZ_DIR / f"quiz{lesson_num}.json"
        existing_quiz = []
        if existing_quiz_file.exists():
            existing_quiz = load_json(existing_quiz_file)
        
        # Generate each set
        for set_num in set_numbers:
            output_file = QUIZ_DIR / f"quiz{lesson_num}_set{set_num}.json"
            
            if output_file.exists():
                print(f"Skipping {output_file.name} (already exists)")
                continue
            
            print(f"Generating {output_file.name}...")
            quiz_set = generate_quiz_set(lesson_num, set_num, lesson_data, existing_quiz)
            
            if quiz_set:
                save_json(output_file, quiz_set)
                print(f"✓ Created {output_file.name} with {len(quiz_set)} questions")
            else:
                print(f"✗ Failed to generate {output_file.name}")
    
    print("\nDone! All quiz sets have been generated.")


if __name__ == "__main__":
    main()
