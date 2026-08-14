"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { toast } from "sonner"
import { Song, Playlist, LyricsData, ColorTheme, PlayerStyle, ActiveTab, MobilePlayerTab } from "@/types/player"

const firebaseConfig = {
  apiKey: "AIzaSyBI-ABs1S7Ln2jJ7xYxgUZwU1nEXZmqI2c",
  authDomain: "ganvotesting.firebaseapp.com",
  projectId: "ganvotesting",
  storageBucket: "ganvotesting.firebasestorage.app",
  messagingSenderId: "1083596663051",
  appId: "1:1083596663051:web:52900f44e84034b7421a0e",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = typeof window !== "undefined" ? getAuth(app) : null
const db = typeof window !== "undefined" ? getFirestore(app) : null
const googleProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : null

export const COLOR_THEMES: ColorTheme[] = [
  { id: "default", name: "Default", primary: "", secondary: "#64748b" },
  { id: "teal", name: "Teal Wave", primary: "#14b8a6", secondary: "#0f766e" },
  { id: "green", name: "Green Apple", primary: "#22c55e", secondary: "#15803d" },
  { id: "blue", name: "Ocean", primary: "#3b82f6", secondary: "#1d4ed8" },
  { id: "purple", name: "Amethyst", primary: "#a855f7", secondary: "#7e22ce" },
  { id: "rose", name: "Rose", primary: "#f43f5e", secondary: "#be123c" },
  { id: "orange", name: "Sunset", primary: "#f97316", secondary: "#c2410c" },
]

export function usePlayerState() {
  const [isDark, setIsDark] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [searchSort, setSearchSort] = useState<"relevance" | "az" | "za">("relevance")
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchFocused, setSearchFocused] = useState(false)

  const [queue, setQueue] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off")
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [playbackRate, setPlaybackRate] = useState(1)

  const [lyrics, setLyrics] = useState<LyricsData | null>(null)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1)

  const [activeTab, setActiveTab] = useState<ActiveTab>("explore")
  const [isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState(false)
  const [mobilePlayerTab, setMobilePlayerTab] = useState<MobilePlayerTab>("player")

  const [exploreData, setExploreData] = useState<{
    creatorsPicks: Song[]
    artists: any[]
    songs: Song[]
    videos?: Song[]
    albums: any[]
  }>({ creatorsPicks: [], artists: [], songs: [], videos: [], albums: [] })
  const [isExploreLoading, setIsExploreLoading] = useState(true)
  const [exploreError, setExploreError] = useState(false)

  const [currentArtistData, setCurrentArtistData] = useState<any>(null)
  const [isArtistLoading, setIsArtistLoading] = useState(false)
  const [currentAlbumData, setCurrentAlbumData] = useState<any>(null)
  const [isAlbumLoading, setIsAlbumLoading] = useState(false)
  const [currentPlaylistView, setCurrentPlaylistView] = useState<Playlist | null>(null)

  const [showAboutDialog, setShowAboutDialog] = useState(false)
  const [showCreditsDialog, setShowCreditsDialog] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [showPlayerSettings, setShowPlayerSettings] = useState(false)
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false)
  const [showColorPalette, setShowColorPalette] = useState(false)

  const [showCustomThemeDialog, setShowCustomThemeDialog] = useState(false)
  const [showImportThemeDialog, setShowImportThemeDialog] = useState(false)
  const [tempPrimaryColor, setTempPrimaryColor] = useState("#14b8a6")
  const [tempSecondaryColor, setTempSecondaryColor] = useState("#0f766e")
  const [importThemeString, setImportThemeString] = useState("")
  const [customThemeColors, setCustomThemeColors] = useState({ primary: "#14b8a6", secondary: "#0f766e" })

  const [newPlaylistName, setNewPlaylistName] = useState("")

  const [colorTheme, setColorTheme] = useState("default")
  const [playerStyle, setPlayerStyle] = useState<PlayerStyle>("Classic")

  const [dynamicTheme, setDynamicTheme] = useState(true)
  const [playerBgStyle, setPlayerBgStyle] = useState<"Theme" | "Gradient" | "Blur">("Gradient")
  const [thumbnailRadius, setThumbnailRadius] = useState(32)
  const [dominantColor, setDominantColor] = useState<string | null>(null)
  const [lyricsProvider, setLyricsProvider] = useState<"lrclib" | "kugou">("lrclib")
  const [lyricsSize, setLyricsSize] = useState<"Normal" | "Large" | "Extra Large">("Normal")
  const [audioQuality, setAudioQuality] = useState<"High" | "Standard" | "Low">("High")
  const [autoPlaySimilar, setAutoPlaySimilar] = useState(false)

  const [autoScrollLyrics, setAutoScrollLyrics] = useState(true)
  const [lyricsAlignment, setLyricsAlignment] = useState<"Left" | "Center" | "Right">("Center")
  const [lyricsGlass, setLyricsGlass] = useState(false)
  const [hideCreatorsPicks, setHideCreatorsPicks] = useState(false)
  const [compactQueue, setCompactQueue] = useState(false)
  const [autoSwitchToPlayer, setAutoSwitchToPlayer] = useState(true)
  const [saveSearchHistory, setSaveSearchHistory] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [autoOpenLyrics, setAutoOpenLyrics] = useState(false)

  const [disableAnimations, setDisableAnimations] = useState(false)
  const [disableBlur, setDisableBlur] = useState(false)
  const [showTimeRemaining, setShowTimeRemaining] = useState(false)
  const [showPlaybackSpeed, setShowPlaybackSpeed] = useState(false)
  const [normalizeVolume, setNormalizeVolume] = useState(true)
  const [skipSilence, setSkipSilence] = useState(false)
  const [crossfade, setCrossfade] = useState(false)
  const [stopAfterCurrent, setStopAfterCurrent] = useState(false)
  const [dataSaver, setDataSaver] = useState(false)
  const [privateSession, setPrivateSession] = useState(false)

  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState("")
  const [displayNameInput, setDisplayNameInput] = useState("")

  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set())
  const [savedSongs, setSavedSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const ytParentRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const handleEndedRef = useRef<() => void>(() => {})

  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const lyricsContainerRefMobile = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const currentSong = queue[currentIndex]

  const ALL_THEMES = [
    ...COLOR_THEMES,
    { id: "custom", name: "Custom Theme", primary: customThemeColors.primary, secondary: customThemeColors.secondary },
  ]
  const activeTheme = ALL_THEMES.find((t) => t.id === colorTheme) || ALL_THEMES[0]

  useEffect(() => {
    let isActive = true
    if (!currentSong?.thumbnail || playerBgStyle === "Theme") {
      setDominantColor(null)
      return
    }
    const img = new Image()
    img.crossOrigin = "Anonymous"

    img.onload = () => {
      if (!isActive) return
      const canvas = document.createElement("canvas")
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0, 64, 64)
      try {
        const data = ctx.getImageData(0, 0, 64, 64).data
        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 16) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }
        if (count > 0) {
          setDominantColor(`rgba(${~~(r / count)}, ${~~(g / count)}, ${~~(b / count)}, 0.45)`)
        }
      } catch {
        if (isActive) setDominantColor(null)
      }
    }

    img.src = currentSong.thumbnail

    return () => {
      isActive = false
      img.onload = null
    }
  }, [currentSong?.thumbnail, playerBgStyle])

  const applyAudioEffects = useCallback(() => {
    if (ytPlayerRef.current?.setPlaybackRate) {
      try {
        ytPlayerRef.current.setPlaybackRate(playbackRate)
      } catch {}
    }
  }, [playbackRate])

  useEffect(() => {
    applyAudioEffects()
  }, [applyAudioEffects])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error)
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  useEffect(() => {
    try {
      const history = localStorage.getItem("ganvo_search_history")
      if (history) setSearchHistory(JSON.parse(history))

      const loadBoolSetting = (key: string, setter: (val: boolean) => void) => {
        const val = localStorage.getItem(key)
        if (val !== null) setter(val === "true")
      }

      const savedProvider = localStorage.getItem("ganvo_lyrics_provider")
      if (savedProvider) setLyricsProvider(savedProvider as "lrclib" | "kugou")
      const savedQuality = localStorage.getItem("ganvo_audio_quality")
      if (savedQuality) setAudioQuality(savedQuality as "High" | "Standard" | "Low")
      const savedAlignment = localStorage.getItem("ganvo_lyrics_alignment")
      if (savedAlignment) setLyricsAlignment(savedAlignment as "Left" | "Center" | "Right")

      const savedTheme = localStorage.getItem("ganvo_color_theme")
      if (savedTheme) setColorTheme(savedTheme)

      const savedCustomTheme = localStorage.getItem("ganvo_custom_theme")
      if (savedCustomTheme) {
        try {
          const parsed = JSON.parse(savedCustomTheme)
          setCustomThemeColors(parsed)
          setTempPrimaryColor(parsed.primary)
          setTempSecondaryColor(parsed.secondary)
        } catch {}
      }

      const savedPlayerStyle = localStorage.getItem("ganvo_player_style")
      if (savedPlayerStyle) setPlayerStyle(savedPlayerStyle as any)

      loadBoolSetting("ganvo_autoplay_similar", setAutoPlaySimilar)
      loadBoolSetting("ganvo_auto_scroll_lyrics", setAutoScrollLyrics)
      loadBoolSetting("ganvo_lyrics_glass", setLyricsGlass)
      loadBoolSetting("ganvo_hide_picks", setHideCreatorsPicks)
      loadBoolSetting("ganvo_compact_queue", setCompactQueue)
      loadBoolSetting("ganvo_auto_switch_player", setAutoSwitchToPlayer)
      loadBoolSetting("ganvo_save_history", setSaveSearchHistory)
      loadBoolSetting("ganvo_reduce_motion", setReduceMotion)
      loadBoolSetting("ganvo_auto_open_lyrics", setAutoOpenLyrics)
      loadBoolSetting("ganvo_disable_animations", setDisableAnimations)
      loadBoolSetting("ganvo_disable_blur", setDisableBlur)
      loadBoolSetting("ganvo_show_time_remaining", setShowTimeRemaining)
      loadBoolSetting("ganvo_show_playback_speed", setShowPlaybackSpeed)
      loadBoolSetting("ganvo_normalize_volume", setNormalizeVolume)
      loadBoolSetting("ganvo_skip_silence", setSkipSilence)
      loadBoolSetting("ganvo_crossfade", setCrossfade)
      loadBoolSetting("ganvo_stop_after_current", setStopAfterCurrent)
      loadBoolSetting("ganvo_data_saver", setDataSaver)
      loadBoolSetting("ganvo_private_session", setPrivateSession)
    } catch {}

    setIsExploreLoading(true)
    setExploreError(false)
    fetch("/api/music/explore")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && data.artists && data.songs && data.albums) {
          setExploreData(data)
        } else {
          setExploreError(true)
        }
      })
      .catch(() => setExploreError(true))
      .finally(() => setIsExploreLoading(false))
  }, [])

  useEffect(() => {
    if (!auth || !db) return
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        setDisplayNameInput(currentUser.displayName || "")
        const userRef = doc(db, "users", currentUser.uid)
        const docSnap = await getDoc(userRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          const localSaved = JSON.parse(localStorage.getItem("ganvo_saved_songs") || "[]")
          const localPlaylists = JSON.parse(localStorage.getItem("ganvo_playlists") || "[]")

          const combinedSaved = [...(data.savedSongs || []), ...localSaved].filter(
            (v, i, a) => a.findIndex((t) => t.videoId === v.videoId) === i
          )
          const combinedPlaylists = [...(data.playlists || []), ...localPlaylists].filter(
            (v, i, a) => a.findIndex((t) => t.id === v.id) === i
          )

          setSavedSongs(combinedSaved)
          setLikedSongs(new Set(combinedSaved.map((s: Song) => s.videoId)))
          setPlaylists(combinedPlaylists)

          await setDoc(userRef, { savedSongs: combinedSaved, playlists: combinedPlaylists }, { merge: true })
        } else {
          await setDoc(userRef, { savedSongs: [], playlists: [] })
        }
      } else {
        const saved = localStorage.getItem("ganvo_saved_songs")
        const localPlaylists = localStorage.getItem("ganvo_playlists")
        if (saved) {
          const parsed = JSON.parse(saved)
          setSavedSongs(parsed)
          setLikedSongs(new Set(parsed.map((s: Song) => s.videoId)))
        } else {
          setSavedSongs([])
          setLikedSongs(new Set())
        }
        if (localPlaylists) setPlaylists(JSON.parse(localPlaylists))
        else setPlaylists([])
      }
    })
    return () => unsubscribe()
  }, [])

  const syncToCloud = async (newSaved: Song[], newPlaylists: Playlist[]) => {
    localStorage.setItem("ganvo_saved_songs", JSON.stringify(newSaved))
    localStorage.setItem("ganvo_playlists", JSON.stringify(newPlaylists))
    if (user && db) {
      try {
        const userRef = doc(db, "users", user.uid)
        await setDoc(userRef, { savedSongs: newSaved, playlists: newPlaylists }, { merge: true })
      } catch {}
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    if (!email.includes("@")) {
      setAuthError("Please include an '@' in the email address.")
      return
    }
    if (!auth) return
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password)
      else await signInWithEmailAndPassword(auth, email, password)
      setShowAuthDialog(false)
      setEmail("")
      setPassword("")
    } catch (error: any) {
      setAuthError(error.message.replace("Firebase: ", ""))
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider) return
    setAuthError("")
    try {
      await signInWithPopup(auth, googleProvider)
      setShowAuthDialog(false)
    } catch (error: any) {
      setAuthError(error.message.replace("Firebase: ", ""))
    }
  }

  const handleSignOut = async () => {
    if (auth) await signOut(auth)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: displayNameInput })
        setUser({ ...auth.currentUser })
        setShowAccountSettings(false)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return
    const newPlaylist: Playlist = { id: Date.now().toString(), name: newPlaylistName.trim(), songs: [] }
    const updatedPlaylists = [...playlists, newPlaylist]
    setPlaylists(updatedPlaylists)
    syncToCloud(savedSongs, updatedPlaylists)
    setNewPlaylistName("")
    setShowPlaylistDialog(false)
    toast.success("Playlist created!")
  }

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        if (!p.songs.find((s) => s.videoId === song.videoId)) {
          return { ...p, songs: [...p.songs, song] }
        }
      }
      return p
    })
    setPlaylists(updatedPlaylists)
    syncToCloud(savedSongs, updatedPlaylists)
    toast.success("Added to playlist")
  }

  const handleSaveCustomTheme = (e: React.FormEvent) => {
    e.preventDefault()
    const newTheme = { primary: tempPrimaryColor, secondary: tempSecondaryColor }
    setCustomThemeColors(newTheme)
    setColorTheme("custom")
    localStorage.setItem("ganvo_color_theme", "custom")
    localStorage.setItem("ganvo_custom_theme", JSON.stringify(newTheme))
    setShowCustomThemeDialog(false)
    toast.success("Custom theme applied!")
  }

  const handleImportTheme = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsed = JSON.parse(importThemeString)
      if (parsed.primary && parsed.secondary) {
        setCustomThemeColors(parsed)
        setTempPrimaryColor(parsed.primary)
        setTempSecondaryColor(parsed.secondary)
        setColorTheme("custom")
        localStorage.setItem("ganvo_color_theme", "custom")
        localStorage.setItem("ganvo_custom_theme", JSON.stringify(parsed))
        setShowImportThemeDialog(false)
        setImportThemeString("")
        toast.success("Theme imported successfully!")
      } else throw new Error()
    } catch {
      toast.error("Invalid theme format. Please provide valid JSON.")
    }
  }

  const handleShare = async (song: Song) => {
    const shareData = {
      title: `${song.title} by ${song.artist}`,
      text: `Listen to ${song.title} on Ganvo Music`,
      url: `https://music.youtube.com/watch?v=${song.videoId}`,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success("Link copied to clipboard!")
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  const loadArtistView = async (artistId: string) => {
    setIsArtistLoading(true)
    setActiveTab("artist")
    setCurrentArtistData(null)
    setIsMobilePlayerExpanded(false)
    try {
      const res = await fetch(`/api/music/artist/${encodeURIComponent(artistId)}`)
      const data = await res.json()
      if (data && !data.error) setCurrentArtistData(data)
    } catch {} finally {
      setIsArtistLoading(false)
    }
  }

  const loadAlbumView = async (albumId: string) => {
    setIsAlbumLoading(true)
    setActiveTab("album")
    setCurrentAlbumData(null)
    setIsMobilePlayerExpanded(false)
    try {
      const res = await fetch(`/api/music/album/${encodeURIComponent(albumId)}`)
      const data = await res.json()
      if (data && !data.error) setCurrentAlbumData(data)
    } catch {} finally {
      setIsAlbumLoading(false)
    }
  }

  const loadPlaylistView = (playlist: Playlist) => {
    setCurrentPlaylistView(playlist)
    setActiveTab("playlistView")
    setIsMobilePlayerExpanded(false)
  }

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setSearchResults(data.results || [])
      } catch {} finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  const sortedSearchResults = [...searchResults].sort((a, b) => {
    if (searchSort === "az") return a.title.localeCompare(b.title)
    if (searchSort === "za") return b.title.localeCompare(a.title)
    return 0
  })

  const addToQueueAndPlay = async (song: Song) => {
    const saveSearchStr = searchQuery || song.title
    if (saveSearchStr.trim() && saveSearchHistory && !privateSession) {
      const newHistory = [saveSearchStr, ...searchHistory.filter((q) => q !== saveSearchStr)].slice(0, 15)
      setSearchHistory(newHistory)
      localStorage.setItem("ganvo_search_history", JSON.stringify(newHistory))
    }

    if (autoSwitchToPlayer && typeof window !== "undefined" && window.innerWidth >= 1024) {
      setActiveTab(autoOpenLyrics ? "lyrics" : "player")
    }
    if (autoOpenLyrics) {
      setMobilePlayerTab("lyrics")
    }

    const existingIndex = queue.findIndex((s) => s.videoId === song.videoId)

    if (existingIndex >= 0) {
      if (currentIndex === existingIndex && ytPlayerRef.current) {
        setIsLoading(true)
        setCurrentTime(0)
        ytPlayerRef.current.loadVideoById(song.videoId)
        ytPlayerRef.current.playVideo()
      } else {
        setCurrentIndex(existingIndex)
      }
    } else {
      setQueue((prev) => [...prev, song])
      setCurrentIndex(queue.length)
    }
    setSearchResults([])
    setSearchQuery("")
    setIsSearchExpanded(false)
    setSearchFocused(false)
  }

  const playFromLibrary = (song: Song) => addToQueueAndPlay(song)

  useEffect(() => {
    handleEndedRef.current = async () => {
      if (stopAfterCurrent) {
        setIsPlaying(false)
        if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo()
        return
      }

      if (repeatMode === "one") {
        if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
          ytPlayerRef.current.seekTo(0, true)
          ytPlayerRef.current.playVideo()
        }
      } else {
        if (currentIndex === queue.length - 1 && !shuffle && autoPlaySimilar && currentSong) {
          setIsLoading(true)
          try {
            const res = await fetch(
              `/api/music/search?q=${encodeURIComponent(currentSong.artist + " " + currentSong.title)}`
            )
            const data = await res.json()
            const similar = (data.results || []).filter((s: Song) => !queue.find((q) => q.videoId === s.videoId))
            if (similar.length > 0) {
              setQueue((prev) => [...prev, similar[0]])
              setCurrentIndex(queue.length)
            } else setIsPlaying(false)
          } catch {
            setIsPlaying(false)
          } finally {
            setIsLoading(false)
          }
        } else {
          playNext()
        }
      }
    }
  })

  useEffect(() => {
    let isMounted = true

    const initPlayer = () => {
      if (!ytParentRef.current || !isMounted) return

      const playerDiv = document.createElement("div")
      ytParentRef.current.innerHTML = ""
      ytParentRef.current.appendChild(playerDiv)

      ytPlayerRef.current = new (window as any).YT.Player(playerDiv, {
        height: "1",
        width: "1",
        videoId: currentSong?.videoId || "",
        playerVars: { playsinline: 1, controls: 0, disablekb: 1 },
        events: {
          onReady: (event: any) => {
            if (isMounted && event.target.setVolume) {
              event.target.setVolume(volume)
              if (currentSong) {
                setIsLoading(true)
                event.target.loadVideoById(currentSong.videoId)
                event.target.playVideo()
              }
            }
          },
          onStateChange: (e: any) => {
            if (!isMounted) return
            if (e.data === 1) {
              setIsPlaying(true)
              setIsLoading(false)
              setDuration(ytPlayerRef.current.getDuration() || 0)
            } else if (e.data === 2 || e.data === 0) {
              setIsPlaying(false)
              setIsLoading(false)
              if (e.data === 0 && handleEndedRef.current) handleEndedRef.current()
            } else if (e.data === 3) {
              setIsPlaying(true)
              setIsLoading(true)
            }
          },
          onError: () => {
            setIsLoading(false)
            setIsPlaying(false)
            setLoadError("Audio track unavailable in your region. Trying next...")
            setTimeout(() => playNext(), 3000)
          },
        },
      })
    }

    if (typeof window !== "undefined") {
      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer()
      } else {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScript = document.getElementsByTagName("script")[0]
        if (firstScript && firstScript.parentNode) firstScript.parentNode.insertBefore(tag, firstScript)
        else document.head.appendChild(tag)

        const existingCallback = (window as any).onYouTubeIframeAPIReady
        ;(window as any).onYouTubeIframeAPIReady = () => {
          if (existingCallback) existingCallback()
          initPlayer()
        }
      }
    }

    return () => {
      isMounted = false
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        ytPlayerRef.current.destroy()
        ytPlayerRef.current = null
      }
      if (ytParentRef.current) ytParentRef.current.innerHTML = ""
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          const t = ytPlayerRef.current.getCurrentTime() || 0
          const dur = ytPlayerRef.current.getDuration() || 0
          setCurrentTime(t)
          if (dur > 0) setDuration(dur)
        }
      }, 500)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  useEffect(() => {
    if (currentSong && ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
      setIsLoading(true)
      setCurrentTime(0)
      setLoadError(null)
      ytPlayerRef.current.loadVideoById(currentSong.videoId)
      ytPlayerRef.current.playVideo()
    }
  }, [currentSong?.videoId])

  useEffect(() => {
    if (!currentSong) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === "function") {
        ytPlayerRef.current.stopVideo()
      }
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [currentSong])

  useEffect(() => {
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) ytPlayerRef.current.setVolume(volume)
    if (ytPlayerRef.current && ytPlayerRef.current.mute) isMuted ? ytPlayerRef.current.mute() : ytPlayerRef.current.unMute()
  }, [volume, isMuted])

  useEffect(() => {
    if (!currentSong) return

    const loadLyrics = async () => {
      setLyrics(null)
      setCurrentLyricIndex(-1)

      try {
        const params = new URLSearchParams({
          track: currentSong.title,
          artist: currentSong.artist,
          ...(currentSong.album && { album: currentSong.album }),
          ...(currentSong.duration && { duration: String(currentSong.duration) }),
          provider: lyricsProvider,
        })
        const response = await fetch(`/api/lyrics?${params}`)
        const data = await response.json()
        if (data.syncedLyrics || data.plainLyrics) {
          setLyrics({ syncedLyrics: data.syncedLyrics, plainLyrics: data.plainLyrics })
        } else {
          setLyrics({ syncedLyrics: null, plainLyrics: null })
        }
      } catch {
        setLyrics({ syncedLyrics: null, plainLyrics: null })
      }
    }
    loadLyrics()
  }, [currentSong?.videoId, lyricsProvider])

  useEffect(() => {
    if (!lyrics?.syncedLyrics) return
    const lyric = lyrics.syncedLyrics.findLast((l) => l.time <= currentTime)
    const index = lyric ? lyrics.syncedLyrics.indexOf(lyric) : -1

    if (index !== currentLyricIndex) {
      setCurrentLyricIndex(index)
      if (index >= 0 && autoScrollLyrics) {
        setTimeout(() => {
          const activeLines = document.querySelectorAll(".lyric-active-line")
          activeLines.forEach((line) => {
            const container = line.closest(".lyrics-scroll-container") as HTMLElement
            if (container && line instanceof HTMLElement) {
              const scrollPos = line.offsetTop - container.clientHeight / 2 + line.clientHeight / 2
              container.scrollTo({ top: scrollPos, behavior: "smooth" })
            }
          })
        }, 50)
      }
    }
  }, [currentTime, lyrics, currentLyricIndex, autoScrollLyrics])

  const playNext = useCallback(() => {
    if (queue.length === 0) return
    const nextIndex = shuffle ? Math.floor(Math.random() * queue.length) : (currentIndex + 1) % queue.length
    if (nextIndex === 0 && repeatMode === "off" && !shuffle) {
      setIsPlaying(false)
      if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo()
      return
    }
    setCurrentIndex(nextIndex)
  }, [queue.length, currentIndex, shuffle, repeatMode])

  const togglePlay = useCallback(() => {
    if (!ytPlayerRef.current) return
    if (isPlaying) ytPlayerRef.current.pauseVideo()
    else ytPlayerRef.current.playVideo()
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return
    if (currentTime > 3) {
      if (ytPlayerRef.current) ytPlayerRef.current.seekTo(0, true)
      return
    }
    setCurrentIndex((currentIndex - 1 + queue.length) % queue.length)
  }, [queue.length, currentIndex, currentTime])

  const handleSeek = (value: number[]) => {
    if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(value[0], true)
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (ytPlayerRef.current?.setVolume) ytPlayerRef.current.setVolume(newVolume)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (ytPlayerRef.current) {
      if (isMuted) ytPlayerRef.current.unMute()
      else ytPlayerRef.current.mute()
    }
  }

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index))
    if (index < currentIndex) setCurrentIndex((prev) => prev - 1)
    else if (index === currentIndex && queue.length > 1 && index === queue.length - 1) setCurrentIndex((prev) => prev - 1)
  }

  const toggleLike = async (song: Song) => {
    setLikedSongs((prev) => {
      const next = new Set(prev)
      let newSaved = [...savedSongs]
      if (next.has(song.videoId)) {
        next.delete(song.videoId)
        newSaved = newSaved.filter((s) => s.videoId !== song.videoId)
      } else {
        next.add(song.videoId)
        newSaved.unshift(song)
      }
      setSavedSongs(newSaved)
      syncToCloud(newSaved, playlists)
      return next
    })
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return {
    isDark, setIsDark,
    isFullscreen, toggleFullscreen,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    sortedSearchResults,
    searchSort, setSearchSort,
    isSearching,
    isSearchExpanded, setIsSearchExpanded,
    searchHistory, setSearchHistory,
    searchFocused, setSearchFocused,
    queue, setQueue,
    currentIndex, setCurrentIndex,
    isPlaying, togglePlay,
    currentTime, setCurrentTime,
    duration,
    volume, handleVolumeChange,
    isMuted, toggleMute,
    shuffle, setShuffle,
    repeatMode, setRepeatMode,
    isLoading,
    loadError,
    playbackRate, setPlaybackRate,
    lyrics,
    currentLyricIndex,
    activeTab, setActiveTab,
    isMobilePlayerExpanded, setIsMobilePlayerExpanded,
    mobilePlayerTab, setMobilePlayerTab,
    exploreData,
    isExploreLoading,
    exploreError,
    currentArtistData,
    isArtistLoading,
    currentAlbumData,
    isAlbumLoading,
    currentPlaylistView,
    showAboutDialog, setShowAboutDialog,
    showCreditsDialog, setShowCreditsDialog,
    showAccountSettings, setShowAccountSettings,
    showPlayerSettings, setShowPlayerSettings,
    showPlaylistDialog, setShowPlaylistDialog,
    showColorPalette, setShowColorPalette,
    showCustomThemeDialog, setShowCustomThemeDialog,
    showImportThemeDialog, setShowImportThemeDialog,
    tempPrimaryColor, setTempPrimaryColor,
    tempSecondaryColor, setTempSecondaryColor,
    importThemeString, setImportThemeString,
    customThemeColors,
    newPlaylistName, setNewPlaylistName,
    colorTheme, setColorTheme,
    playerStyle, setPlayerStyle,
    dynamicTheme, setDynamicTheme,
    playerBgStyle, setPlayerBgStyle,
    thumbnailRadius, setThumbnailRadius,
    dominantColor,
    lyricsProvider, setLyricsProvider,
    lyricsSize, setLyricsSize,
    audioQuality, setAudioQuality,
    autoPlaySimilar, setAutoPlaySimilar,
    autoScrollLyrics, setAutoScrollLyrics,
    lyricsAlignment, setLyricsAlignment,
    lyricsGlass, setLyricsGlass,
    hideCreatorsPicks, setHideCreatorsPicks,
    compactQueue, setCompactQueue,
    autoSwitchToPlayer, setAutoSwitchToPlayer,
    saveSearchHistory, setSaveSearchHistory,
    reduceMotion, setReduceMotion,
    autoOpenLyrics, setAutoOpenLyrics,
    disableAnimations, setDisableAnimations,
    disableBlur, setDisableBlur,
    showTimeRemaining, setShowTimeRemaining,
    showPlaybackSpeed, setShowPlaybackSpeed,
    normalizeVolume, setNormalizeVolume,
    skipSilence, setSkipSilence,
    crossfade, setCrossfade,
    stopAfterCurrent, setStopAfterCurrent,
    dataSaver, setDataSaver,
    privateSession, setPrivateSession,
    showAuthDialog, setShowAuthDialog,
    user,
    email, setEmail,
    password, setPassword,
    isSignUp, setIsSignUp,
    authError, setAuthError,
    displayNameInput, setDisplayNameInput,
    likedSongs,
    savedSongs,
    playlists,
    currentSong,
    activeTheme,
    ALL_THEMES,
    ytParentRef,
    ytPlayerRef,
    lyricsContainerRef,
    lyricsContainerRefMobile,
    searchContainerRef,
    handleSeek,
    playNext,
    playPrevious,
    removeFromQueue,
    toggleLike,
    formatTime,
    getLyricTextClass,
    getLyricAlignWrapperClass,
    getLyricOriginClass,
    addToQueueAndPlay,
    playFromLibrary,
    handleEmailAuth,
    handleGoogleSignIn,
    handleSignOut,
    handleUpdateProfile,
    handleCreatePlaylist,
    addSongToPlaylist,
    handleSaveCustomTheme,
    handleImportTheme,
    handleShare,
    loadArtistView,
    loadAlbumView,
    loadPlaylistView,
  }
}
