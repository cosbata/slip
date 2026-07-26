export interface PostCardData {
  id: string
  title: string
  body?: string | null
  voteScore: number
  communitySlug: string
  communityName?: string | null
  communityTrack?: string | null
  authorUsername?: string
  createdAt: Date | string
  commentCount?: number
  interviewStage?: string | null
  fundingStage?: string | null
  outcomeCategory?: string | null
  embedUrl?: string | null
  embedType?: string | null
  isAnonymous?: boolean
  isOwnAnonymousPost?: boolean
  reactionCount?: number
  reactionCounts?: { BEEN_THERE: number; I_FEEL_THIS: number; NOT_ALONE: number; SAME_HERE: number }
  tags?: string[]
  isOwnPost?: boolean
}
