export default function QuestionsList({ questions, format }) {
  return (
    <div className="space-y-6">
      {questions?.map((q, idx) => (
        <div key={idx} className="p-4 border rounded">
          <p className="font-bold mb-2">
            Question {idx + 1}: {q.question}
          </p>

          {format === 'multiple-choice' && q.options && (
            <ul className="mb-4 ml-5 list-disc">
              {q.options.map((option, optIdx) => (
                <li
                  key={optIdx}
                  className={option === q.correctAnswer ? 'font-bold' : ''}
                >
                  {option} {option === q.correctAnswer && '✓'}
                </li>
              ))}
            </ul>
          )}

          {format !== 'multiple-choice' && (
            <p className="mb-4">
              <strong>Answer:</strong> {q.correctAnswer}
            </p>
          )}

          <p className="text-sm text-gray-600">
            <strong>Explanation:</strong> {q.explanation}
          </p>
        </div>
      ))}
    </div>
  );
}
