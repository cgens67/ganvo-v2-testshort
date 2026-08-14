import { Song } from "@/types/player"

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
  topSongs: Song[]
  albums: AlbumItem[]
  singles: AlbumItem[]
}

export interface AlbumDetails {
  name: string
  artist?: string
  year?: string | number
  thumbnails: { url: string; width?: number; height?: number }[]
  songs: Song[]
}

export class InnerTube {
  private static readonly API_BASE = "https://music.youtube.com/youtubei/v1"
  private static readonly USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0"
  private static readonly CLIENT_NAME = "WEB_REMIX"
  private static readonly CLIENT_VERSION = "1.20260213.01.00"
  private static readonly CLIENT_ID = "67"

  public static readonly MUSIC_VIDEO_TYPE_ATV = "MUSIC_VIDEO_TYPE_ATV"
  public static readonly MUSIC_VIDEO_TYPE_OMV = "MUSIC_VIDEO_TYPE_OMV"
  public static readonly MUSIC_VIDEO_TYPE_UGC = "MUSIC_VIDEO_TYPE_UGC"

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
    let formatted = url.startsWith("//") ? `https:${url}` : url
    if (formatted.includes("=w") || formatted.includes("-w")) {
      formatted = formatted.replace(/([=-]w)\d+([=-]h)\d+.*/, "$11200$21200-c")
    } else if (formatted.includes("=s")) {
      formatted = formatted.replace(/=s\d+.*/, "=s1200")
    }
    return formatted
  }

  public static parseDuration(timeStr?: string): number {
    if (!timeStr) return 0
    const parts = timeStr.trim().split(":").map((p) => parseInt(p, 10))
    if (parts.some(isNaN)) return 0
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return 0
  }

  private static joinRuns(runs?: { text: string }[]): string {
    if (!runs || !Array.isArray(runs)) return ""
    return runs.map((r) => r.text || "").join("").trim()
  }

  // --- Search Songs & Videos ---
  public static async searchSongs(query: string, filterVideos = false): Promise<Song[]> {
    const params = filterVideos
      ? "EgWKAQIQAWoKEAkQChAFEAMQBA%3D%3D" // Video filter
      : "EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D" // Song filter

    const data = await this.request("search", { query, params })
    const tabs = data?.contents?.tabbedSearchResultsRenderer?.tabs || []
    const contents =
      tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents || []

    return contents
      .map((item: any) => {
        const renderer = item.musicResponsiveListItemRenderer
        if (!renderer) return null
        return this.parseMusicResponsiveListItem(renderer)
      })
      .filter(Boolean) as Song[]
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
        const name = this.joinRuns(r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)
        const artistId =
          r.navigationEndpoint?.browseEndpoint?.browseId ||
          r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint
            ?.browseEndpoint?.browseId
        const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
        const subs = this.joinRuns(r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)

        if (!name || !artistId) return null
        return {
          artistId,
          name,
          subscribers: subs || "Artist",
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
        const title = this.joinRuns(r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)
        const albumId =
          r.navigationEndpoint?.browseEndpoint?.browseId ||
          r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint
            ?.browseEndpoint?.browseId
        const secondLineRuns = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []
        const artist = secondLineRuns[2]?.text || secondLineRuns[0]?.text || "Unknown Artist"
        const year = secondLineRuns[secondLineRuns.length - 1]?.text || ""
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

  // --- Explore ---
  public static async explore() {
    const data = await this.request("browse", { browseId: "FEmusic_explore" })
    const sections =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
        ?.contents || []

    const newReleaseAlbums: AlbumItem[] = []
    for (const section of sections) {
      const carousel = section.musicCarouselShelfRenderer
      if (carousel) {
        for (const item of carousel.contents || []) {
          const twoRow = item.musicTwoRowItemRenderer
          if (twoRow) {
            const title = this.joinRuns(twoRow.title?.runs)
            const browseId = twoRow.navigationEndpoint?.browseEndpoint?.browseId
            const subtitleRuns = twoRow.subtitle?.runs || []
            const artist = subtitleRuns[2]?.text || subtitleRuns[0]?.text || ""
            const year = subtitleRuns[subtitleRuns.length - 1]?.text || ""
            const thumbs = twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
            if (title && browseId) {
              newReleaseAlbums.push({
                albumId: browseId,
                title,
                artist,
                year,
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
    const cleanId = artistId.trim()
    const data = await this.request("browse", { browseId: cleanId })

    const header =
      data.header?.musicImmersiveHeaderRenderer ||
      data.header?.musicVisualHeaderRenderer ||
      data.header?.musicHeaderRenderer ||
      data.header?.musicDetailHeaderRenderer

    const name = this.joinRuns(header?.title?.runs) || "Unknown Artist"

    const descFromShelf = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find(
      (c: any) => c.musicDescriptionShelfRenderer
    )?.musicDescriptionShelfRenderer?.description?.runs

    const description = this.joinRuns(descFromShelf || header?.description?.runs)

    const subscribers =
      this.joinRuns(header?.subscriptionButton2?.subscribeButtonRenderer?.subscriberCountWithSubscribeText?.runs) ||
      this.joinRuns(header?.subscriptionButton?.subscribeButtonRenderer?.longSubscriberCountText?.runs) ||
      this.joinRuns(header?.subscriptionButton?.subscribeButtonRenderer?.shortSubscriberCountText?.runs) ||
      this.joinRuns(header?.subtitle?.runs) ||
      ""

    const headerThumbs =
      header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
      header?.foregroundThumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
      header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails ||
      []

    const sections =
      data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
        ?.contents || []

    const topSongs: Song[] = []
    const albums: AlbumItem[] = []
    const singles: AlbumItem[] = []

    for (const section of sections) {
      const shelf = section.musicShelfRenderer
      if (shelf) {
        for (const item of shelf.contents || []) {
          if (item.musicResponsiveListItemRenderer) {
            const parsed = this.parseMusicResponsiveListItem(item.musicResponsiveListItemRenderer, name, cleanId)
            if (parsed) topSongs.push(parsed)
          }
        }
      }

      const carousel = section.musicCarouselShelfRenderer
      if (carousel) {
        const sectionTitle = this.joinRuns(carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs).toLowerCase()
        for (const item of carousel.contents || []) {
          const twoRow = item.musicTwoRowItemRenderer
          if (twoRow) {
            const title = this.joinRuns(twoRow.title?.runs)
            const browseId = twoRow.navigationEndpoint?.browseEndpoint?.browseId
            const subtitleRuns = twoRow.subtitle?.runs || []
            const year = subtitleRuns[subtitleRuns.length - 1]?.text
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
    const cleanBrowseId = albumId.trim()
    const data = await this.request("browse", { browseId: cleanBrowseId })

    const twoColumn = data.contents?.twoColumnBrowseResultsRenderer
    const singleColumn = data.contents?.singleColumnBrowseResultsRenderer

    const sectionHeader =
      twoColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicResponsiveHeaderRenderer ||
      singleColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicResponsiveHeaderRenderer

    const directHeader =
      data.header?.musicDetailHeaderRenderer ||
      data.header?.musicEditablePlaylistDetailHeaderRenderer?.header?.musicDetailHeaderRenderer ||
      data.header?.musicEditablePlaylistDetailHeaderRenderer?.header?.musicResponsiveHeaderRenderer

    const title =
      this.joinRuns(sectionHeader?.title?.runs) ||
      this.joinRuns(directHeader?.title?.runs) ||
      "Unknown Album"

    const artist =
      this.joinRuns(sectionHeader?.straplineTextOne?.runs) ||
      this.joinRuns(directHeader?.subtitle?.runs?.filter((r: any) => r.navigationEndpoint?.browseEndpoint)) ||
      directHeader?.subtitle?.runs?.[0]?.text ||
      "Unknown Artist"

    const artistId =
      sectionHeader?.straplineTextOne?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
      directHeader?.subtitle?.runs?.find((r: any) => r.navigationEndpoint?.browseEndpoint?.browseId)?.navigationEndpoint?.browseEndpoint?.browseId ||
      null

    const subtitleRuns = sectionHeader?.subtitle?.runs || directHeader?.subtitle?.runs || []
    const year = subtitleRuns[subtitleRuns.length - 1]?.text || ""

    const thumbs =
      sectionHeader?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
      directHeader?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
      directHeader?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails ||
      data.background?.musicThumbnailRenderer?.thumbnail?.thumbnails ||
      []

    const formattedThumb = this.formatThumbnail(thumbs[thumbs.length - 1]?.url)

    let rawSongsList: any[] = []

    const secondaryContents = twoColumn?.secondaryContents?.sectionListRenderer?.contents || []
    for (const c of secondaryContents) {
      if (c.musicShelfRenderer?.contents) rawSongsList.push(...c.musicShelfRenderer.contents)
      if (c.musicPlaylistShelfRenderer?.contents) rawSongsList.push(...c.musicPlaylistShelfRenderer.contents)
    }

    const singleContents = singleColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || []
    for (const c of singleContents) {
      if (c.musicShelfRenderer?.contents) rawSongsList.push(...c.musicShelfRenderer.contents)
      if (c.musicPlaylistShelfRenderer?.contents) rawSongsList.push(...c.musicPlaylistShelfRenderer.contents)
    }

    // Fallback: If no songs embedded, resolve playlistId and fetch via VL playlist browse
    if (rawSongsList.length === 0) {
      const canonicalUrl = data.microformat?.microformatDataRenderer?.urlCanonical || ""
      const playlistId = canonicalUrl.includes("list=")
        ? canonicalUrl.substring(canonicalUrl.lastIndexOf("=") + 1)
        : null

      if (playlistId) {
        try {
          const playlistData = await this.request("browse", { browseId: `VL${playlistId}` })
          const pSecondary = playlistData.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer?.contents || []
          for (const c of pSecondary) {
            if (c.musicPlaylistShelfRenderer?.contents) rawSongsList.push(...c.musicPlaylistShelfRenderer.contents)
            if (c.musicShelfRenderer?.contents) rawSongsList.push(...c.musicShelfRenderer.contents)
          }
        } catch {}
      }
    }

    const songs: Song[] = rawSongsList
      .map((item: any) => {
        const r = item.musicResponsiveListItemRenderer
        if (!r) return null
        const videoId =
          r.playlistItemData?.videoId ||
          r.navigationEndpoint?.watchEndpoint?.videoId ||
          r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId

        const songTitle =
          this.joinRuns(r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs) ||
          r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text

        // Extract duration from fixed column OR flex column
        const fixedCol = r.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer || r.fixedColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer
        const durationStr =
          this.joinRuns(fixedCol?.text?.runs) ||
          fixedCol?.text?.runs?.[0]?.text ||
          r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[r.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.length - 1]?.text

        const itemThumb = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
        const songThumbnail = itemThumb ? this.formatThumbnail(itemThumb[itemThumb.length - 1]?.url) : formattedThumb

        const musicVideoType =
          r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
            ?.watchEndpoint?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig?.musicVideoType ||
          r.navigationEndpoint?.watchEndpoint?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig?.musicVideoType ||
          this.MUSIC_VIDEO_TYPE_ATV

        if (!videoId || !songTitle) return null

        return {
          videoId,
          title: songTitle,
          artist,
          artistId,
          album: title,
          duration: this.parseDuration(durationStr),
          thumbnail: songThumbnail,
          musicVideoType,
          isVideoSong: musicVideoType !== this.MUSIC_VIDEO_TYPE_ATV,
        }
      })
      .filter(Boolean) as Song[]

    return {
      name: title,
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

  // --- Helper Item Parser ---
  public static parseMusicResponsiveListItem(
    renderer: any,
    fallbackArtist?: string,
    fallbackArtistId?: string | null
  ): Song | null {
    const videoId =
      renderer.playlistItemData?.videoId ||
      renderer.navigationEndpoint?.watchEndpoint?.videoId ||
      renderer.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
        ?.watchEndpoint?.videoId

    const title = this.joinRuns(renderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)
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

    const fixedCol = renderer.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer || renderer.fixedColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer
    const durationStr =
      this.joinRuns(fixedCol?.text?.runs) ||
      secondLineRuns[secondLineRuns.length - 1]?.text

    const thumbs = renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
    const thumbnail = this.formatThumbnail(thumbs[thumbs.length - 1]?.url)

    const musicVideoType =
      renderer.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
        ?.watchEndpoint?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig?.musicVideoType ||
      renderer.navigationEndpoint?.watchEndpoint?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig?.musicVideoType ||
      null

    if (!videoId || !title) return null

    return {
      videoId,
      title,
      artist,
      artistId,
      album,
      duration: this.parseDuration(durationStr),
      thumbnail,
      musicVideoType,
      isVideoSong: musicVideoType !== null && musicVideoType !== this.MUSIC_VIDEO_TYPE_ATV,
    }
  }
}
