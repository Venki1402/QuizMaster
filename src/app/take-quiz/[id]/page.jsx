'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TakeQuiz({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    } else {
      fetchQuiz(token);
    }
  }, []);

  const fetchQuiz = async (token) => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);
        setAnswers(
          Object.fromEntries(quizData.questions.map((q) => [q.id, null]))
        );
      } else {
        setError('Failed to load quiz');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('An error occurred while loading the quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/quizzes/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });
      if (response.ok) {
        const result = await response.json();
        router.push(`/quiz-result/${params.id}?score=${result.score}`);
      } else {
        setError('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('An error occurred while submitting the quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-100 p-4 font-mono text-black">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
        {quiz && (
          <>
            <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
            <p className="mb-6">{quiz.description}</p>
            <form onSubmit={handleSubmit}>
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Question {index + 1}
                  </h2>
                  <p className="mb-2">{question.text}</p>
                  {JSON.parse(question.options).map((option, optionIndex) => (
                    <div key={optionIndex} className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionIndex}
                          checked={answers[question.id] === optionIndex}
                          onChange={() =>
                            handleAnswerChange(question.id, optionIndex)
                          }
                          className="mr-2"
                          required
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Submit Quiz
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}