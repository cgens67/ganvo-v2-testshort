import { NextResponse } from 'next/server'
import YTMusic from 'ytmusic-api'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ytmusic = new YTMusic()
let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await ytmusic.initialize()
    initialized = true
  }
}

const formatThumb = (thumbnails: any[]) => {
  let url = thumbnails?.[thumbnails.length - 1]?.url || ''
  if (url.includes('=w') || url.includes('-w')) {
    url = url.replace(/([=-]w)\d+([=-]h)\d+.*/, '$11200$21200-c')
  }
  return url
}

export async function GET() {
  try {
    await ensureInitialized()
    
    // Fetch categories concurrently
    const[artistsRes, songsRes, albumsRes] = await Promise.all([
      ytmusic.searchArtists("Top Global Artists"),
      ytmusic.searchSongs("Top Global Hits"),
      ytmusic.searchAlbums("Top Albums 2024")
    ])
    
    // Hardcoded Creator's Picks for maximum speed, correct metadata, and reliability
    const creatorsPicks =[
      { videoId: 'M_DiTjNBiOY', title: 'XO Tour Llif3', artist: 'Lil Uzi Vert', album: 'Luv Is Rage 2', duration: 182, thumbnail: 'https://i.ytimg.com/vi/M_DiTjNBiOY/maxresdefault.jpg' },
      { videoId: 'nmbiBVPe5bY', title: 'APT.', artist: 'ROSÉ & Bruno Mars', album: 'rosie', duration: 170, thumbnail: 'https://i.ytimg.com/vi/nmbiBVPe5bY/maxresdefault.jpg' },
      { videoId: 'p9OtySpRRL8', title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', album: 'Die With A Smile', duration: 251, thumbnail: 'https://i.ytimg.com/vi/p9OtySpRRL8/maxresdefault.jpg' },
      { videoId: 'iHsObIWkM-s', title: 'Heartless', artist: 'The Weeknd', album: 'After Hours', duration: 201, thumbnail: 'https://i.ytimg.com/vi/iHsObIWkM-s/maxresdefault.jpg' },
      { videoId: '_2qJy5r-WAY', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: 230, thumbnail: 'https://i.ytimg.com/vi/_2qJy5r-WAY/maxresdefault.jpg' },
      { videoId: 'M2dgm4xK3IY', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, thumbnail: 'https://i.ytimg.com/vi/M2dgm4xK3IY/maxresdefault.jpg' },
      { videoId: 'DntZ3-yCaFs', title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: 215, thumbnail: 'https://i.ytimg.com/vi/DntZ3-yCaFs/maxresdefault.jpg' },
      { videoId: '-KrC-gqKTMg', title: 'Die For You', artist: 'The Weeknd', album: 'Starboy', duration: 200, thumbnail: 'https://i.ytimg.com/vi/-KrC-gqKTMg/maxresdefault.jpg' }
    ];
    
    const artists = artistsRes.slice(0, 15).map(a => ({
      artistId: a.artistId,
      name: a.name,
      subscribers: a.subscribers || 'Popular',
      thumbnail: formatThumb(a.thumbnails)
    }))

    const songs = songsRes.slice(0, 15).map(s => ({
      videoId: s.videoId,
      title: s.name,
      artist: s.artist?.name || 'Unknown Artist',
      artistId: s.artist?.artistId || null,
      album: s.album?.name || '',
      duration: s.duration || 0,
      thumbnail: formatThumb(s.thumbnails)
    }))

    const albums = albumsRes.slice(0, 15).map(a => ({
      albumId: a.albumId || a.id,
      title: a.name,
      artist: a.artist?.name || 'Unknown Artist',
      year: a.year || '',
      thumbnail: formatThumb(a.thumbnails)
    }))

    return NextResponse.json({ creatorsPicks, artists, songs, albums })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch explore data' }, { status: 500 })
  }
}
