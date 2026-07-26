import assert from 'node:assert/strict'
import test from 'node:test'

import { dedupePostsByContent } from './dedupePosts.ts'

test('keeps the first post for normalized duplicate titles and URLs', () => {
  const posts = [
    { id: '1', title: '  Same   title  ' },
    { id: '2', title: 'same title' },
    { id: '3', title: 'First URL', embedUrl: 'https://www.example.com/story/?ref=one' },
    { id: '4', title: 'Second URL', embedUrl: 'https://example.com/story?ref=two' },
    { id: '5', title: 'Different title' },
  ]

  assert.deepEqual(dedupePostsByContent(posts), [posts[0], posts[2], posts[4]])
})
