// File: src/app/api/quizzes/[id]/submit/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { answers } = await request.json();
    console.log("Received answers:", answers); // Debug log

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(params.id) },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    let score = 0;
    quiz.questions.forEach((question) => {
      if (answers[question.id] === parseInt(question.answer)) {
        score++;
      }
    });

    const totalQuestions = quiz.questions.length;

    try {
      const result = await prisma.quizResult.create({
        data: {
          score,
          userId: decoded.userId,
          quizId: parseInt(params.id),
        },
      });
      console.log("Quiz result created:", result); // Debug log
    } catch (prismaError) {
      console.error("Error creating quiz result:", prismaError);
      return NextResponse.json(
        { message: `Error saving quiz result: ${prismaError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ score, totalQuestions });
  } catch (error) {
    console.error("Server error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { message: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
