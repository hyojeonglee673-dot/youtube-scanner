const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const API_BASE = 'https://www.googleapis.com/youtube/v3'

if (!YOUTUBE_API_KEY) {
  throw new Error('YOUTUBE_API_KEY 가 없습니다. .env.local 확인하세요.')
}

export type ResolvedChannel = {
  channelId: string
  channelName: string
  uploadsPlaylistId: string
  channelUrl: string
}

export type YoutubeVideo = {
  videoId: string
  title: string
  publishedAt: string | null
  thumbnailUrl: string | null
  youtubeUrl: string
  viewCount: number
}

async function youtubeFetch(path: string, params: Record<string, string>) {
  const url = new URL(`${API_BASE}/${path}`)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  url.searchParams.set('key', YOUTUBE_API_KEY!)

  const res = await fetch(url.toString(), {
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error?.message || 'YouTube API 요청 실패')
  }

  return data
}

function parseChannelInput(input: string) {
  const value = input.trim()

  if (!value) {
    throw new Error('채널 입력값이 비어 있습니다.')
  }

  if (value.startsWith('UC') && value.length >= 20) {
    return { type: 'channelId' as const, value }
  }

  if (value.startsWith('@')) {
    return { type: 'handle' as const, value: value.replace('@', '') }
  }

  if (value.includes('youtube.com')) {
    const url = new URL(value)

    if (url.pathname.startsWith('/@')) {
      return {
        type: 'handle' as const,
        value: url.pathname.replace('/@', ''),
      }
    }

    if (url.pathname.startsWith('/channel/')) {
      return {
        type: 'channelId' as const,
        value: url.pathname.replace('/channel/', ''),
      }
    }
  }

  throw new Error('채널 ID(UC...) 또는 @핸들 또는 채널 URL을 넣어주세요.')
}

export async function resolveChannel(input: string): Promise<ResolvedChannel> {
  const parsed = parseChannelInput(input)

  let data

  if (parsed.type === 'handle') {
    data = await youtubeFetch('channels', {
      part: 'snippet,contentDetails',
      forHandle: parsed.value,
    })
  } else {
    data = await youtubeFetch('channels', {
      part: 'snippet,contentDetails',
      id: parsed.value,
    })
  }

  const item = data?.items?.[0]

  if (!item) {
    throw new Error('채널을 찾지 못했습니다. @핸들 또는 채널 URL을 다시 확인하세요.')
  }

  return {
    channelId: item.id,
    channelName: item.snippet?.title || '이름 없음',
    uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads || '',
    channelUrl: `https://www.youtube.com/channel/${item.id}`,
  }
}

export async function getRecentVideoIds(
  uploadsPlaylistId: string,
  maxResults = 10
): Promise<string[]> {
  const data = await youtubeFetch('playlistItems', {
    part: 'contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: String(maxResults),
  })

  const ids: string[] =
    (data?.items || [])
      .map((item: any) => item?.contentDetails?.videoId)
      .filter((id: string | undefined): id is string => Boolean(id))

  return [...new Set(ids)]
}

export async function getVideosByIds(videoIds: string[]): Promise<YoutubeVideo[]> {
  if (videoIds.length === 0) return []

  const data = await youtubeFetch('videos', {
    part: 'snippet,statistics',
    id: videoIds.join(','),
  })

  return (data?.items || []).map((item: any) => ({
    videoId: item.id,
    title: item.snippet?.title || '',
    publishedAt: item.snippet?.publishedAt || null,
    thumbnailUrl:
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      null,
    youtubeUrl: `https://www.youtube.com/watch?v=${item.id}`,
    viewCount: Number(item.statistics?.viewCount || 0),
  }))
}