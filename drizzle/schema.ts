import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Enums ────────────────────────────────────────────────────────────────────
export const track = pgEnum('track', ['COMPANIES', 'INVESTORS'])
export const reactionType = pgEnum('reaction_type', ['BEEN_THERE', 'I_FEEL_THIS', 'NOT_ALONE', 'SAME_HERE'])

// ── Users ────────────────────────────────────────────────────────────────────
// Profile table linked to Supabase auth.users via supabase_auth_id
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').unique().notNull(),
  usernameChangedAt: timestamp('username_changed_at'),
  karma: integer('karma').default(0).notNull(),
  supabaseAuthId: uuid('supabase_auth_id').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Communities ───────────────────────────────────────────────────────────────
export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(), // e.g. "companies/google/swe"
  name: text('name').notNull(),
  track: track('track').notNull(),
  parentCommunityId: uuid('parent_community_id').references(
    (): AnyPgColumn => communities.id
  ),
  institutionLogoUrl: text('institution_logo_url'),
  sidebarRules: text('sidebar_rules'),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Posts ─────────────────────────────────────────────────────────────────────
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: text('body'),
  communityId: uuid('community_id')
    .references(() => communities.id),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  voteScore: integer('vote_score').default(0).notNull(),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),

  // ── Companies track (nullable) ──────────────────────────────────────────
  roleTitle: text('role_title'),
  interviewStage: text('interview_stage'),
  // SCREEN | PHONE | ONSITE | FINAL | OFFER_RESCINDED
  rejectionYear: integer('rejection_year'),

  // ── Investors track (nullable) ──────────────────────────────────────────
  fundingStage: text('funding_stage'),
  // PRE_SEED | SEED | SERIES_A | SERIES_B | SERIES_C
  amountSoughtRange: text('amount_sought_range'),
  // UNDER_100K | 100K_500K | 500K_1M | 1M_5M | 5M_PLUS
  industryVertical: text('industry_vertical'),

  // ── Outcome (both tracks) ───────────────────────────────────────────────
  outcomeCategory: text('outcome_category'),
  // HIRED_ELSEWHERE | RAISED_FUNDING | STARTED_COMPANY |
  // JOINED_PROGRAM | STILL_SEARCHING | PIVOTED_CAREERS | OTHER
  outcomeStory: text('outcome_story'),
  outcomeNudgeSentAt: timestamp('outcome_nudge_sent_at'),

  // ── Embed (external posts) ──────────────────────────────────────────────
  embedUrl: text('embed_url'),   // Reddit/external URL for embed
  embedType: text('embed_type'), // 'reddit' | null

  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  reactionCount: integer('reaction_count').default(0).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Comments ──────────────────────────────────────────────────────────────────
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  body: text('body').notNull(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  parentCommentId: uuid('parent_comment_id').references(
    (): AnyPgColumn => comments.id
  ),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  voteScore: integer('vote_score').default(0).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Votes ─────────────────────────────────────────────────────────────────────
export const votes = pgTable(
  'votes',
  {
    userId: uuid('user_id').references(() => users.id).notNull(),
    targetType: text('target_type').notNull(), // POST | COMMENT
    targetId: uuid('target_id').notNull(),
    value: integer('value').notNull(), // 1 or -1
  },
  (t) => [primaryKey({ columns: [t.userId, t.targetType, t.targetId] })]
)

// ── Reports ───────────────────────────────────────────────────────────────────
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').references(() => users.id).notNull(),
  targetType: text('target_type').notNull(), // POST | COMMENT
  targetId: uuid('target_id').notNull(),
  category: text('category').notNull(),
  // SPAM | DEFAMATION | NAMES_INDIVIDUAL | HARASSMENT | NDA_VIOLATION | OTHER
  freeText: text('free_text'),
  status: text('status').default('PENDING').notNull(),
  // PENDING | REMOVED | DISMISSED
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // OUTCOME_NUDGE_30D
  postId: uuid('post_id').references(() => posts.id),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Reactions ─────────────────────────────────────────────────────────────────
export const reactions = pgTable('reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  type: reactionType('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.userId, t.postId, t.type),
])

// ── Tags ──────────────────────────────────────────────────────────────────────
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  label: text('label').notNull(),
  postCount: integer('post_count').default(0).notNull(),
})

// ── Post Tags ─────────────────────────────────────────────────────────────────
export const postTags = pgTable('post_tags', {
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (t) => [primaryKey({ columns: [t.postId, t.tagId] })])

// ── Community Requests ────────────────────────────────────────────────────────
export const communityRequests = pgTable('community_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'COMPANY' | 'SUBCOMMUNITY'
  companyName: text('company_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  parentCommunitySlug: text('parent_community_slug'),
  subCommunityName: text('sub_community_name'),
  status: text('status').default('PENDING').notNull(),
  resultCommunitySlug: text('result_community_slug'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── News Items ────────────────────────────────────────────────────────────────
export const newsItems = pgTable('news_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  hnId: text('hn_id').unique().notNull(),
  title: text('title').notNull(),
  url: text('url'),
  domain: text('domain'),
  tag: text('tag').notNull(), // 'layoff' | 'funding' | 'hiring'
  points: integer('points').default(0),
  numComments: integer('num_comments').default(0),
  hnCreatedAt: timestamp('hn_created_at').notNull(),
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
})

// ── Community Members ─────────────────────────────────────────────────────────
export const communityMembers = pgTable('community_members', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.communityId] })])

// ── Relations ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  reports: many(reports),
  notifications: many(notifications),
}))

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  parent: one(communities, {
    fields: [communities.parentCommunityId],
    references: [communities.id],
    relationName: 'parent',
  }),
  children: many(communities, { relationName: 'parent' }),
  posts: many(posts),
  createdBy: one(users, {
    fields: [communities.createdById],
    references: [users.id],
  }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  votes: many(votes),
  reactions: many(reactions),
  postTags: many(postTags),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: 'parent',
  }),
  replies: many(comments, { relationName: 'parent' }),
  votes: many(votes),
}))

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, { fields: [reactions.userId], references: [users.id] }),
  post: one(posts, { fields: [reactions.postId], references: [posts.id] }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}))
