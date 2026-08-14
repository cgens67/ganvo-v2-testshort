import { NextRequest, NextResponse } from "next/server"
import { InnerTube } from "@/lib/innertube"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  const { artistId } = await params
  if (!artistId) return NextResponse.json({ error: "Artist ID required" }, { status: 400 })

  try {
    const artistData = await InnerTube.getArtist(decodeURIComponent(artistId))
    return NextResponse.json(artistData)
  } catch (error: any) {
    console.error(`[InnerTube] Artist (${artistId}) error:`, error?.message || error)
    return NextResponse.json({ error: "Failed to fetch artist" }, { status: 500 })
  }
}
