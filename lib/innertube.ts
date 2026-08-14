// Ported from InnerTube Kotlin engine (InnerTube.kt, YouTube.kt, models, and page extractors)

export interface SongItem {
  videoId: string
  title: string
  artist: string
  artistId?: string | null
  album: string
  duration: number
  thumbnail: string
}

export interface ArtistItem {
  artistId: string
  name: string
  subscribers?: string
  thumbnail: string
}

export interface AlbumItem {
  albumId: string
  title: string
  artist: string
  year?: string | number
  thumbnail: string
}

export interface ArtistDetails {
  name: string
  description?: string
  subscribers?: string
  thumbnails: { url: string; width?: number; height?: number }[]
  topSongs: SongItem[]
  albums: AlbumItem[]
  singles: AlbumItem[]
}

export interface AlbumDetails {
  name: string
  artist?: string
  year?: string | number
  thumbnails: { url: string; width?: number; height?: number }[]
  songs: SongItem[]
}

export class InnerTube {
  private static readonly API_BASE = "https://music.youtube.com/youtubei/v1"
  private static readonly USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0"
  private static readonly CLIENT_NAME = "WEB_REMIX"
  private static readonly CLIENT_VERSION = "1.20260213.01.00"
  private static readonly CLIENT_ID = "67"

  private static getContext(hl = "en", gl = "US") {
    return {
      client: {
        clientName: this.CLIENT_NAME,
        clientVersion: this.CLIENT_VERSION,
        hl,
        gl,
        userAgent: this.USER_AGENT,
      },
    }
  }

  private static async request<T = any>(endpoint: string, body: Record<string, any>): Promise<T> {
    const res = await fetch(`${this.API_BASE}/${endpoint}?prettyPrint=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": this.USER_AGENT,
        "X-Goog-Api-Format-Version": "1",
        "X-YouTube-Client-Name": this.CLIENT_ID,
        "X-YouTube-Client-Version": this.CLIENT_VERSION,
        "X-Origin": "https://music.youtube.com",
        Referer: "https://music.youtube.com/",
      },
      body: JSON.stringify({
        context: this.getContext(),
        ...body,
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error(`InnerTube HTTP ${res.status}: ${res.statusText}`)
    }

    return res.json()
  }

  public static formatThumbnail(url?: string): string {
    if (!url) return ""
    let formatted = url
    if (formatted.includes("=w") || formatted.includes("-w")) {
      formatted = formatted.replace(/([=-]w)\d+([=-]h)\d+.*/, "$11200$21200-c")
    } else if (formatted.includes("=s")) {
      formatted = formatted.replace(/=s\d+.*/, "=s1200")
    }
    return formatted
  }

  public static parseDuration(timeStr?: string): number {
    if (!timeStr) return 0
    const parts = timeStr.split(":").map((p) => parseInt(p, 10))
    if (parts.some(isNaN)) return 0
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return 0
  }

  // --- Search ---
  public static async searchSongs(query: string): Promise<SongItem[]> {
    // Search with Song Filter: EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D
    const data = await this.request("search", {
      query,
      params: "EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D",
    })

    const tabs = data?.contents?.tabbedSearchResultsRenderer?.tabs || []
    const contents =
      tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents || []

    return contents
      .map((item: any) => {
        const renderer = item.musicResponsiveListItemRenderer
        if (!renderer) return null
        return this.parseMusicResponsiveListItem(renderer)
      })
      .filter(Boolean) as SongItem[]
  }

  public static async searchArtists(query: string): Promise<ArtistItem[]> {
    const data = await this.request("search", {
      query,
      params: "EgWKAQIgAWoKEAkQChAFEAMQBA%3D%3D",
    })

    const tabs = data?.contents?.tabbedSearchResultsRenderer?.tabs || []
    const contents =
      tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents || []

    return contents
      .map((item: any) => {
        const r = item.musicResponsiveListItemRenderer
        if (!r) return null
        const name = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text
        const artistId =
          r.navigationEndpoint?.browseEndpoint?.browseId ||
          r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint
            ?.browseEndpoint?.browseId
        const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
        const subs = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[2]?.text

        if (!name || !artistId) return null
        return {
          artistId,
          name,
          subscribers: subs || "Popular Artist",
          thumbnail: this.formatThumbnail(thumbs[thumbs.length - 1]?.url),
        }
      })
      .filter(Boolean) as ArtistItem[]
  }

  public static async searchAlbums(query: string): Promise<AlbumItem[]> {
    const data = await this.request("search", {
      query,
      params: "EgWKAQIYAWoKEAkQChAFEAMQBA%3D%3D",
    })

    const tabs = data?.contents?.tabbedSearchResultsRenderer?.tabs || []
    const contents =
      tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents || []

    return contents
      .map((item: any) => {
        const r = item.musicResponsiveListItemRenderer
        if (!r) return null
        const title = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text
        const albumId = r.navigationEndpoint?.browseEndpoint?.browseId
        const artist = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[2]?.text || ""
        const year = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[4]?.text
        const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []

        if (!title || !albumId) return null
        return {
          albumId,
          title,
          artist,
          year,
          thumbnail: this.formatThumbnail(thumbs[thumbs.length - 1]?.url),
        }
      })
      .filter(Boolean) as AlbumItem[]
  }

  // --- Explore / Browse ---
  public static async explore() {
    const data = await this.request("browse", { browseId: "FEmusic_explore" })
    const sections =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
        ?.contents || []

    let newReleaseAlbums: AlbumItem[] = []
    for (const section of sections) {
      const carousel = section.musicCarouselShelfRenderer
      if (carousel) {
        for (const item of carousel.contents || []) {
          const twoRow = item.musicTwoRowItemRenderer
          if (twoRow) {
            const title = twoRow.title?.runs?.[0]?.text
            const browseId = twoRow.navigationEndpoint?.browseEndpoint?.browseId
            const artist = twoRow.subtitle?.runs?.[2]?.text || twoRow.subtitle?.runs?.[0]?.text || ""
            const thumbs = twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
            if (title && browseId) {
              newReleaseAlbums.push({
                albumId: browseId,
                title,
                artist,
                thumbnail: this.formatThumbnail(thumbs[thumbs.length - 1]?.url),
              })
            }
          }
        }
      }
    }
    return newReleaseAlbums
  }

  // --- Artist Page ---
  public static async getArtist(artistId: string): Promise<ArtistDetails> {
    const data = await this.request("browse", { browseId: artistId })

    const header =
      data.header?.musicImmersiveHeaderRenderer ||
      data.header?.musicVisualHeaderRenderer ||
      data.header?.musicHeaderRenderer

    const name = header?.title?.runs?.[0]?.text || "Unknown Artist"
    const description =
      data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find(
        (c: any) => c.musicDescriptionShelfRenderer
      )?.musicDescriptionShelfRenderer?.description?.runs?.map((r: any) => r.text).join("") ||
      header?.description?.runs?.map((r: any) => r.text).join("") || ""

    const subscribers =
      header?.subscriptionButton?.subscribeButtonRenderer?.subscriberCountWithSubscribeText?.runs?.[0]?.text ||
      header?.subscriptionButton?.subscribeButtonRenderer?.longSubscriberCountText?.runs?.[0]?.text ||
      header?.subscriptionButton?.subscribeButtonRenderer?.shortSubscriberCountText?.runs?.[0]?.text || ""

    const headerThumbs =
      header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
      header?.foregroundThumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []

    const sections =
      data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
        ?.contents || []

    const topSongs: SongItem[] = []
    const albums: AlbumItem[] = []
    const singles: AlbumItem[] = []

    for (const section of sections) {
      const shelf = section.musicShelfRenderer
      if (shelf) {
        for (const item of shelf.contents || []) {
          if (item.musicResponsiveListItemRenderer) {
            const parsed = this.parseMusicResponsiveListItem(item.musicResponsiveListItemRenderer, name, artistId)
            if (parsed) topSongs.push(parsed)
          }
        }
      }

      const carousel = section.musicCarouselShelfRenderer
      if (carousel) {
        const sectionTitle = carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text?.toLowerCase() || ""
        for (const item of carousel.contents || []) {
          const twoRow = item.musicTwoRowItemRenderer
          if (twoRow) {
            const title = twoRow.title?.runs?.[0]?.text
            const browseId = twoRow.navigationEndpoint?.browseEndpoint?.browseId
            const year = twoRow.subtitle?.runs?.[twoRow.subtitle?.runs?.length - 1]?.text
            const thumbs = twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
            if (title && browseId) {
              const albumItem: AlbumItem = {
                albumId: browseId,
                title,
                artist: name,
                year,
                thumbnail: this.formatThumbnail(thumbs[thumbs.length - 1]?.url),
              }
              if (sectionTitle.includes("single") || sectionTitle.includes("ep")) {
                singles.push(albumItem)
              } else {
                albums.push(albumItem)
              }
            }
          }
        }
      }
    }

    return {
      name,
      description,
      subscribers,
      thumbnails: headerThumbs.map((t: any) => ({
        url: this.formatThumbnail(t.url),
        width: t.width,
        height: t.height,
      })),
      topSongs,
      albums,
      singles,
    }
  }

  // --- Album Page ---
  public static async getAlbum(albumId: string): Promise<AlbumDetails> {
    const data = await this.request("browse", {
      browseId: albumId.startsWith("VL") ? albumId : `VL${albumId}`,
    })

    const twoColumn = data.contents?.twoColumnBrowseResultsRenderer
    const singleColumn = data.contents?.singleColumnBrowseResultsRenderer

    const header =
      twoColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicResponsiveHeaderRenderer ||
      singleColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicResponsiveHeaderRenderer ||
      data.header?.musicDetailHeaderRenderer

    const name = header?.title?.runs?.[0]?.text || "Unknown Album"
    const artist =
      header?.straplineTextOne?.runs?.[0]?.text ||
      header?.subtitle?.runs?.find((r: any) => r.navigationEndpoint?.browseEndpoint?.browseId)?.text ||
      "Unknown Artist"
    const artistId =
      header?.straplineTextOne?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
      header?.subtitle?.runs?.find((r: any) => r.navigationEndpoint?.browseEndpoint?.browseId)?.navigationEndpoint?.browseEndpoint?.browseId ||
      null
    const year = header?.subtitle?.runs?.[header?.subtitle?.runs?.length - 1]?.text

    const thumbs =
      header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
      header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails || []

    const formattedThumb = this.formatThumbnail(thumbs[thumbs.length - 1]?.url)

    const shelfContents =
      twoColumn?.secondaryContents?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer?.contents ||
      singleColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents || []

    const songs: SongItem[] = shelfContents
      .map((item: any) => {
        const r = item.musicResponsiveListItemRenderer
        if (!r) return null
        const videoId =
          r.playlistItemData?.videoId ||
          r.navigationEndpoint?.watchEndpoint?.videoId ||
          r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId

        const title = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text
        const durationStr = r.fixedColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text

        if (!videoId || !title) return null

        return {
          videoId,
          title,
          artist,
          artistId,
          album: name,
          duration: this.parseDuration(durationStr),
          thumbnail: formattedThumb,
        }
      })
      .filter(Boolean) as SongItem[]

    return {
      name,
      artist,
      year,
      thumbnails: thumbs.map((t: any) => ({
        url: this.formatThumbnail(t.url),
        width: t.width,
        height: t.height,
      })),
      songs,
    }
  }

  // --- Helper Parser ---
  private static parseMusicResponsiveListItem(
    renderer: any,
    fallbackArtist?: string,
    fallbackArtistId?: string | null
  ): SongItem | null {
    const videoId =
      renderer.playlistItemData?.videoId ||
      renderer.navigationEndpoint?.watchEndpoint?.videoId ||
      renderer.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
        ?.watchEndpoint?.videoId

    const title = renderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text
    const secondLineRuns = renderer.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []

    const artistRun = secondLineRuns.find(
      (r: any) => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith("UC") || r.navigationEndpoint?.browseEndpoint?.isArtistEndpoint
    ) || secondLineRuns[0]

    const artist = artistRun?.text || fallbackArtist || "Unknown Artist"
    const artistId = artistRun?.navigationEndpoint?.browseEndpoint?.browseId || fallbackArtistId || null

    const albumRun = secondLineRuns.find(
      (r: any) => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith("MPREb_")
    )
    const album = albumRun?.text || ""

    const durationRun =
      renderer.fixedColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text ||
      secondLineRuns[secondLineRuns.length - 1]?.text

    const thumbs = renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
    const thumbnail = this.formatThumbnail(thumbs[thumbs.length - 1]?.url)

    if (!videoId || !title) return null

    return {
      videoId,
      title,
      artist,
      artistId,
      album,
      duration: this.parseDuration(durationRun),
      thumbnail,
    }
  }
}
