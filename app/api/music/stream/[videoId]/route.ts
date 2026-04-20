import { NextRequest, NextResponse } from 'next/server'
import { Innertube } from 'youtubei.js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Shared singleton — same instance used by the proxy route
let yt: Awaited<ReturnType<typeof Innertube.create>> | null = null

async function getInnertube() {
  if (!yt) {
    yt = await Innertube.create({ generate_session_locally: true })
  }
  return yt
}

const INVIDIOUS_INSTANCES = [
  'https://inv.tux.pizza',
  'https://invidious.asir.dev',
  'https://invidious.protokolla.fi',
  'https://inv.nadeko.net',
  'https://invidious.privacydev.net',
]

async function checkInvidious(videoId: string, instance: string): Promise<{ audioUrl: string; duration: number; source: string } | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${instance}/api/v1/videos/${videoId}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.lengthSeconds) return null
    // Always use the invidious proxy URL (local=true) — it proxies through their server
    // so the IP-binding issue doesn't affect the browser
    return {
      audioUrl: `${instance}/latest_version?id=${videoId}&itag=140&local=true`,
      duration: data.lengthSeconds,
      source: 'invidious-proxy',
    }
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params
  const quality = request.nextUrl.searchParams.get('quality') ?? 'High'

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
  }

  // ── 1. InnerTube via our own proxy route ──────────────────────────────
  // The proxy fetches audio bytes server-side, so the IP that requests
  // the YouTube URL and the IP that serves the browser are the same.
  try {
    const innertube = await getInnertube()
    const info = await innertube.getInfo(videoId)
    const formats = (info.streaming_data?.adaptive_formats ?? []).filter(
      (f: any) => (f.mime_type ?? '').startsWith('audio/') && f.url
    )
    if (formats.length > 0) {
      const duration = info.basic_info?.duration ?? 0
      // Return our proxy URL — the browser streams through our server
      return NextResponse.json({
        audioUrl: `/api/music/proxy/${videoId}?quality=${quality}`,
        duration,
        source: 'innertube-proxy',
      })
    }
  } catch {
    yt = null // reset stale instance
  }

  // ── 2. Invidious proxy URLs ───────────────────────────────────────────
  // Invidious already proxies the audio through their own server (local=true),
  // so the browser IP issue is handled on their end.
  const invidiousResults = await Promise.allSettled(
    INVIDIOUS_INSTANCES.map((i) => checkInvidious(videoId, i))
  )
  for (const r of invidiousResults) {
    if (r.status === 'fulfilled' && r.value?.audioUrl) {
      return NextResponse.json(r.value)
    }
  }

  return NextResponse.json(
    { error: 'Could not find audio stream. The song may be unavailable or region-restricted.' },
    { status: 404 }
  )
}
