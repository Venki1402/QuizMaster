"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], answer: 0 },
  ]);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], answer: 0 },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, questions }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-green-100 p-8 font-mono text-black">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-6 p-4 border rounded">
              <h3 className="text-xl mb-2">Question {qIndex + 1}</h3>
              <input
                type="text"
                value={question.text}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "text", e.target.value)
                }
                className="w-full p-2 border rounded mb-2"
                placeholder="Enter question"
                required
              />
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, e.target.value)
                    }
                    className="flex-grow p-2 border rounded mr-2"
                    placeholder={`Option ${oIndex + 1}`}
                    required
                  />
                  <input
                    type="radio"
                    name={`correct-answer-${qIndex}`}
                    checked={question.answer === oIndex}
                    onChange={() =>
                      handleQuestionChange(qIndex, "answer", oIndex)
                    }
                    required
                  />
                </div>
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
          >
            Add Question
          </button>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Create Quiz
          </button>
        </form>
        <Link
          href="/dashboard"
          className="block mt-4 text-blue-500 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
