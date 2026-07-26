import { ImageResponse } from 'next/og'
import { db } from '../../../../drizzle'
import { posts, communities } from '../../../../drizzle/schema'
import { eq, and, isNull } from 'drizzle-orm'

export const runtime = 'nodejs'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params

  const result = await db
    .select({ post: posts, community: communities })
    .from(posts)
    .leftJoin(communities, eq(posts.communityId, communities.id))
    .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
    .limit(1)

  const row = result[0]
  const title = row?.post.title ?? 'Rejection Story'
  const communityName = row?.community?.name ?? 'slip'

  // Truncate title to ~80 chars for display
  const displayTitle =
    title.length > 80 ? title.slice(0, 77) + '…' : title

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#0D0D0D',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        {/* Left color bar */}
        <div
          style={{
            width: '8px',
            height: '100%',
            backgroundColor: '#FF4154',
            flexShrink: 0,
          }}
        />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px',
          }}
        >
          {/* Community name */}
          <div
            style={{
              fontSize: '24px',
              color: '#818384',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}
          >
            {communityName}
          </div>

          {/* Post title */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.25,
              maxWidth: '960px',
            }}
          >
            {displayTitle}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                color: '#555657',
                letterSpacing: '0.04em',
              }}
            >
              rejection stories worth sharing
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#FF4154',
                letterSpacing: '-0.02em',
              }}
            >
              slip
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
