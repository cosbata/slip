'use client'

import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { formatTimeToNow } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useRef, useState } from 'react'
import CommentVotes from '../CommentVotes'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

type VoteType = 'UP' | 'DOWN'

type ExtendedComment = {
  id: string
  text: string
  createdAt: Date
  postId: string
  replyToId: string | null
  author: { username: string | null; name: string | null; image: string | null }
  votes: { type: VoteType; userId: string; commentId: string }[]
}

interface PostCommentProps {
  comment: ExtendedComment
  votesAmt: number
  currentVote: { type: VoteType } | undefined
  postId: string
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  votesAmt,
  currentVote,
  postId,
}) => {
  const [isReplying, setIsReplying] = useState<boolean>(false)
  const commentRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState<string>(`@${comment.author.username} `)
  const router = useRouter()
  useOnClickOutside(commentRef, () => {
    setIsReplying(false)
  })

  const { mutate: postComment, isPending: isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: { postId: string; text: string; replyToId?: string }) => {
      const { data } = await axios.patch('/api/comments', { postId, text, replyToId })
      return data
    },

    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        window.location.href = '/login'
        return
      }
      console.error('Comment error:', err)
    },
    onSuccess: () => {
      router.refresh()
      setIsReplying(false)
    },
  })

  return (
    <div ref={commentRef} className='flex flex-col'>
      <div className='flex items-center'>
        <div className='h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium'>
          {(comment.author.username ?? '?')[0].toUpperCase()}
        </div>
        <div className='ml-2 flex items-center gap-x-2'>
          <p className='text-sm font-medium text-gray-900'>u/{comment.author.username}</p>

          <p className='max-h-40 truncate text-xs text-zinc-500'>
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className='text-sm text-zinc-900 mt-2'>{comment.text}</p>

      <div className='flex gap-2 items-center'>
        <CommentVotes
          commentId={comment.id}
          votesAmt={votesAmt}
          currentVote={currentVote}
        />

        <Button
          onClick={() => {
            setIsReplying(true)
          }}
          variant='ghost'
          size='xs'>
          <MessageSquare className='h-4 w-4 mr-1.5' />
          Reply
        </Button>
      </div>

      {isReplying ? (
        <div className='grid w-full gap-1.5'>
          <Label htmlFor='comment'>Your comment</Label>
          <div className='mt-2'>
            <Textarea
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length
                )
              }
              autoFocus
              id='comment'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder='What are your thoughts?'
            />

            <div className='mt-2 flex justify-end gap-2'>
              <Button
                tabIndex={-1}
                variant='outline'
                onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                onClick={() => {
                  if (!input) return
                  postComment({
                    postId,
                    text: input,
                    replyToId: comment.replyToId ?? comment.id, // default to top-level comment
                  })
                }}>
                {isLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default PostComment
