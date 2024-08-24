"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchUserData = useCallback(async (token) => {
    try {
      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data. Please try signing in again.");
    }
  }, []);

  const fetchQuizzes = useCallback(async (token) => {
    try {
      const response = await fetch("/api/quizzes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const quizzesData = await response.json();
        setQuizzes(quizzesData);
      } else {
        throw new Error("Failed to fetch quizzes");
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to load quizzes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    } else {
      fetchUserData(token);
      fetchQuizzes(token);
    }
  }, [router, fetchUserData, fetchQuizzes]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-green-100 p-8 font-mono text-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>

        {user?.role === "STUDENT" && (
          <div>
            <h2 className="text-2xl mb-4">Available Quizzes</h2>
            {quizzes.length > 0 ? (
              <ul className="space-y-2">
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="bg-white p-4 rounded shadow">
                    <Link
                      href={`/take-quiz/${quiz.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {quiz.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No quizzes available yet.</p>
            )}
          </div>
        )}

        {user?.role === "INSTRUCTOR" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">Your Quizzes</h2>
              <Link
                href="/create-quiz"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create New Quiz
              </Link>
            </div>
            {quizzes.length > 0 ? (
              <ul className="space-y-2">
                {quizzes.map((quiz) => (
                  <li
                    key={quiz.id}
                    className="bg-white p-4 rounded shadow flex justify-between items-center"
                  >
                    <span>{quiz.title}</span>
                    <Link
                      href={`/edit-quiz/${quiz.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You haven&apos;t created any quizzes yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
