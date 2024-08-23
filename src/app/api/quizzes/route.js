import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let quizzes;

    if (decoded.role === "INSTRUCTOR") {
      quizzes = await prisma.quiz.findMany({
        where: { creatorId: decoded.userId },
        select: { id: true, title: true },
      });
    } else {
      quizzes = await prisma.quiz.findMany({
        select: { id: true, title: true },
      });
    }

    return NextResponse.json(quizzes);
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
