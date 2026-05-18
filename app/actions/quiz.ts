"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Difficulty } from "@prisma/client"

export async function createDynamicQuiz(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const subjectId = formData.get("subjectId") as string
  const difficultyParam = formData.get("difficulty") as string
  const cardCount = Math.min(
    20,
    Math.max(1, parseInt(formData.get("cardCount") as string) || 10)
  )

  const questionFilter = (formData.get("questionFilter") as string) || "ALL"
  const isMixed = difficultyParam === "MIXED"
  const difficulty = isMixed ? undefined : (difficultyParam as Difficulty)
  const baseWhere = { subjectId, ...(difficulty && { difficulty }) }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { name: true },
  })
  if (!subject) redirect("/dashboard/quiz/start")

  let selected: { id: string }[]

  if (questionFilter === "TOP_FREQUENCY") {
    selected = await prisma.flashcard.findMany({
      where: { ...baseWhere, frequency: { gt: 0 } },
      orderBy: { frequency: "desc" },
      select: { id: true },
      take: cardCount,
    })
  } else if (questionFilter === "LAST_5_YEARS") {
    const minYear = String(new Date().getFullYear() - 5)
    const pool = await prisma.flashcard.findMany({
      where: { ...baseWhere, sources: { some: { year: { gte: minYear } } } },
      select: { id: true },
    })
    selected = pool.sort(() => Math.random() - 0.5).slice(0, cardCount)
  } else {
    const pool = await prisma.flashcard.findMany({
      where: baseWhere,
      select: { id: true },
    })
    selected = pool.sort(() => Math.random() - 0.5).slice(0, cardCount)
  }

  if (selected.length === 0) redirect("/dashboard/quiz/start")

  const diffLabel = isMixed
    ? "Mixed"
    : difficulty!.charAt(0) + difficulty!.slice(1).toLowerCase()

  const filterLabel =
    questionFilter === "LAST_5_YEARS" ? "Recent (5yr)"
    : questionFilter === "TOP_FREQUENCY" ? "Top Questions"
    : "Practice"

  const quiz = await prisma.quiz.create({
    data: {
      title: `${diffLabel} ${filterLabel} — ${subject.name}`,
      subjectId,
      quizFlashcards: {
        create: selected.map((f, i) => ({ flashcardId: f.id, order: i })),
      },
    },
  })

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId: quiz.id,
      score: 0,
      totalQuestions: selected.length,
      correctAnswers: 0,
      durationSeconds: 0,
      startedAt: new Date(),
    },
  })

  redirect(`/dashboard/quiz/${attempt.id}`)
}

export async function completeQuizAttempt(
  attemptId: string,
  answers: {
    flashcardId: string
    isCorrect: boolean
    timeSpentSeconds: number
  }[],
  durationSeconds: number
) {
  const session = await auth()
  if (!session?.user?.id) return

  const correctAnswers = answers.filter((a) => a.isCorrect).length
  const score =
    answers.length > 0 ? Math.round((correctAnswers / answers.length) * 100) : 0

  await prisma.quizAttempt.update({
    where: { id: attemptId, userId: session.user.id },
    data: {
      score,
      correctAnswers,
      totalQuestions: answers.length,
      durationSeconds,
      completedAt: new Date(),
      answers: {
        create: answers.map((a) => ({
          flashcardId: a.flashcardId,
          selectedAnswer: a.isCorrect ? "correct" : "incorrect",
          isCorrect: a.isCorrect,
          timeSpentSeconds: a.timeSpentSeconds,
        })),
      },
    },
  })
}
