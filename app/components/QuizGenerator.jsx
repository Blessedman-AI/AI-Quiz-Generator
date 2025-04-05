'use client';
import React, { useState } from 'react';
import axios from 'axios';
import GeneratingModal from './GeneratingModal';
import QuizDisplay from './QuizDisplay';

const QuizGenerator = () => {
  const [numQuestions, setNumQuestions] = useState(3);
  const [questionType, setQuestionType] = useState('multi-choice');
  const [inputTab, setInputTab] = useState('prompt');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // const handleFileUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     // Create a FormData object to send the file
  //     const formData = new FormData();
  //     formData.append('file', file);

  //     // Upload file to get its text content
  //     const uploadResponse = await axios.post(
  //       '/api/extract-document',
  //       formData
  //     );

  //     // Access the response data as needed
  //     const { text } = uploadResponse.data.json();

  //     setContent(text); // Store extracted text in content state
  //   } catch (err) {
  //     setError(err.message || 'Failed to process document');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputTab === 'prompt' && !content.trim()) {
      setError('Please enter a prompt for your quiz');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/generate-questions', {
        content,
        numQuestions,
        questionType,
        source: inputTab,
      });

      const result = JSON.parse(response.data.result);

      // Ensure we have the questions array
      let parsedQuestions = [];
      if (result.questions) {
        parsedQuestions = result.questions;
      } else if (Array.isArray(result)) {
        parsedQuestions = result;
      } else {
        throw new Error('Invalid question format returned from API');
      }

      // For yes-no questions, ensure the options are properly formatted
      if (questionType === 'yes-no') {
        parsedQuestions = parsedQuestions.map((question) => {
          // If options aren't provided for yes-no questions, add them
          if (!question.options) {
            return {
              ...question,
              options: ['Yes', 'No'],
            };
          }
          return question;
        });
      }

      setQuestions(parsedQuestions);
      setShowQuiz(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Failed to generate questions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    setShowQuiz(false);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  const handleCreateNewQuiz = () => {
    setQuestions(null);
    setQuizResult(null);
    setContent('');
  };

  return (
    <div className="w-5xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          AI Quiz Generator
        </h1>
      </div>

      {quizResult ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Quiz Results</h2>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-blue-500 mb-4">
              <div>
                <span className="text-4xl font-bold text-blue-500">
                  {quizResult.score}
                </span>
                <span className="text-xl text-gray-500">
                  /{quizResult.total}
                </span>
              </div>
            </div>
            <p className="text-xl font-semibold">{quizResult.percentage}%</p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowQuiz(true)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleCreateNewQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium"
            >
              Create New Quiz
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Form Section */}
          <div className="w-full mb-6">
            {/* Options Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Input Tab Buttons */}
              <div className="flex-1 flex flex-col justify-end">
                <div
                  className="grid grid-cols-2 w-full md:w-auto border 
                   border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className={`py-2 px-4 text-center font-medium transition-colors ${
                      inputTab === 'prompt'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setInputTab('prompt')}
                  >
                    Prompt
                  </button>
                  <button
                    className={`py-2 px-4 text-center font-medium transition-colors ${
                      inputTab === 'document'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setInputTab('document')}
                  >
                    Document
                  </button>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Number of questions
                </label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) =>
                    setNumQuestions(parseInt(e.target.value, 10))
                  }
                  min={1}
                  max={50}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                />
              </div>

              {/* Type of Questions */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Type of questions
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 bg-white"
                >
                  <option value="multi-choice">Multi Choice</option>
                  <option value="single-choice">Single Choice</option>
                  <option value="yes-no">Yes or No</option>
                </select>
              </div>
            </div>

            {/* Input Card */}
            <div className="mt-8">
              {inputTab === 'prompt' ? (
                <textarea
                  placeholder="Enter a prompt..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[250px] p-3 bg-[#eff2fe] rounded-md resize-y 
                   focus:outline-none text-gray-700"
                />
              ) : (
                <div className="bg-[#eff2fe] rounded-lg p-8 text-center min-h-[250px]">
                  {/* File Upload UI */}
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-lg font-medium mb-2 text-gray-700">
                      Drop your file here or
                    </p>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 
                       text-white rounded-md px-4 py-2 transition-colors"
                    >
                      Browse Files
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: PDF, DOCX, PPT, TXT
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 mb-4 text-center">{error}</div>
          )}

          {/* Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700
             text-white font-medium py-2 px-6 rounded-md
              transition-colors cursor-pointer"
            >
              Generate
            </button>
          </div>
        </>
      )}

      {/* Modals */}
      <GeneratingModal isGenerating={isLoading} />

      {showQuiz && questions && (
        <QuizDisplay
          questions={questions}
          onComplete={handleQuizComplete}
          onClose={handleCloseQuiz}
        />
      )}
    </div>
  );
};

export default QuizGenerator;
