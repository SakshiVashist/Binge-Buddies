import { describe, it, expect } from "vitest";
import { formatTime, computeTrending, resolveAuthor, canSubmitPost, filterPosts, type Media, type Post } from '../utils/communityUtils';
import type { Timestamp } from 'firebase/firestore'

// a fake firestore timestamp that is `msAgo` milliseconds in the past

const mockTimestamp = (msAgo: number): Timestamp =>
    ({
        toMillis: () => Date.now() - msAgo,
        toDate: () => new Date(Date.now() - msAgo),
    }) as Timestamp

// helper post

const helperPost = (overrides: Partial<Post> = {}): Post => ({
    id: 'post1',
    authorId: 'user1',
    authorName: 'Default Name',
    authorPhotoURL: null,
    type: 'reflection',
    title: 'Default Title',
    content: 'Default content',
    media: null,
    likedBy: [],
    commentCount: 0,
    createdAt: null,
    ...overrides,
})

// helper media

const helperMedia = (overrides: Partial<Media> = {}): Media => ({
    id: 1,
    mediaType: 'movie',
    title: 'Inception',
    year: '2010',
    posterUrl: null,
    ...overrides,
})

// testing formatTime 
describe('formatTime', () => {
    it('returns "Just now" when timestamp is null', () => {
        expect(formatTime(null)).toBe('Just now')
    })

    it('returns "Just now" for under 60 seconds', () => {
        expect(formatTime(mockTimestamp(30_000))).toBe('Just now')
    })

    it('return "1 minute ago" for within 1 minute', () => {
        expect(formatTime(mockTimestamp(60_000))).toBe('1 minute ago')
    })

    it('return "X minutes ago" for within X minutes', () => {
        expect(formatTime(mockTimestamp(5 * 60_000))).toBe('5 minutes ago')
    })

    it('if 59 minutes, stays in minutes', () => {
        expect(formatTime(mockTimestamp(59 * 60_000))).toBe('59 minutes ago')
    })

    it('if reached 60 minutes, rolls over to hours', () => {
        expect(formatTime(mockTimestamp(60 * 60_000))).toBe('1 hour ago')
    })

    it('return "X hours ago" for within X hours', () => {
        expect(formatTime(mockTimestamp(5 * 60 * 60_000))).toBe('5 hours ago')
    })

    it('if 23 hours, stays in hours', () => {
        expect(formatTime(mockTimestamp(23 * 60 * 60_000))).toBe('23 hours ago')
    })

    it('if reached 24 hours rolls over to days', () => {
        expect(formatTime(mockTimestamp(24 * 60 * 60_000))).toBe('1 day ago')
    })

    it('return "X days ago" for within X days', () => {
        expect(formatTime(mockTimestamp(3 * 24 * 60 * 60_000))).toBe('3 days ago')
    })

    it('if 7+ days, falls back to a locale date string', () => {
        const ts = mockTimestamp(8 * 24 * 60 * 60_000)
        expect(formatTime(ts)).toBe(ts.toDate().toLocaleDateString())
    })
})

// testing computeTrending

describe('computeTrending', () => {
    it('returns an empty array when there are no posts', () => {
        expect(computeTrending([])).toEqual([])
    })

    it('ignores reflections, only counts recommendations', () => {
        const posts = [helperPost({ type: 'reflection' })]
        expect(computeTrending(posts)).toEqual([])
    })

    it('ignores recommendations with no media attached', () => {
        const posts = [helperPost({ type: 'recommendation', media: null })]
        expect(computeTrending(posts)).toEqual([])
    })

    it('counts repeated recommendations of the same title', () => {
        const media = helperMedia()
        const posts = [
            helperPost({ type: 'recommendation', media }),
            helperPost({ type: 'recommendation', media }),
        ]
        const result = computeTrending(posts)
        expect(result).toHaveLength(1)
        expect(result[0].count).toBe(2)
    })

    it('does not merge a movie and a TV show that share the same id', () => {
        const movie = helperMedia({ id: 1, mediaType: 'movie' })
        const tv = helperMedia({ id: 1, mediaType: 'tv', title: 'Some Show' })
        const posts = [
            helperPost({ type: 'recommendation', media: movie }),
            helperPost({ type: 'recommendation', media: tv }),
        ]
        expect(computeTrending(posts)).toHaveLength(2)
    })

    it('sorts recommendations by count in descending order', () => {
        const a = helperMedia({ id: 1, title: 'A' })
        const b = helperMedia({ id: 2, title: 'B' })
        const posts = [
            helperPost({ type: 'recommendation', media: a }),
            helperPost({ type: 'recommendation', media: b }),
            helperPost({ type: 'recommendation', media: b }),
        ]
        const result = computeTrending(posts)
        expect(result[0].media.title).toBe('B')
        expect(result[0].count).toBe(2)
    })

    it('defaults to a limit of 3 for the community hub page', () => {
        const posts = [1, 2, 3, 4, 5].map((id) =>
            helperPost({ type: 'recommendation', media: helperMedia({ id }) })
        )
        expect(computeTrending(posts)).toHaveLength(3)
    })

    it('when there is a tiebreaker, equal counts preserve first-encountered order from the input array', () => {
        const a = helperMedia({ id: 1, title: 'A' })
        const b = helperMedia({ id: 2, title: 'B' })
        const posts = [
            helperPost({ type: 'recommendation', media: a }), // A encountered first
            helperPost({ type: 'recommendation', media: b }),// B encountered second
        ]
        const result = computeTrending(posts)
        expect(result[0].media.title).toBe('A') // A wins the tie, since it came first
    })

})

// test resolveAuthor

describe('resolveAuthor', () => {
    it('uses the live updated profile when one exists', () => {
        const profiles = { user1: { username: 'claudine.codes', photoURL: 'dog.png' } }
        const result = resolveAuthor('user1', 'old_name', 'cat.png', profiles)
        expect(result).toEqual({ name: 'claudine.codes', photoURL: 'dog.png' })
    })

    it('uses the explicit null photoURL on the live profile (does not fall back to old picture)', () => {
        const profiles = { user1: { username: 'claudine.codes', photoURL: null } }
        const result = resolveAuthor('user1', 'old_name', 'cat.png', profiles)
        expect(result.photoURL).toBeNull()
    })

    it('falls back to stored post data when no live profile exists', () => {
        const result = resolveAuthor('user1', 'old_name', 'cat.png', {})
        expect(result).toEqual({ name: 'old_name', photoURL: 'cat.png' })
    })

    it('falls back to "Binger" when neither profile nor stored name exists', () => {
        const result = resolveAuthor('user1', '', null, {})
        expect(result.name).toBe('Binger')
    })

    it('falls back to null photoURL when neither profile nor stored name exists', () => {
        const result = resolveAuthor('user1', '', null, {})
        expect(result.photoURL).toBeNull()
    })
})

// test canSubmitPost

describe('canSubmitPost', () => {
    it('valid when media (show/ movie) is selected, regardless of content', () => {
        const media = helperMedia()
        expect(canSubmitPost('recommendation', '', '', media)).toBe(true)
    })

    it('invalid when no media selected', () => {
        expect(canSubmitPost('recommendation', 'title', 'content', null)).toBe(false)
    })

    it('valid when both title and content are filled for reflection', () => {
        expect(canSubmitPost('reflection', 'My title', 'My content', null)).toBe(true)
    })

    it('invalid when title is empty for reflection', () => {
        expect(canSubmitPost('reflection', '', 'My content', null)).toBe(false)
    })

    it('invalid when content is empty for reflection', () => {
        expect(canSubmitPost('reflection', 'My title', '', null)).toBe(false)
    })

    it('invalid when title is only whitespace for reflection', () => {
        expect(canSubmitPost('reflection', '   ', 'My content', null)).toBe(false)
    })

    it('invalid when content is only whitespace for reflection', () => {
        expect(canSubmitPost('reflection', 'Title', '  ', null)).toBe(false)
    })
})

// test filterPosts

describe('filterPosts', () => {
    const posts = [
        helperPost({ id: '1', type: 'reflection', title: 'Movie night thoughts', content: 'loved it' }),
        helperPost({
            id: '2',
            type: 'recommendation',
            title: 'Inception',
            content: 'mind bending',
            media: helperMedia({ title: 'Inception' }),
        }),
        helperPost({ id: '3', type: 'reflection', authorId: 'user2', title: 'Random', content: 'stuff' }),
    ]
    const profiles = {}

    it('returns all posts when filter is "all" and query is empty', () => {
        expect(filterPosts(posts, 'all', '', profiles)).toHaveLength(3)
    })

    it('filters by type "reflection"', () => {
        const result = filterPosts(posts, 'reflection', '', profiles)
        expect(result.map((p) => p.id)).toEqual(['1', '3'])
    })

    it('filters by type "recommendation"', () => {
        const result = filterPosts(posts, 'recommendation', '', profiles)
        expect(result.map((p) => p.id)).toEqual(['2'])
    })

    it('matches search query against media title', () => {
        const result = filterPosts(posts, 'all', 'inception', profiles)
        expect(result.map((p) => p.id)).toEqual(['2'])
    })

    it('matches search query against content', () => {
        const result = filterPosts(posts, 'all', 'mind bending', profiles)
        expect(result.map((p) => p.id)).toEqual(['2'])
    })

    it('matches search query against username', () => {
        const postsWithAuthor = [
            helperPost({ id: '4', authorId: 'user3', authorName: 'Claudine', title: 'Some title', content: 'some content' }),
        ]
        const result = filterPosts(postsWithAuthor, 'all', 'Claudine', {})
        expect(result.map((p) => p.id)).toEqual(['4'])
    })

    it('matches search query against live profile username, not stale stored name', () => {
        const postsWithAuthor = [
            helperPost({ id: '5', authorId: 'user4', authorName: 'old_name', title: 'Some title', content: 'some content' }),
        ]
        const profilesWithLive = { user4: { username: 'claudine.codes', photoURL: null } }
        const result = filterPosts(postsWithAuthor, 'all', 'claudine.codes', profilesWithLive)
        expect(result.map((p) => p.id)).toEqual(['5'])
    })

    it('search is case-insensitive', () => {
        const result = filterPosts(posts, 'all', 'INCEPTION', profiles)
        expect(result.map((p) => p.id)).toEqual(['2'])
    })

    it('returns empty array when nothing matches', () => {
        const result = filterPosts(posts, 'all', 'unmatched query', profiles)
        expect(result).toEqual([])
    })

    it('combines type filter and search query', () => {
        const result = filterPosts(posts, 'reflection', 'random', profiles)
        expect(result.map((p) => p.id)).toEqual(['3'])
    })
})
