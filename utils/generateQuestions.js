import axios from 'axios';

/**
 * Generates quiz questions based on provided content
 * @param {string} textContent - The content to generate questions from
 * @param {number} numQuestions - Number of questions to generate
 * @param {string} inputTab - Source type ('prompt' or 'document')
 * @returns {Promise<Array>} - Array of generated questions
 */
export const generateQuestions = async (
  textContent,
  numQuestions,
  inputTab
) => {
  if (!textContent.trim()) {
    throw new Error('Please enter a prompt or upload a document');
  }

  try {
    const response = await axios.post('/api/generate-questions', {
      content: textContent,
      numQuestions,
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

    return parsedQuestions;
  } catch (err) {
    const errorMessage =
      err.response?.data?.error ||
      err.message ||
      'Failed to generate questions';
    throw new Error(errorMessage);
  }
};
