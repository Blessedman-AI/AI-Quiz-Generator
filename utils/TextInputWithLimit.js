'use client';

import React, { useState, useEffect } from 'react';

const WordLimitedInput = ({
  value = '',
  onChange,
  wordLimit = 100,
  placeholder = '',
  className = '',
  multiline = false,
  rows = 8,
  onWordCountChange = () => {},
  ...rest
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Update word count whenever value changes
  useEffect(() => {
    const count = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
    setWordCount(count);
    const limitReached = count >= wordLimit;
    setIsLimitReached(limitReached);

    // Notify parent component of changes
    onWordCountChange(count, limitReached);
  }, [value, wordLimit, onWordCountChange]);

  // Handle content change while respecting word limit
  const handleChange = (e) => {
    const newText = e.target.value;

    // Process the text to respect the word limit
    const truncatedText = truncateToWordLimit(newText, wordLimit);

    // Update the state with the truncated text
    onChange(truncatedText);
  };

  // Handle paste events
  const handlePaste = (e) => {
    // Get pasted content
    const pastedText = e.clipboardData.getData('text');

    // Combine with existing text
    const cursorPosition = e.target.selectionStart;
    const endPosition = e.target.selectionEnd;
    const currentText = value;

    const newText =
      currentText.substring(0, cursorPosition) +
      pastedText +
      currentText.substring(endPosition);

    // Truncate to word limit and update
    const truncatedText = truncateToWordLimit(newText, wordLimit);

    // Prevent default paste behavior
    e.preventDefault();

    // Update the state with the truncated text
    onChange(truncatedText);
  };

  // Helper function to truncate text to word limit
  const truncateToWordLimit = (text, limit) => {
    if (!text || text.trim() === '') return '';

    const words = text.split(/\s+/);
    if (words.length <= limit) {
      return text;
    }

    // Join only the allowed number of words
    return words.slice(0, limit).join(' ');
  };

  const baseClasses = `w-full min-h-[250px] p-3 bg-[#eff2fe] rounded-md resize-y
                   focus:outline-none text-gray-700 ${className}`;

  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={`${baseClasses}`}
        rows={rows}
        {...rest}
      />
    </div>
  );
};

export default WordLimitedInput;
