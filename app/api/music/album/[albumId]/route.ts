import { NextRequest, NextResponse } from "next/server"
import { InnerTube } from "@/lib/innertube"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params
  if (!albumId) return NextResponse.json({ error: "Album ID required" }, { status: 400 })

  try {
    const albumData = await InnerTube.getAlbum(decodeURIComponent(albumId))
    return NextResponse.json(albumData)
  } catch (error: any) {
    console.error(`[InnerTube] Album (${albumId}) error:`, error?.message || error)
    return NextResponse.json({ error: "Failed to fetch album" }, { status: 500 })
  }
}
