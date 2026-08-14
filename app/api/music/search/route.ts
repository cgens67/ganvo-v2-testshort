import { NextRequest, NextResponse } from "next/server"
import { InnerTube } from "@/lib/innertube"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const songs = await InnerTube.searchSongs(query)
    return NextResponse.json({ results: songs })
  } catch (error: any) {
    console.error("[InnerTube] Search error:", error?.message || error)
    return NextResponse.json({ error: "Failed to search songs" }, { status: 500 })
  }
}
