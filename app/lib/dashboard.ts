import { prisma } from "@/lib/prisma"

export const QUIZ_PAGE_SIZE = 12

export async function getDashboardData(userId: string, page = 1) {
  const skip = (page - 1) * QUIZ_PAGE_SIZE

  const [userQuizzes, totalQuizzes, recentAttempts, subjects, stats] =
    await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        skip,
        take: QUIZ_PAGE_SIZE,
        include: {
          quiz: {
            select: {
              title: true,
              subject: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
      prisma.quizAttempt.count({
        where: { userId, completedAt: { not: null } },
      }),
      prisma.quizAttempt.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          quiz: {
            select: {
              title: true,
              subject: { select: { name: true, code: true } },
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

  return { userQuizzes, totalQuizzes, recentAttempts, subjects, stats }
}
