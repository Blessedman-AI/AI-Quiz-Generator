'use client';
import React, { useState, useEffect } from 'react';

const QuizDisplay = ({ questions, onComplete, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionSubmitted, setQuestionSubmitted] = useState({});

  useEffect(() => {
    // Initialize selected answers for multi-choice questions as arrays
    const initialAnswers = {};
    questions.forEach((question, index) => {
      if (question.type === 'multi-choice') {
        initialAnswers[index] = [];
      } else {
        initialAnswers[index] = '';
      }
    });
    setSelectedAnswers(initialAnswers);
  }, [questions]);

  const handleAnswerSelect = (index, answer) => {
    if (questionSubmitted[index]) return;

    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.type === 'multi-choice') {
      setSelectedAnswers((prev) => {
        const current = [...prev[index]];
        const answerIndex = current.indexOf(answer);

        if (answerIndex === -1) {
          current.push(answer);
        } else {
          current.splice(answerIndex, 1);
        }

        return { ...prev, [index]: current };
      });
    } else {
      // Single choice
      setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const calculateResults = () => {
    let score = 0;

    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index];
      const correctAnswer = question.correctAnswer;

      if (question.type === 'multi-choice') {
        // For multi-choice, check if arrays match (regardless of order)
        if (
          userAnswer &&
          correctAnswer &&
          userAnswer.length === correctAnswer.length &&
          userAnswer.every((answer) => correctAnswer.includes(answer))
        ) {
          score++;
        }
      } else {
        // For single-choice
        if (userAnswer === correctAnswer) {
          score++;
        }
      }
    });

    const percentage = Math.round((score / questions.length) * 100);
    return { score, total: questions.length, percentage };
  };

  const handleSubmitQuestion = () => {
    setQuestionSubmitted((prev) => ({ ...prev, [currentQuestionIndex]: true }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const results = calculateResults();
    onComplete(results);
  };

  if (!questions || questions.length === 0) {
    return <div>No questions available</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentQuestionSubmitted = questionSubmitted[currentQuestionIndex];

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-gray-500/80 flex items-center justify-center
      transition-opacity duration-400  z-50"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected =
                currentQuestion.type === 'multi-choice'
                  ? selectedAnswers[currentQuestionIndex]?.includes(option)
                  : selectedAnswers[currentQuestionIndex] === option;

              const isCorrect =
                currentQuestion.type === 'multi-choice'
                  ? currentQuestion.correctAnswer.includes(option)
                  : currentQuestion.correctAnswer === option;

              let optionClasses =
                'p-3 border rounded-md cursor-pointer transition-colors flex items-center text-gray-700';

              if (isSelected && !isCurrentQuestionSubmitted) {
                optionClasses += ' bg-blue-100 border-blue-300';
              } else if (!isSelected && !isCurrentQuestionSubmitted) {
                optionClasses += ' hover:bg-gray-50 border-gray-200';
              } else {
                optionClasses += ' border-gray-200';
              }

              if (isCurrentQuestionSubmitted) {
                if (isCorrect) {
                  optionClasses += ' bg-green-100 border-green-300';
                } else if (isSelected && !isCorrect) {
                  optionClasses += ' bg-red-100 border-red-300';
                }
              }

              return (
                <div
                  key={optionIndex}
                  className={optionClasses}
                  onClick={() =>
                    handleAnswerSelect(currentQuestionIndex, option)
                  }
                >
                  {currentQuestion.type === 'multi-choice' ? (
                    <div
                      className={`w-5 h-5 mr-3 border rounded flex items-center justify-center
                      ${
                        isSelected && !isCurrentQuestionSubmitted
                          ? 'bg-blue-500 border-blue-300 text-white'
                          : isCurrentQuestionSubmitted && isCorrect
                          ? 'bg-green-500 border-green-300 text-white'
                          : isCurrentQuestionSubmitted &&
                            isSelected &&
                            !isCorrect
                          ? 'bg-red-500 border-red-300 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 mr-3 border rounded-full flex items-center justify-center
                      ${
                        isSelected && !isCurrentQuestionSubmitted
                          ? 'border-blue-300'
                          : isCurrentQuestionSubmitted && isCorrect
                          ? 'border-green-300'
                          : isCurrentQuestionSubmitted &&
                            isSelected &&
                            !isCorrect
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isCurrentQuestionSubmitted && isCorrect
                              ? 'bg-green-500'
                              : isCurrentQuestionSubmitted && !isCorrect
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                        ></div>
                      )}
                    </div>
                  )}
                  <span>{option}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-blue-600 font-medium disabled:text-gray-400"
          >
            Previous
          </button>

          {!isCurrentQuestionSubmitted && (
            <button
              onClick={handleSubmitQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium"
            >
              Submit Answer
            </button>
          )}

          {isCurrentQuestionSubmitted &&
          currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium"
            >
              Next
            </button>
          ) : isCurrentQuestionSubmitted &&
            currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium"
            >
              Submit Quiz
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay;
