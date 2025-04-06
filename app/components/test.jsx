'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const QuizDisplay = ({ questions, onComplete, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array(questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Determine question type from the current question object or default to single-choice
  const questionType = currentQuestion.type || 'single-choice';

  // Function to determine if a question is a yes/no question
  function questionTypeIsYesNo(question) {
    return (
      question.correctAnswer === 'Yes' ||
      question.correctAnswer === 'No' ||
      question.correctAnswer === 'YES' ||
      question.correctAnswer === 'NO'
    );
  }

  // Add default options for yes-no questions if they don't exist
  if (!currentQuestion.options && questionTypeIsYesNo(currentQuestion)) {
    currentQuestion.options = ['Yes', 'No'];
  }

  const isYesNo =
    questionType === 'yes-no' ||
    (currentQuestion?.options &&
      currentQuestion.options.length === 2 &&
      currentQuestion.options.every((opt) =>
        ['YES', 'NO', 'Yes', 'No'].includes(opt)
      ));

  const handleAnswerSelect = (answer) => {
    if (isAnswerSubmitted) return;

    const newAnswers = [...selectedAnswers];

    if (questionType === 'multi-choice') {
      // For multichoice, toggle the selected answer in an array
      if (!Array.isArray(newAnswers[currentQuestionIndex])) {
        newAnswers[currentQuestionIndex] = [];
      }

      const index = newAnswers[currentQuestionIndex].indexOf(answer);
      if (index === -1) {
        newAnswers[currentQuestionIndex].push(answer);
      } else {
        newAnswers[currentQuestionIndex].splice(index, 1);
      }
    } else {
      // For single choice, just replace the answer
      newAnswers[currentQuestionIndex] = answer;
    }

    setSelectedAnswers(newAnswers);
  };

  const handleSubmitAnswer = () => {
    setIsAnswerSubmitted(true);
  };

  const isAnswerSelected = () => {
    const currentAnswer = selectedAnswers[currentQuestionIndex];
    if (questionType === 'multi-choice') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    return currentAnswer !== null;
  };

  const moveToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsAnswerSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  const moveToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setIsAnswerSubmitted(false);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      const qType = question.type || 'single-choice';

      if (qType === 'multi-choice') {
        // For multichoice, compare arrays
        const selectedArr = Array.isArray(selectedAnswers[index])
          ? selectedAnswers[index]
          : [];
        const correctArr = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];

        // Check if arrays match (same elements, regardless of order)
        const match =
          selectedArr.length === correctArr.length &&
          selectedArr.every((item) => correctArr.includes(item));

        if (match) correctCount++;
      } else {
        // For single choice, direct comparison
        if (selectedAnswers[index] === question.correctAnswer) {
          correctCount++;
        }
      }
    });

    return {
      score: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
    };
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(questions.length).fill(null));
    setShowResults(false);
    setIsAnswerSubmitted(false);
  };

  if (showResults) {
    const result = calculateScore();
    return (
      <div
        className="fixed inset-0 backdrop-blur-sm bg-gray-500/80 flex items-center justify-center
      transition-opacity duration-400  z-50"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Quiz Results</h2>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-blue-500 mb-4">
              <div>
                <span className="text-4xl font-bold text-blue-500">
                  {result.score}
                </span>
                <span className="text-xl text-gray-500">/{result.total}</span>
              </div>
            </div>
            <p className="text-xl font-semibold">{result.percentage}%</p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={resetQuiz}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => onComplete(result)}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Is this answer correct?
  const isCorrectAnswer = (option) => {
    if (questionType === 'multi-choice') {
      return Array.isArray(currentQuestion.correctAnswer)
        ? currentQuestion.correctAnswer.includes(option)
        : currentQuestion.correctAnswer === option;
    }
    return option === currentQuestion.correctAnswer;
  };

  // Is this option selected?
  const isOptionSelected = (option) => {
    const currentAnswer = selectedAnswers[currentQuestionIndex];
    if (questionType === 'multi-choice') {
      return Array.isArray(currentAnswer) && currentAnswer.includes(option);
    }
    return currentAnswer === option;
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-gray-500/80 flex items-center justify-center
      transition-opacity duration-400  z-50"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            {currentQuestionIndex + 1} of {questions.length}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center">
          {currentQuestion.question}
        </h2>

        {isYesNo ? (
          <div className="flex justify-center gap-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`px-8 py-3 rounded-md font-medium transition-colors
                    ${
                      isOptionSelected(option)
                        ? 'bg-blue-100 border-blue-500 border-2 text-blue-700'
                        : 'bg-white border-gray-300 border text-gray-700'
                    }
                    ${
                      isAnswerSubmitted && isCorrectAnswer(option)
                        ? 'bg-green-100 border-green-500 border-2 text-green-700'
                        : ''
                    }
                    ${
                      isAnswerSubmitted &&
                      isOptionSelected(option) &&
                      !isCorrectAnswer(option)
                        ? 'bg-red-100 border-red-500 border-2 text-red-700'
                        : ''
                    }`}
                onClick={() => handleAnswerSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        ) : currentQuestion.options ? (
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`p-3 rounded-md cursor-pointer transition-colors flex items-center
                    ${
                      isOptionSelected(option)
                        ? 'bg-blue-100 border-blue-500 border text-blue-700'
                        : 'bg-white border-gray-300 border text-gray-700 hover:bg-gray-50'
                    }
                    ${
                      isAnswerSubmitted && isCorrectAnswer(option)
                        ? 'bg-green-100 border-green-500 border text-green-700'
                        : ''
                    }
                    ${
                      isAnswerSubmitted &&
                      isOptionSelected(option) &&
                      !isCorrectAnswer(option)
                        ? 'bg-red-100 border-red-500 border text-red-700'
                        : ''
                    }`}
                onClick={() => handleAnswerSelect(option)}
              >
                <div
                  className={`w-5 h-5 ${
                    questionType === 'multi-choice' ? 'rounded' : 'rounded-full'
                  } border flex-shrink-0 mr-3 flex items-center justify-center
                    ${
                      isOptionSelected(option)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }
                    ${
                      isAnswerSubmitted && isCorrectAnswer(option)
                        ? 'border-green-500 bg-green-500'
                        : ''
                    }
                    ${
                      isAnswerSubmitted &&
                      isOptionSelected(option) &&
                      !isCorrectAnswer(option)
                        ? 'border-red-500 bg-red-500'
                        : ''
                    }`}
                >
                  {(isOptionSelected(option) ||
                    (isAnswerSubmitted && isCorrectAnswer(option))) &&
                    (questionType === 'multi-choice' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    ))}
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>
        ) : (
          // Fallback for questions without options - text input or boolean
          <div className="flex justify-center gap-4 mb-8">
            <button
              className={`px-8 py-3 rounded-md font-medium transition-colors
                  ${
                    selectedAnswers[currentQuestionIndex] === 'Yes'
                      ? 'bg-blue-100 border-blue-500 border-2 text-blue-700'
                      : 'bg-white border-gray-300 border text-gray-700'
                  }
                  ${
                    isAnswerSubmitted && 'Yes' === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500 border-2 text-green-700'
                      : ''
                  }
                  ${
                    isAnswerSubmitted &&
                    selectedAnswers[currentQuestionIndex] === 'Yes' &&
                    'Yes' !== currentQuestion.correctAnswer
                      ? 'bg-red-100 border-red-500 border-2 text-red-700'
                      : ''
                  }`}
              onClick={() => handleAnswerSelect('Yes')}
            >
              Yes
            </button>
            <button
              className={`px-8 py-3 rounded-md font-medium transition-colors
                  ${
                    selectedAnswers[currentQuestionIndex] === 'No'
                      ? 'bg-blue-100 border-blue-500 border-2 text-blue-700'
                      : 'bg-white border-gray-300 border text-gray-700'
                  }
                  ${
                    isAnswerSubmitted && 'No' === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500 border-2 text-green-700'
                      : ''
                  }
                  ${
                    isAnswerSubmitted &&
                    selectedAnswers[currentQuestionIndex] === 'No' &&
                    'No' !== currentQuestion.correctAnswer
                      ? 'bg-red-100 border-red-500 border-2 text-red-700'
                      : ''
                  }`}
              onClick={() => handleAnswerSelect('No')}
            >
              No
            </button>
          </div>
        )}

        <div className="flex justify-between border-t border-gray-200 pt-4">
          <button
            onClick={moveToPrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 flex items-center gap-1 rounded
                ${
                  currentQuestionIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            PREVIOUS
          </button>

          <div>
            {!isAnswerSubmitted && isAnswerSelected() && (
              <button
                onClick={handleSubmitAnswer}
                className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
              >
                Submit
              </button>
            )}

            {(isAnswerSubmitted || !isAnswerSelected()) && (
              <button
                onClick={moveToNext}
                className="px-4 py-2 flex items-center gap-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
              >
                {currentQuestionIndex < questions.length - 1
                  ? 'NEXT'
                  : 'FINISH'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay;
