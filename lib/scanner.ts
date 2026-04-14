import { supabaseAdmin } from './supabase-admin'
import { getRecentVideoIds, getVideosByIds, resolveChannel } from './youtube'

type ScanChannel = {
  channel_id: string
  channel_name: string
  uploads_playlist_id: string
}

type VideoRow = {
  videoId: string
  title: string
  publishedAt: string | null
  thumbnailUrl: string | null
  youtubeUrl: string
  viewCount: number
}

export async function registerChannel(input: string) {
  const resolved = await resolveChannel(input)

  const { error } = await supabaseAdmin.from('channels').upsert(
    {
      channel_id: resolved.channelId,
      channel_name: resolved.channelName,
      uploads_playlist_id: resolved.uploadsPlaylistId,
      channel_url: resolved.channelUrl,
      is_active: true,
    },
    {
      onConflict: 'channel_id',
    }
  )

  if (error) {
    throw new Error(`채널 저장 실패: ${error.message}`)
  }

  await scanSingleChannel({
    channel_id: resolved.channelId,
    channel_name: resolved.channelName,
    uploads_playlist_id: resolved.uploadsPlaylistId,
  })

  return resolved
}

export async function scanSingleChannel(channel: ScanChannel) {
  const videoIds: string[] = await getRecentVideoIds(channel.uploads_playlist_id, 10)
  const videos: VideoRow[] = await getVideosByIds(videoIds)

  if (videos.length > 0) {
    const rows = videos.map((video: VideoRow) => ({
      video_id: video.videoId,
      source_channel_id: channel.channel_id,
      source_channel_name: channel.channel_name,
      title: video.title,
      published_at: video.publishedAt,
      view_count: video.viewCount,
      thumbnail_url: video.thumbnailUrl,
      youtube_url: video.youtubeUrl,
      last_checked_at: new Date().toISOString(),
    }))

    const { error } = await supabaseAdmin.from('videos').upsert(rows, {
      onConflict: 'video_id',
    })

    if (error) {
      throw new Error(`영상 저장 실패: ${error.message}`)
    }
  }

  await supabaseAdmin
    .from('channels')
    .update({ last_scanned_at: new Date().toISOString() })
    .eq('channel_id', channel.channel_id)

  return {
    channelId: channel.channel_id,
    savedCount: videos.length,
  }
}

export async function scanAllChannels() {
  const { data, error } = await supabaseAdmin
    .from('channels')
    .select('channel_id, channel_name, uploads_playlist_id')
    .eq('is_active', true)

  if (error) {
    throw new Error(`채널 목록 불러오기 실패: ${error.message}`)
  }

  const results = []

  for (const channel of data || []) {
    try {
      const result = await scanSingleChannel(channel as ScanChannel)
      results.push({
        channelId: result.channelId,
        ok: true,
        savedCount: result.savedCount,
      })
    } catch (error) {
      results.push({
        channelId: channel.channel_id,
        ok: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  }

  return results
}

export async function getDashboardData() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: channels, error: channelError } = await supabaseAdmin
    .from('channels')
    .select('*')
    .order('created_at', { ascending: false })

  if (channelError) {
    throw new Error(`channels 조회 실패: ${channelError.message}`)
  }

  const { data: videos, error: videoError } = await supabaseAdmin
    .from('videos')
    .select('*')
    .gte('published_at', since)
    .order('view_count', { ascending: false })
    .limit(200)

  if (videoError) {
    throw new Error(`videos 조회 실패: ${videoError.message}`)
  }

  return {
    channels: channels || [],
    videos: videos || [],
  }
}