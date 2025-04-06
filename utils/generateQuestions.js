import axios from 'axios';

const generateQuestions = async (textContent) => {
  if (!textContent.trim()) {
    setError('Please enter a prompt or upload a document');
    return;
  }

  setIsLoading(true);
  setError('');

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
