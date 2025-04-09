// DocumentUploadDisplay.js
'use client';

import FileUploader from '@/utils/FileUploader';
import React from 'react';

const DocumentUploadDisplay = ({
  fileName,
  content,
  onContentChange,
  onFileNameChange,
  wordLimit,
  wordCount,
  isLimitReached,
  onWordCountChange,
  onAutoGenerate,
}) => {
  // Get file upload utility functions
  const {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileUpload,
    resetFile,
    isDragging,
    isExtracting,
    isUploading,
    error,
  } = FileUploader({
    onContentChange,
    onFileNameChange,
    wordLimit,
    onWordCountChange,
    onAutoGenerate,
  });

  console.log('State values:', { isExtracting, isUploading });

  // Function to handle manual text changes with word limit
  const handleTextChange = (e) => {
    const newText = e.target.value;
    const words = newText.trim().split(/\s+/);
    const count = words.length;

    onWordCountChange(count, count > wordLimit);

    if (count > wordLimit) {
      // If already over limit, don't allow more text
      if (newText.length > content.length) {
        return;
      }
    }

    onContentChange(newText);
    // console.log('is doing something🩸', isExtracting, isUploading);
  };

  if (fileName) {
    return (
      <div className="bg-[#eff2fe] rounded-lg p-8 text-center min-h-[250px]">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center bg-white rounded-lg p-4 mb-4 w-full max-w-md">
            <svg
              className="w-8 h-8 text-blue-500 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-gray-700 truncate max-w-xs">{fileName}</span>
          </div>
          {isExtracting || isUploading ? (
            <div className="flex flex-col justify-center items-center mt-4">
              <div className="text-center mb-2 text-sm font-medium text-gray-500">
                Loading document...
              </div>
              <div>
                <svg
                  className="animate-spin h-10 w-10 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              </div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={handleTextChange}
              className="w-full min-h-[150px] p-3 bg-white border border-gray-200 rounded-md resize-y 
             focus:outline-none text-gray-700 mb-4"
              placeholder="Extracted content appears here. You can edit if needed."
            />
          )}
          {!isExtracting && !isUploading && (
            <button
              onClick={resetFile}
              className="text-blue-600 hover:underline"
            >
              Upload a different file
            </button>
          )}
          {/* <button onClick={resetFile} className="text-blue-600 hover:underline">
            Upload a different file
          </button> */}
        </div>
      </div>
    );
  }

  return (
    /* File Upload UI with Drag and Drop */
    <div
      className={`bg-[#eff2fe] rounded-lg p-8 text-center min-h-[250px] flex flex-col items-center justify-center transition-colors duration-200 ${
        isDragging ? 'bg-blue-100 border-2 border-dashed border-blue-400' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
        {isDragging ? 'Drop your file here' : 'Drop your file here or'}
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
        accept=".pdf,.txt,.doc,.docx,.ppt,.pptx"
      />
      <p className="text-sm text-gray-500 mt-2">
        Supported formats: PDF, DOCX, TXT
      </p>

      {error && <div className="text-red-500 mt-3">{error}</div>}
    </div>
  );
};

export default DocumentUploadDisplay;
