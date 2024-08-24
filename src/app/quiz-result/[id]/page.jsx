// File: src/app/quiz-result/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function QuizResult({ params, searchParams }) {
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const score = parseInt(searchParams.score) || 0;
  const totalQuestions = parseInt(searchParams.total) || 0;

  useEffect(() => {
    const fetchQuizTitle = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin");
          return;
        }

        const response = await fetch(`/api/quizzes/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const quizData = await response.json();
          setQuizTitle(quizData.title);
        } else {
          console.error("Failed to fetch quiz title");
        }
      } catch (error) {
        console.error("Error fetching quiz title:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizTitle();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-100 p-4 font-mono text-black text-lg">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-6">Quiz Results</h1>
        <h2 className="text-2xl mb-4">{quizTitle}</h2>
        <p className="text-xl mb-4">
          You scored {score} out of {totalQuestions}
        </p>
        <p className="text-2xl font-bold mb-6">{percentage.toFixed(2)}%</p>
        <p className="text-lg mb-6">
          {percentage === 100
            ? "Perfect score! Excellent work!"
            : percentage >= 70
            ? "Great job! You've done well."
            : percentage >= 50
            ? "Good effort! There's room for improvement."
            : "Keep practicing. You'll do better next time!"}
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href={`/take-quiz/${params.id}`}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Retake Quiz
          </Link>
          <Link
            href="/dashboard"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
