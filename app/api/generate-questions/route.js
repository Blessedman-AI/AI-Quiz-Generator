// app/api/generate-questions/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { numQuestions, questionType, content, source } =
      await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt(source);
    const userPrompt = generatePrompt(
      numQuestions,
      questionType,
      content,
      source
    );

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

function getSystemPrompt(source) {
  if (source === 'document') {
    return 'You are a specialized quiz generation assistant that creates high-quality quiz questions based on the provided document content. Your goal is to test understanding of the material while ensuring questions are clear, relevant, and varied in difficulty.';
  } else {
    return "You are a specialized quiz generation assistant that creates high-quality quiz questions based on user prompts. You follow the user's instructions regarding topics, difficulty, and style while ensuring questions are educational, engaging, and well-formatted.";
  }
}

// function generatePrompt(numQuestions, questionType, content, source) {
//   if (source === 'document') {
//     // For document-based quizzes, we provide specific instructions on how to analyze the content
//     return `
// - Generate ${numQuestions} ${questionType} questions based on the following document content:
// ${content}

// - Ensure the questions are clear, relevant, and unambiguous.
// - Each question should test understanding of key concepts in the material.
// - Cover content from different sections of the material.
// - If the input is too short, generate fewer questions proportionally.
// - Avoid vague or overly simple questions. Ensure they test comprehension.

// Additional Notes:
// - If a passage contains technical or scientific terms, ensure questions match the complexity.
// - If definitions, dates, or key figures are present, include factual recall questions.
// - If the passage is argumentative or analytical, include reasoning-based questions.
// - Format each question as a JSON object with the following structure:
// {
//   "questions": [
//     {
//       "question": "Question text here",
//       ${
//         questionType.includes('choice')
//           ? '"options": ["Option A", "Option B", "Option C", "Option D"],'
//           : ''
//       }
//   ${
//     questionType === 'multi-choice'
//       ? '"correctAnswer": ["Correct answer 1", "Correct answer 2", ...],'
//       : '"correctAnswer": "Correct answer here",'
//   }
//       "type": "${questionType}"
//     }
//   ]
// }
// Return all questions in a JSON array.
// `;
//   } else {
//     // For prompt-based quizzes, we mostly let the user's instructions guide the AI
//     return `
// I need you to create a quiz according to these instructions:

// ${content}

// Please generate ${numQuestions} ${questionType} questions.

// Format the questions in this JSON structure:
// {
//   "questions": [
//     {
//       "question": "Question text here",
//       ${
//         questionType.includes('choice')
//           ? '"options": ["Option A", "Option B", "Option C", "Option D"],'
//           : ''
//       }
//       ${
//         questionType === 'multi-choice'
//           ? '"correctAnswer": ["Correct answer 1", "Correct answer 2", ...],'
//           : '"correctAnswer": "Correct answer here",'
//       }
//       "type": "${questionType}"
//     }
//   ]
// }

// Important requirements:
// - Follow the user's instructions regarding topics, difficulty level, and style. Where difficulty level is not specified by the user, generate questions varying in difficulty.
// - Create questions that are clear, educational, and engaging
// - Ensure correct answers are accurate and unambiguous
// - For multiple-choice questions, include plausible distractors
// - Return ONLY valid JSON with no additional text
// `;
//   }
// }

function generatePrompt(numQuestions, questionType, content, source) {
  if (source === 'document') {
    // For document-based quizzes, we provide specific instructions on how to analyze the content
    return `
- Generate ${numQuestions} ${questionType} questions based on the following document content:
${content}

- Ensure the questions are clear, relevant, and unambiguous.
- Each question should test understanding of key concepts in the material.
- Cover content from different sections of the material.
- If the input is too short, generate fewer questions proportionally.
- Avoid vague or overly simple questions. Ensure they test comprehension.

Additional Notes:
- If a passage contains technical or scientific terms, ensure questions match the complexity.
- If definitions, dates, or key figures are present, include factual recall questions.
- If the passage is argumentative or analytical, include reasoning-based questions.
- If questionType is 'multi-choice', ensure that each question has **multiple correct answers**, not just one.
- Format each question as a JSON object with the following structure:
{
  "questions": [
    {
      "question": "Question text here",
      ${
        questionType.includes('choice')
          ? '"options": ["Option A", "Option B", "Option C", "Option D"],'
          : ''
      }
  ${
    questionType === 'multi-choice'
      ? '"correctAnswer": ["Correct answer 1", "Correct answer 2", ...],'
      : '"correctAnswer": "Correct answer here",'
  }
      "type": "${questionType}"
    }
  ]
}
Return all questions in a JSON array.
`;
  } else {
    // For prompt-based quizzes, we mostly let the user's instructions guide the AI
    return `
I need you to create a quiz according to these instructions:

${content}

Please generate ${numQuestions} ${questionType} questions.

Format the questions in this JSON structure:
{
  "questions": [
    {
      "question": "Question text here",
      ${
        questionType.includes('choice')
          ? '"options": ["Option A", "Option B", "Option C", "Option D"],'
          : ''
      }
      ${
        questionType === 'multi-choice'
          ? '"correctAnswer": ["Correct answer 1", "Correct answer 2", ...],'
          : '"correctAnswer": "Correct answer here",'
      }
      "type": "${questionType}"
    }
  ]
}
  Example of multi-choice structure:
{
  "question": "Which of the following are programming languages?",
  "options": ["HTML", "Python", "CSS", "JavaScript"],
  "correctAnswer": ["Python", "JavaScript"],
  "type": "multi-choice"
}


Important requirements:
- Follow the user's instructions regarding topics, difficulty level, and style. Where difficulty level is not specified by the user, generate questions varying in difficulty.
- Create questions that are clear, educational, and engaging
- Ensure correct answers are accurate and unambiguous
- For multiple-choice questions, include plausible distractors
- If questionType is 'multi-choice', interpret this as multiple **correct** answers per question (i.e., more than one correct answer must be selected). Do NOT create single-answer multiple choice questions in this case.
- Each multi-choice question should have at least **two** correct answers listed in the "correctAnswer" array.

- Return ONLY valid JSON with no additional text
`;
  }
}
