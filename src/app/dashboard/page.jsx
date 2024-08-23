"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    } else {
      fetchUserData(token);
      fetchQuizzes(token);
    }
  }, []);

  const fetchUserData = async (token) => {
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
        // Token is invalid or expired
        localStorage.removeItem("token");
        router.push("/signin");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (token) => {
    try {
      const response = await fetch("/api/quizzes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const quizzesData = await response.json();
        setQuizzes(quizzesData);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

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
              <ul>
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="mb-2">
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
            <h2 className="text-2xl mb-4">Your Quizzes</h2>
            {quizzes.length > 0 ? (
              <ul>
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="mb-2">
                    {quiz.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p>You haven't created any quizzes yet.</p>
            )}
            <Link
              href="/create-quiz"
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create New Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
