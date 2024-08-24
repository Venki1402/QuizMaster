"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TakeQuiz({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
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
        const errorData = await response.json();
        setError(`Failed to load quiz: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setError(`An error occurred while loading the quiz: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please sign in again.");
        router.push("/signin");
        return;
      }
      const response = await fetch(`/api/quizzes/${params.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });
      if (response.ok) {
        const result = await response.json();
        router.push(
          `/quiz-result/${params.id}?score=${result.score}&total=${result.total}`
        );
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Failed to submit quiz. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError(
        "An error occurred while submitting the quiz. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center text-xl">{error}</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-green-100 p-8 font-mono text-black text-lg flex justify-center items-center">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-6">{quiz.title}</h1>
        <p className="mb-6">{quiz.description}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </h2>
            <p className="mb-4">{currentQuestion.text}</p>
            {JSON.parse(currentQuestion.options).map((option, optionIndex) => (
              <div key={optionIndex} className="mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={optionIndex}
                    checked={answers[currentQuestion.id] === optionIndex}
                    onChange={() =>
                      handleAnswerChange(currentQuestion.id, optionIndex)
                    }
                    className="mr-3 h-5 w-5"
                    required
                  />
                  {option}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-300 text-black px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
