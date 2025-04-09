// FileUploader.js
'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { extractPdfText } from '@/utils/pdfExtractor';

const FileUploader = ({
  onContentChange,
  onFileNameChange,
  wordLimit,
  onWordCountChange,
  onAutoGenerate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Process the dropped file
      handleFileUpload({ target: { files: [files[0]] } });
    }
  }, []);

  // Process text to respect word limit
  const processTextWithWordLimit = (text) => {
    if (!text) return '';

    const words = text.trim().split(/\s+/);
    const wordCount = words.length;

    // Update word count
    onWordCountChange(wordCount, wordCount > wordLimit);

    // If text exceeds word limit, truncate it
    if (wordCount > wordLimit) {
      return words.slice(0, wordLimit).join(' ');
    }

    return text;
  };

  // In FileUploader.js - update the handleFileUpload function
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('extracting file....');
    setIsExtracting(true);
    setError('');
    onFileNameChange(file.name);
    console.log('extracting?🩸', isExtracting);

    try {
      let extractedText = '';

      // Handle different file types
      if (file.type === 'application/pdf') {
        // Extract text from PDF using PDF.js
        extractedText = await extractPdfText(file);
      } else if (file.type.includes('text/')) {
        // For text files, simply read as text
        extractedText = await file.text();
      } else if (
        file.type.includes(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) ||
        file.type.includes('application/msword') ||
        file.type.includes('application/vnd.ms-powerpoint') ||
        file.type.includes(
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
      ) {
        // For DOCX, DOC, PPT, PPTX - use server processing
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        setIsUploading(true);
        console.log('Uploading document to server:', file.name, file.type);

        // Upload file to get its text content
        const uploadResponse = await axios.post(
          '/api/extract-document',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        console.log('Server response:', uploadResponse);

        // Check if the response has the text field
        if (uploadResponse.data && uploadResponse.data.text) {
          extractedText = uploadResponse.data.text;
        } else {
          throw new Error(
            'Invalid response from server: ' +
              JSON.stringify(uploadResponse.data)
          );
        }
      } else {
        throw new Error('Unsupported file format: ' + file.type);
      }
      setIsUploading(false);
      // Check if raw extracted text exceeds word limit BEFORE truncating
      const originalWords = extractedText.trim().split(/\s+/);
      const originalWordCount = originalWords.length;
      const limitReached = originalWordCount > wordLimit;

      console.log('Original word count:', originalWordCount);
      console.log('Word limit:', wordLimit);
      console.log('Limit reached:', limitReached);

      // Process text with word limit (truncate if needed)
      const processedText = processTextWithWordLimit(extractedText);
      onContentChange(processedText);

      // Auto-generate quiz only if word limit wasn't reached
      if (!limitReached && processedText.trim()) {
        onAutoGenerate(processedText);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process document');
    } finally {
      setIsExtracting(false);
      setIsUploading(false);
    }
  };

  // Reset content and filename
  const resetFile = () => {
    onContentChange('');
    onFileNameChange('');
    onWordCountChange(0, false);
  };

  return {
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
  };
};

export default FileUploader;
