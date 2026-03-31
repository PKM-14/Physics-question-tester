import { FailureType } from '@prisma/client';
import { prisma } from './prisma';

const MASTERY_UP = 0.05;
const MASTERY_DOWN = 0.03;

function clampMastery(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function targetDifficulty(mastery: number): number {
  const base = Math.ceil(mastery * 5);
  return Math.max(1, Math.min(5, base + 1));
}

function getPartialSolution(solution: string): string {
  const [firstStep] = solution.split(';');
  return firstStep?.trim() || solution;
}

export async function getNextProblem(userId: number) {
  const userTechniques = await prisma.userTechnique.findMany({
    where: { userId },
    include: { technique: true },
    orderBy: { masteryScore: 'asc' }
  });

  if (userTechniques.length === 0) {
    return null;
  }

  const weakest = userTechniques[0];
  const recentAttempt = await prisma.attempt.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { problem: true }
  });

  let desiredDifficulty = targetDifficulty(weakest.masteryScore);
  let hint: string | null = null;
  let partialSolution: string | null = null;
  let excludeProblemId: number | null = null;

  if (recentAttempt && !recentAttempt.correct && recentAttempt.failureType) {
    switch (recentAttempt.failureType) {
      case FailureType.wrong_model:
        desiredDifficulty = Math.max(1, recentAttempt.problem.difficulty - 1);
        break;
      case FailureType.wrong_method:
        desiredDifficulty = recentAttempt.problem.difficulty;
        hint = 'Try selecting the governing principle before any algebra.';
        break;
      case FailureType.execution_error:
        desiredDifficulty = recentAttempt.problem.difficulty;
        excludeProblemId = recentAttempt.problem.id;
        break;
      case FailureType.stuck:
        desiredDifficulty = Math.max(1, recentAttempt.problem.difficulty - 1);
        hint = 'Break the problem into knowns, unknowns, and one physics law at a time.';
        partialSolution = getPartialSolution(recentAttempt.problem.solution);
        break;
      default:
        break;
    }
  }

  const problem = await prisma.problem.findFirst({
    where: {
      primaryTechniqueId: weakest.techniqueId,
      id: excludeProblemId ? { not: excludeProblemId } : undefined,
      difficulty: { gte: Math.max(1, desiredDifficulty - 1), lte: Math.min(5, desiredDifficulty + 1) }
    },
    orderBy: [{ difficulty: 'asc' }, { id: 'asc' }]
  });

  const fallbackProblem =
    problem ??
    (await prisma.problem.findFirst({
      where: {
        primaryTechniqueId: weakest.techniqueId,
        id: excludeProblemId ? { not: excludeProblemId } : undefined
      },
      orderBy: [{ difficulty: 'asc' }, { id: 'asc' }]
    }));

  return {
    weakTechnique: weakest.technique,
    masteryScore: weakest.masteryScore,
    hint,
    partialSolution,
    problem: fallbackProblem
  };
}

export async function submitAttempt(input: {
  userId: number;
  problemId: number;
  correct: boolean;
  failureType?: FailureType;
  timeTaken: number;
}) {
  const problem = await prisma.problem.findUnique({ where: { id: input.problemId } });
  if (!problem) throw new Error('Problem not found');

  const attempt = await prisma.attempt.create({
    data: {
      userId: input.userId,
      problemId: input.problemId,
      correct: input.correct,
      failureType: input.correct ? null : input.failureType,
      timeTaken: input.timeTaken
    }
  });

  const current = await prisma.userTechnique.findUnique({
    where: {
      userId_techniqueId: {
        userId: input.userId,
        techniqueId: problem.primaryTechniqueId
      }
    }
  });

  const nextScore = clampMastery((current?.masteryScore ?? 0.3) + (input.correct ? MASTERY_UP : -MASTERY_DOWN));

  await prisma.userTechnique.upsert({
    where: {
      userId_techniqueId: {
        userId: input.userId,
        techniqueId: problem.primaryTechniqueId
      }
    },
    create: {
      userId: input.userId,
      techniqueId: problem.primaryTechniqueId,
      masteryScore: nextScore
    },
    update: { masteryScore: nextScore }
  });

  return attempt;
}

export async function getProgress(userId: number) {
  return prisma.userTechnique.findMany({
    where: { userId },
    include: { technique: true },
    orderBy: { masteryScore: 'asc' }
  });
}
