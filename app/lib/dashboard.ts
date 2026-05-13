import { prisma } from "@/lib/prisma"

export async function getDashboardData(userId: string) {
  const [userQuizzes, recentAttempts, subjects, stats] = await Promise.all([
    // Full attempt cards with score + retake link (main section)
    prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 6,
      include: {
        quiz: {
          select: {
            title: true,
            subject: { select: { id: true, name: true } },
            _count: { select: { quizFlashcards: true } },
          },
        },
      },
    }),
    // Compact timeline (sidebar)
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

  return { userQuizzes, recentAttempts, subjects, stats }
}
