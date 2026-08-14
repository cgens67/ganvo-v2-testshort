import { NextResponse } from "next/server"
import { InnerTube } from "@/lib/innertube"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const [artistsRes, songsRes, videosRes, albumsRes] = await Promise.all([
      InnerTube.searchArtists("Top Global Artists"),
      InnerTube.searchSongs("Top Global Hits", false),
      InnerTube.searchSongs("Official Music Videos", true),
      InnerTube.searchAlbums("Top Albums 2025"),
    ])

    const searchQueries = [
      "XO Tour Llif3 Lil Uzi Vert",
      "APT. Rose Bruno Mars",
      "Die With A Smile Lady Gaga Bruno Mars",
      "Heartless The Weeknd",
      "Starboy The Weeknd",
      "Blinding Lights The Weeknd",
      "Save Your Tears The Weeknd",
      "Die For You The Weeknd",
    ]

    const picksResults = await Promise.all(
      searchQueries.map(async (q) => {
        try {
          const res = await InnerTube.searchSongs(q)
          return res[0] || null
        } catch {
          return null
        }
      })
    )

    const creatorsPicks = picksResults.filter(Boolean)
    const artists = artistsRes.slice(0, 15)
    const songs = songsRes.slice(0, 15)
    const videos = videosRes.slice(0, 15)
    const albums = albumsRes.slice(0, 15)

    return NextResponse.json({
      creatorsPicks,
      artists,
      songs,
      videos,
      albums,
    })
  } catch (error: any) {
    console.error("[InnerTube] Explore error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch explore data" }, { status: 500 })
  }
}
