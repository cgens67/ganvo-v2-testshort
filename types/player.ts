export interface Song {
  videoId: string
  title: string
  artist: string
  artistId?: string | null
  album: string
  duration: number
  thumbnail: string
  musicVideoType?: string | null
  isVideoSong?: boolean
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
}

export interface LyricLine {
  time: number
  text: string
}

export interface LyricsData {
  syncedLyrics: LyricLine[] | null
  plainLyrics: string | null
}

export interface ColorTheme {
  id: string
  name: string
  primary: string
  secondary: string
}

export type PlayerStyle =
  | "Classic"
  | "Open"
  | "Modern"
  | "Minimal"
  | "Cinematic"
  | "Expressive"
  | "Immersive"

export type ActiveTab =
  | "player"
  | "explore"
  | "queue"
  | "lyrics"
  | "library"
  | "artist"
  | "album"
  | "playlistView"

export type MobilePlayerTab = "player" | "lyrics" | "queue"
