import { createClient } from '@/lib/supabase/server'
import { CreateComment } from './CreateComment'
import PostComment from './comments/PostComment'

export type VoteType = 'UP' | 'DOWN'

export type CommentAuthor = {
  id: string
  username: string | null
  name: string | null
  image: string | null
}

export type CommentVote = {
  type: VoteType
  userId: string
  commentId: string
}

export type Comment = {
  id: string
  text: string
  createdAt: Date
  postId: string
  authorId: string
  replyToId: string | null
  author: CommentAuthor
  votes: CommentVote[]
}

type ExtendedComment = Comment & {
  replies: Comment[]
}

interface CommentsSectionProps {
  postId: string
  comments?: ExtendedComment[]
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // TODO: replace with Drizzle query
  const comments: ExtendedComment[] = []
  const currentUserId = user?.id

  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      <hr className='w-full h-px my-6' />

      <CreateComment postId={postId} isLoggedIn={!!user} />

      <div className='flex flex-col gap-y-6 mt-4'>
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === 'UP') return acc + 1
                if (vote.type === 'DOWN') return acc - 1
                return acc
              },
              0
            )

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === currentUserId
            )

            return (
              <div key={topLevelComment.id} className='flex flex-col'>
                <div className='mb-2'>
                  <PostComment
                    comment={topLevelComment}
                    currentVote={topLevelCommentVote}
                    votesAmt={topLevelCommentVotesAmt}
                    postId={postId}
                  />
                </div>

                {/* Render replies */}
                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length) // Sort replies by most liked
                  .map((reply) => {
                    const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                      if (vote.type === 'UP') return acc + 1
                      if (vote.type === 'DOWN') return acc - 1
                      return acc
                    }, 0)

                    const replyVote = reply.votes.find(
                      (vote) => vote.userId === currentUserId
                    )

                    return (
                      <div
                        key={reply.id}
                        className='ml-2 py-2 pl-4 border-l-2 border-zinc-200'>
                        <PostComment
                          comment={reply}
                          currentVote={replyVote}
                          votesAmt={replyVotesAmt}
                          postId={postId}
                        />
                      </div>
                    )
                  })}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default CommentsSection
