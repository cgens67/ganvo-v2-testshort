import { NextRequest, NextResponse } from 'next/server'
import { Innertube } from 'youtubei.js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Singleton — reused across requests so we don't pay the init cost every time
let yt: Awaited<ReturnType<typeof Innertube.create>> | null = null

async function getInnertube() {
  if (!yt) {
    yt = await Innertube.create({ generate_session_locally: true })
  }
  return yt
}

function pickAudioFormat(formats: any[], quality: string) {
  const audio = formats.filter((f: any) => {
    const mime: string = f.mime_type ?? ''
    return mime.startsWith('audio/') && f.url
  })
  if (!audio.length) return null
  audio.sort((a: any, b: any) => {
    const ab = a.average_bitrate ?? a.bitrate ?? 0
    const bb = b.average_bitrate ?? b.bitrate ?? 0
    return quality === 'Low' ? ab - bb : bb - ab
  })
  return audio[0]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params
  const quality = request.nextUrl.searchParams.get('quality') ?? 'High'

  if (!videoId) {
    return new NextResponse('Video ID required', { status: 400 })
  }

  let youtubeUrl: string
  let mimeType = 'audio/mp4'

  try {
    const innertube = await getInnertube()
    const info = await innertube.getInfo(videoId)
    const format = pickAudioFormat(
      info.streaming_data?.adaptive_formats ?? [],
      quality
    )
    if (!format?.url) throw new Error('No audio format found')
    youtubeUrl = format.url
    mimeType = format.mime_type?.split(';')[0] ?? 'audio/mp4'
  } catch (e) {
    yt = null // reset stale instance
    return new NextResponse('Could not resolve audio stream', { status: 502 })
  }

  // Forward Range header so browsers can seek
  const rangeHeader = request.headers.get('range') ?? undefined

  const upstreamHeaders: HeadersInit = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'identity', // avoid gzip so Content-Length is accurate
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/',
  }
  if (rangeHeader) upstreamHeaders['Range'] = rangeHeader

  let upstream: Response
  try {
    upstream = await fetch(youtubeUrl, { headers: upstreamHeaders })
  } catch (e) {
    return new NextResponse('Upstream fetch failed', { status: 502 })
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse('Upstream error', { status: upstream.status })
  }

  // Pass relevant headers back to the browser
  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', mimeType)
  responseHeaders.set('Accept-Ranges', 'bytes')
  responseHeaders.set('Cache-Control', 'no-store')

  const contentLength = upstream.headers.get('content-length')
  if (contentLength) responseHeaders.set('Content-Length', contentLength)

  const contentRange = upstream.headers.get('content-range')
  if (contentRange) responseHeaders.set('Content-Range', contentRange)

  // Stream the body straight through — no buffering
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}
