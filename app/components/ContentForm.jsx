'use client';
import axios from 'axios';
import { useState } from 'react';
import QuestionsList from './QuestionList';

export default function ContentForm() {
  const [content, setContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [format, setFormat] = useState('multiple-choice');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/generate-questions', {
        content,
        numQuestions,
        format,
      });

      //   setQuestions(JSON.parse(response.data.result));
      // The result might already be parsed JSON
      const result =
        typeof response.data.result === 'string'
          ? JSON.parse(response.data.result)
          : response.data.result;

      setQuestions(result);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Failed to generate questions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full h-full m-auto p-2 lg:p-4">
      <h1 className="text-2xl font-bold mb-4">AI Quiz Generator</h1>
      <div
        className="lg:flex items-center  w-full
       bg-amber-500 lg:p-8"
      >
        <div className="bg-teal-500 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Paste your content or document
              </label>
              <textarea
                className="w-full h-60 p-2 border rounded"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">
                  Number of questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full p-2 border rounded"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">
                  Question format
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="true-false">True/False</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-[90%] py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Generating...' : 'Generate Questions'}
            </button>

            {error && <p className="text-red-500">{error}</p>}
          </form>
        </div>
        <div className="bg-blue-600 flex-1  overflow-y-scroll">
          {/* <p>
            However, building and maintaining quantum computers is an extremely
            challenging task. Qubits are highly sensitive to environmental
            noise, which can cause decoherence, the loss of quantum information.
            Researchers are exploring various technologies to build stable
            qubits, including superconducting circuits, trapped ions, and
            photonic systems. The potential applications of quantum computing
            are vast, spanning fields such as: Cryptography: Shor's algorithm
            poses a threat to current encryption methods, but quantum
            cryptography also offers new secure communication protocols.
            Materials science: Quantum simulations can model the behavior of
            complex molecules, leading to the discovery of new materials. Drug
            discovery: Quantum computers can accelerate the process of designing
            new drugs by simulating molecular interactions. Optimization:
            Quantum algorithms can solve complex optimization problems, such as
            those found in logistics and finance. Artificial Intelligence:
            Quantum machine learning has the potential to dramatically increase
            the rate of machine learning processes. While quantum computing is
            still in its early stages of development, it holds the promise of
            revolutionizing computation and solving some of the most challenging
            problems facing humanity. However, building and maintaining quantum
            computers is an extremely challenging task. Qubits are highly
            sensitive to environmental noise, which can cause decoherence, the
            loss of quantum information. Researchers are exploring various
            technologies to build stable qubits, including superconducting
            circuits, trapped ions, and photonic systems. The potential
            applications of quantum computing are vast, spanning fields such as:
            Cryptography: Shor's algorithm poses a threat to current encryption
            methods, but quantum cryptography also offers new secure
            communication protocols. Materials science: Quantum simulations can
            model the behavior of complex molecules, leading to the discovery of
            new materials. Drug discovery: Quantum computers can accelerate the
            process of designing new drugs by simulating molecular interactions.
            Optimization: Quantum algorithms can solve complex optimization
            problems, such as those found in logistics and finance. Artificial
            Intelligence: Quantum machine learning has the potential to
            dramatically increase the rate of machine learning processes. While
            quantum computing is still in its early stages of development, it
            holds the promise of revolutionizing computation and solving some of
            the most challenging problems facing humanity. However, building and
            maintaining quantum computers is an extremely challenging task.
            Qubits are highly sensitive to environmental noise, which can cause
            decoherence, the loss of quantum information. Researchers are
            exploring various technologies to build stable qubits, including
            superconducting circuits, trapped ions, and photonic systems. The
            potential applications of quantum computing are vast, spanning
            fields such as: Cryptography: Shor's algorithm poses a threat to
            current encryption methods, but quantum cryptography also offers new
            secure communication protocols. Materials science: Quantum
            simulations can model the behavior of complex molecules, leading to
            the discovery of new materials. Drug discovery: Quantum computers
            can accelerate the process of designing new drugs by simulating
            molecular interactions. Optimization: Quantum algorithms can solve
            complex optimization problems, such as those found in logistics and
            finance. Artificial Intelligence: Quantum machine learning has the
            potential to dramatically increase the rate of machine learning
            processes. While quantum computing is still in its early stages of
            development, it holds the promise of revolutionizing computation and
            solving some of the most challenging problems facing humanity.
          </p> */}
          {questions && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Generated Questions</h2>
              <QuestionsList questions={questions?.questions} format={format} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
