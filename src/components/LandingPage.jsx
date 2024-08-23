'use client';

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-green-100 text-gray-800 font-mono flex flex-col">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">QuizMaster</div>
          <div className="hidden md:flex space-x-4">
            <Link href="/signin" className="hover:underline">
              Sign In
            </Link>
            <Link href="/signup" className="hover:underline">
              Sign Up
            </Link>
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            Menu
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/signin" className="block hover:underline">
              Sign In
            </Link>
            <Link href="/signup" className="block hover:underline">
              Sign Up
            </Link>
          </div>
        )}
      </nav>
      <main className="flex-grow container mx-auto px-6 py-12 flex flex-col justify-center items-center text-center">
        <h1 className="text-6xl font-bold mb-8">Welcome to QuizMaster</h1>
        <p className="text-xl mb-10">
          Test your knowledge with our interactive quizzes!
        </p>
        <div className="space-x-4">
          <Link
            href="/signin"
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 text-lg"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300 text-lg"
          >
            Learn More
          </Link>
        </div>
      </main>
    </div>
  );
}