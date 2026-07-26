'use client'

import { formatTimeToNow } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'
import EditorOutput from './EditorOutput'
import PostVoteClient from './post-vote/PostVoteClient'

type VoteType = 'UP' | 'DOWN'

type PartialVote = { type: VoteType }

interface PostProps {
  post: {
    id: string
    title: string
    content: unknown
    createdAt: Date
    author: { username: string | null }
    votes: { type: VoteType }[]
  }
  votesAmt: number
  subredditName: string
  currentVote?: PartialVote
  commentAmt: number
}

const Post: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  subredditName,
  commentAmt,
}) => {
  return (
    <div className='rounded-md bg-white shadow'>
      <div className='px-6 py-4 flex justify-between'>
        <PostVoteClient
          postId={post.id}
          initialVotesAmt={_votesAmt}
          initialVote={_currentVote?.type}
        />

        <div className='w-0 flex-1'>
          <div className='max-h-40 mt-1 text-xs text-gray-500'>
            {subredditName ? (
              <>
                <a
                  className='underline text-zinc-900 text-sm underline-offset-2'
                  href={`/r/${subredditName}`}>
                  {subredditName}
                </a>
                <span className='px-1'>•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{' '}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>
              {post.title}
            </h1>
          </a>

          <div className='relative text-sm max-h-40 w-full overflow-clip'>
            <EditorOutput content={post.content} />
          </div>
        </div>
      </div>

      <div className='bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6'>
        <Link
          href={`/r/${subredditName}/post/${post.id}`}
          className='w-fit flex items-center gap-2'>
          <MessageSquare className='h-4 w-4' /> {commentAmt} comments
        </Link>
      </div>
    </div>
  )
}
export default Post
