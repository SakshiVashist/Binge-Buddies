import type { Timestamp } from 'firebase/firestore'

// A movie/TV show attached to a recommendation post
export interface Media {
    id: number
    mediaType: 'movie' | 'tv'
    title: string
    year: string
    posterUrl: string | null
}

export interface Post {
    id: string
    authorId: string
    authorName: string
    authorPhotoURL: string | null
    type: 'reflection' | 'recommendation'
    title: string
    content: string
    media: Media | null
    likedBy: string[]
    commentCount: number
    createdAt: Timestamp | null
}


// Turns a Firestore timestamp into a friendly relative string
export const formatTime = (ts: Timestamp | null): string => {
    if (!ts) return 'Just now'
    const seconds = Math.floor((Date.now() - ts.toMillis()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
    return ts.toDate().toLocaleDateString()
}

export const computeTrending = (posts: Post[], limit = 3) => {
    const counts: Record<string, { media: Media; count: number }> = {}
    posts.forEach((p) => {
        if (p.type === 'recommendation' && p.media) {
            const key = `${p.media.mediaType}-${p.media.id}`
            if (!counts[key]) counts[key] = { media: p.media, count: 0 }
            counts[key].count += 1
        }
    })
    return Object.values(counts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
}

// Resolve an author's current name/photo, preferring the live profile and
// falling back to whatever was stored on the post/comment

export const resolveAuthor = (
    authorId: string,
    fallbackName: string,
    fallbackPhoto: string | null,
    profiles: Record<string, { username: string; photoURL: string | null }>
) => {
    const prof = profiles[authorId]
    return {
        name: prof?.username || fallbackName || 'Binger',
        photoURL: prof? prof.photoURL: fallbackPhoto,
    }
}

// Whether the compose form is ready to submit
export const canSubmitPost = (
    composeType: 'reflection' | 'recommendation',
    newTitle: string,
    newContent: string,
    selectedMedia: Media | null
) : boolean => {
    if (composeType === 'recommendation') return !!selectedMedia
    return !!newTitle.trim() && !!newContent.trim()

}

// Posts after applying the type filter and the search query
export const filterPosts = (
    posts: Post[],
    filter: 'all' | 'reflection' | 'recommendation',
    searchQuery: string,
    profiles: Record<string, { username: string; photoURL: string | null }>
): Post[] => {
    return posts.filter((p) => {
        if (filter !== 'all' && p.type !== filter) return false
        const q = searchQuery.trim().toLowerCase()
        if (!q) return true
        const authorName = resolveAuthor(p.authorId, p.authorName, p.authorPhotoURL, profiles).name
        return (
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            authorName.toLowerCase().includes(q) ||
            (p.media?.title.toLowerCase().includes(q) ?? false)
        )
    })
}