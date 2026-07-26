import { db } from '../../drizzle'
import { posts } from '../../drizzle/schema'
import { and, count, eq, isNotNull, isNull } from 'drizzle-orm'

export async function getCommunityStats(communityId: string) {
  // Gate: community must have >= 10 total stories
  const [{ total }] = await db
    .select({ total: count() })
    .from(posts)
    .where(and(eq(posts.communityId, communityId), isNull(posts.deletedAt)))

  if (Number(total) < 10) return null

  const [stageData, outcomeData] = await Promise.all([
    db
      .select({ stage: posts.interviewStage, cnt: count() })
      .from(posts)
      .where(
        and(
          eq(posts.communityId, communityId),
          isNull(posts.deletedAt),
          isNotNull(posts.interviewStage)
        )
      )
      .groupBy(posts.interviewStage),
    db
      .select({ category: posts.outcomeCategory, cnt: count() })
      .from(posts)
      .where(
        and(
          eq(posts.communityId, communityId),
          isNull(posts.deletedAt),
          isNotNull(posts.outcomeCategory)
        )
      )
      .groupBy(posts.outcomeCategory),
  ])

  return {
    totalStories: Number(total),
    stageData,
    outcomeData,
    label: `Based on ${total} stories shared here`,
  }
}

export function hotScore(voteScore: number, createdAt: Date): number {
  const ageHours = (Date.now() - createdAt.getTime()) / 3_600_000
  return voteScore * Math.pow(0.95, ageHours)
}
