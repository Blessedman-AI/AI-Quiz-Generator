'use client';

import React, { useState, useCallback } from 'react';
import GeneratingModal from './GeneratingModal';
import QuizDisplay from './QuizDisplay';
import { generateQuestions } from '@/utils/generateQuestions';
import WordLimitedInput from '@/utils/TextInputWithLimit';
import DocumentUploadDisplay from './DocumentUploadDisplay';

const QuizGenerator = () => {
  const [numQuestions, setNumQuestions] = useState(3);
  const [inputTab, setInputTab] = useState('prompt');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const wordLimit = 1000;

  const handleGenerateQuestions = async (textContent) => {
    if (!textContent.trim()) {
      setError('Please enter a prompt or upload a document');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const parsedQuestions = await generateQuestions(
        textContent,
        numQuestions,
        inputTab
      );
      setQuestions(parsedQuestions);
      setShowQuiz(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for word count updates
  const handleWordCountChange = (count, limitReached) => {
    setWordCount(count);
    setIsLimitReached(limitReached);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleGenerateQuestions(content);
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
    setFileName('');
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
            <div className=" flex  md:flex-row md:justify-between gap-4 mb-4 w-full">
              {/* Input Tab Buttons */}
              <div
                className="md:flex-1 flex flex-col md:items-end
                justify-end"
              >
                <div
                  className="grid grid-cols-2 w-full md:w-[70%]  border 
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
              <div className="flex-1 justify-center ">
                <div
                  className="flex mb-1 justify-center items-center md:w-[40%]
                 w-full "
                >
                  <label className="  text-sm font-medium  text-gray-700">
                    Number of questions
                  </label>
                </div>
                <div className="flex md:w-[40%] justify-center ">
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) =>
                      setNumQuestions(parseInt(e.target.value, 10))
                    }
                    min={1}
                    max={50}
                    className="w-[90%] md:w-[70%] p-2 border border-gray-300
                   rounded-md focus:outline-none focus:ring-0 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Input Card */}
            <div className="mt-8">
              {inputTab === 'prompt' ? (
                <WordLimitedInput
                  value={content}
                  onChange={setContent}
                  placeholder="Enter a prompt..."
                  wordLimit={wordLimit}
                  onWordCountChange={handleWordCountChange}
                />
              ) : (
                <DocumentUploadDisplay
                  fileName={fileName}
                  content={content}
                  onContentChange={setContent}
                  onFileNameChange={setFileName}
                  wordLimit={wordLimit}
                  wordCount={wordCount}
                  isLimitReached={isLimitReached}
                  onWordCountChange={handleWordCountChange}
                  onAutoGenerate={(textContent) =>
                    handleGenerateQuestions(textContent)
                  }
                />
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 mb-4 text-center">{error}</div>
          )}

          {/* Button */}
          <div className="flex justify-between">
            <div className="w-full flex justify-between mb-4">
              <span
                className={isLimitReached ? 'text-red-700' : 'text-gray-500'}
              >
                {wordCount} / {wordLimit} words
                {isLimitReached && ' (limit reached)'}
              </span>
            </div>
            <>
              <button
                onClick={handleSubmit}
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700
             text-white font-medium py-2 px-6 rounded-md
              transition-colors cursor-pointer disabled:bg-blue-400"
              >
                Generate
              </button>
            </>
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
