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

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(params.id) },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    let score = 0;
    quiz.questions.forEach((question) => {
      if (parseInt(question.answer) === answers[question.id]) {
        score++;
      }
    });

    const result = await prisma.quizResult.create({
      data: {
        score,
        userId: decoded.userId,
        quizId: quiz.id,
      },
    });

    return NextResponse.json({ score, total: quiz.questions.length });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
