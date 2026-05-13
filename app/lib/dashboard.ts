import { prisma } from "@/lib/prisma"

export async function getDashboardData(userId: string) {
  const [recentAttempts, availableQuizzes, subjects, stats] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: {
        quiz: {
          select: {
            title: true,
            subject: { select: { name: true } },
          },
        },
      },
    }),
    prisma.quiz.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { name: true } },
        _count: { select: { quizFlashcards: true } },
      },
    }),
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { quizzes: true, flashcards: true } },
      },
    }),
    prisma.quizAttempt.aggregate({
      where: { userId },
      _count: { id: true },
      _avg: { score: true },
    }),
  ])

  return { recentAttempts, availableQuizzes, subjects, stats }
}
