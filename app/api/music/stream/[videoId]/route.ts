import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PIPED_INSTANCES =[
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
  'https://pipedapi.tokhmi.xyz',
  'https://pipedapi.adminforge.de'
]

async function tryCobalt(videoId: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)
    const res = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: 'audio'
      }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (res.ok) {
      const data = await res.json()
      if (data.url) return { audioUrl: data.url, duration: 0, source: 'cobalt' }
    }
  } catch { return null }
}

async function tryRyzen(videoId: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=https://youtu.be/${videoId}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (res.ok) {
      const data = await res.json()
      if (data.url || data.download_url) return { audioUrl: data.url || data.download_url, duration: 0, source: 'ryzen' }
    }
  } catch { return null }
}

async function tryVreden(videoId: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(`https://api.vreden.web.id/api/ytmp3?url=https://youtu.be/${videoId}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (res.ok) {
      const data = await res.json()
      if (data.result?.download?.url) return { audioUrl: data.result.download.url, duration: 0, source: 'vreden' }
    }
  } catch { return null }
}

async function tryPiped(videoId: string, instance: string, quality: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(`${instance}/streams/${videoId}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    const data = await res.json()
    const audioStreams = (data.audioStreams ||[])
      .filter((s: any) => s.url && s.mimeType?.includes('audio'))
      .sort((a: any, b: any) => {
        if (quality === 'Low') return (a.bitrate || 0) - (b.bitrate || 0); // Ascending
        return (b.bitrate || 0) - (a.bitrate || 0); // Descending (High/Standard)
      })
    if (audioStreams.length > 0) {
      return { audioUrl: audioStreams[0].url, duration: data.duration || 0, source: 'piped' }
    }
  } catch { return null }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params
  const quality = request.nextUrl.searchParams.get('quality') || 'High'

  if (!videoId) return NextResponse.json({ error: 'Video ID required' }, { status: 400 })

  // Launch all requests concurrently to get the fastest available source
  const promises =[
    tryCobalt(videoId),
    tryRyzen(videoId),
    tryVreden(videoId),
    ...PIPED_INSTANCES.map(i => tryPiped(videoId, i, quality))
  ]

  try {
    const result = await Promise.any(promises.map(async p => {
      const res = await p
      if (res && res.audioUrl) return res
      throw new Error('Not found')
    }))
    if (result) return NextResponse.json(result)
  } catch (e) {}

  return NextResponse.json({ error: 'Could not find audio stream. The song may be unavailable or region-restricted.' }, { status: 404 })
}
