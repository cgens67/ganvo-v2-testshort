import { NextRequest, NextResponse } from 'next/server'
import YTMusic from 'ytmusic-api'

const ytmusic = new YTMusic()
let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await ytmusic.initialize()
    initialized = true
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  const { artistId } = await params
  if (!artistId) return NextResponse.json({ error: 'Artist ID required' }, { status: 400 })

  try {
    await ensureInitialized()
    const artistData = await ytmusic.getArtist(artistId)
    
    // Format top songs
    const topSongs = (artistData.topSongs || []).map((song) => {
      let thumbUrl = song.thumbnails?.[song.thumbnails.length - 1]?.url || ''
      if (thumbUrl.includes('=w') || thumbUrl.includes('-w')) {
        thumbUrl = thumbUrl.replace(/([=-]w)\d+([=-]h)\d+/, '$11200$21200')
      }
      return {
        videoId: song.videoId,
        title: song.name,
        artist: artistData.name,
        artistId: artistId,
        album: song.album?.name || '',
        duration: song.duration || 0,
        thumbnail: thumbUrl,
      }
    })

    return NextResponse.json({ 
      name: artistData.name,
      description: artistData.description,
      subscribers: artistData.subscribers,
      thumbnails: artistData.thumbnails,
      topSongs 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch artist' }, { status: 500 })
  }
}
