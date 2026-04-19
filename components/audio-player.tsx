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
  User as FirebaseUser 
} from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1,
  Search, Shuffle, Repeat, Repeat1, Sun, Moon, Loader2, Music2,
  X, ListMusic, Mic2, MoreVertical, Info, Heart, ChevronDown,
  ChevronUp, ExternalLink, History, Library, UserCircle2, LogOut,
  Maximize, Minimize, Settings, TrendingUp, ListPlus, Disc3, MicVocal,
  ArrowLeft, Palette, LayoutTemplate, CornerUpRight, AudioLines, Plus, Users
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBI-ABs1S7Ln2jJ7xYxgUZwU1nEXZmqI2c",
  authDomain: "ganvotesting.firebaseapp.com",
  projectId: "ganvotesting",
  storageBucket: "ganvotesting.firebasestorage.app",
  messagingSenderId: "1083596663051",
  appId: "1:1083596663051:web:52900f44e84034b7421a0e"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = typeof window !== "undefined" ? getAuth(app) : null;
const db = typeof window !== "undefined" ? getFirestore(app) : null;
const googleProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : null;

interface Song {
  videoId: string
  title: string
  artist: string
  artistId?: string | null
  album: string
  duration: number
  thumbnail: string
}

interface Playlist {
  id: string
  name: string
  songs: Song[]
}

interface LyricLine {
  time: number
  text: string
}

interface LyricsData {
  syncedLyrics: LyricLine[] | null
  plainLyrics: string | null
}

export function AudioPlayer() {
  const [isDark, setIsDark] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
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
  
  const [lyrics, setLyrics] = useState<LyricsData | null>(null)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const [playbackRate, setPlaybackRate] = useState(1)
  const [preservesPitch, setPreservesPitch] = useState(true)
  const [showEffectsDialog, setShowEffectsDialog] = useState(false)

  // Navigation State
  const [mainView, setMainView] = useState<'player' | 'explore' | 'artist' | 'album' | 'playlist'>('explore')
  const [sideView, setSideView] = useState<'queue' | 'lyrics' | 'library'>('queue')
  
  const [isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState(false)
  const [mobilePlayerTab, setMobilePlayerTab] = useState<'player' | 'lyrics' | 'queue'>('player')

  const [exploreData, setExploreData] = useState<{artists: any[], songs: Song[], albums: any[]}>({artists: [], songs: [], albums: []})
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
  const [newPlaylistName, setNewPlaylistName] = useState("")
  
  const [dynamicTheme, setDynamicTheme] = useState(true)
  const [playerBgStyle, setPlayerBgStyle] = useState<'Theme' | 'Gradient' | 'Blur'>('Theme')
  const [lyricsProvider, setLyricsProvider] = useState<'LRCLib' | 'KuGou' | 'Both'>('LRCLib')
  const [thumbnailRadius, setThumbnailRadius] = useState(32)
  const [dominantColor, setDominantColor] = useState<string | null>(null)
  
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

  const audioRef = useRef<HTMLAudioElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const currentSong = queue[currentIndex]

  // CSS Animation for Gradient Background
  useEffect(() => {
    if (typeof document === 'undefined') return
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes dynamic-gradient-move {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-gradient-bg {
        background-size: 200% 200%;
        animation: dynamic-gradient-move 15s ease infinite;
      }
    `;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch(e) {} }
  },[]);

  // Extract Dominant Color
  useEffect(() => {
    if (!currentSong?.thumbnail || playerBgStyle === 'Theme') {
      setDominantColor(null)
      return
    }
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.src = currentSong.thumbnail
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let r = 0, g = 0, b = 0
        for (let i = 0; i < data.length; i += 16) {
          r += data[i]; g += data[i+1]; b += data[i+2];
        }
        const pixels = data.length / 16
        setDominantColor(`rgba(${~~(r/pixels)}, ${~~(g/pixels)}, ${~~(b/pixels)}, 0.4)`)
      } catch(e) { setDominantColor(null) }
    }
  }, [currentSong?.thumbnail, playerBgStyle])

  // Persistence for Audio Effects across track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
      // @ts-ignore
      audioRef.current.preservesPitch = preservesPitch
      // @ts-ignore
      audioRef.current.mozPreservesPitch = preservesPitch
      // @ts-ignore
      audioRef.current.webkitPreservesPitch = preservesPitch
    }
  }, [playbackRate, preservesPitch, audioUrl])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error(err))
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  },[])

  useEffect(() => {
    try {
      const history = localStorage.getItem('ganvo_search_history')
      if (history) setSearchHistory(JSON.parse(history))
    } catch (e) {}

    setIsExploreLoading(true)
    fetch('/api/music/explore')
      .then(res => res.json())
      .then(data => { if (data && !data.error) setExploreData(data) })
      .catch(() => setExploreError(true))
      .finally(() => setIsExploreLoading(false))
  },[])

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
          const localSaved = JSON.parse(localStorage.getItem('ganvo_saved_songs') || '[]')
          const localPlaylists = JSON.parse(localStorage.getItem('ganvo_playlists') || '[]')
          const combinedSaved =[...(data.savedSongs || []), ...localSaved].filter((v,i,a) => a.findIndex(t => (t.videoId === v.videoId)) === i)
          const combinedPlaylists =[...(data.playlists || []), ...localPlaylists].filter((v,i,a) => a.findIndex(t => (t.id === v.id)) === i)
          setSavedSongs(combinedSaved)
          setLikedSongs(new Set(combinedSaved.map((s: Song) => s.videoId)))
          setPlaylists(combinedPlaylists)
          await setDoc(userRef, { savedSongs: combinedSaved, playlists: combinedPlaylists }, { merge: true })
        } else {
          await setDoc(userRef, { savedSongs: [], playlists:[] })
        }
      } else {
        const saved = localStorage.getItem('ganvo_saved_songs')
        const localPlaylists = localStorage.getItem('ganvo_playlists')
        if (saved) {
          const parsed = JSON.parse(saved)
          setSavedSongs(parsed)
          setLikedSongs(new Set(parsed.map((s: Song) => s.videoId)))
        }
        if (localPlaylists) setPlaylists(JSON.parse(localPlaylists))
      }
    })
    return () => unsubscribe()
  },[])

  const syncToCloud = async (newSaved: Song[], newPlaylists: Playlist[]) => {
    localStorage.setItem('ganvo_saved_songs', JSON.stringify(newSaved))
    localStorage.setItem('ganvo_playlists', JSON.stringify(newPlaylists))
    if (user && db) {
      try {
        const userRef = doc(db, "users", user.uid)
        await setDoc(userRef, { savedSongs: newSaved, playlists: newPlaylists }, { merge: true })
      } catch (e) { console.error(e) }
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    if (!email.includes('@')) {
      setAuthError("Invalid email address format.")
      return
    }
    if (!auth) return
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password)
      else await signInWithEmailAndPassword(auth, email, password)
      setShowAuthDialog(false)
    } catch (error: any) {
      setAuthError(error.message.replace("Firebase: ", ""))
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider) return
    try {
      await signInWithPopup(auth, googleProvider)
      setShowAuthDialog(false)
    } catch (error: any) { setAuthError(error.message) }
  }

  const handleSignOut = async () => { if (auth) await signOut(auth) }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: displayNameInput })
        setUser({ ...auth.currentUser }) 
        setShowAccountSettings(false)
      } catch (e) { console.error(e) }
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
  }

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId && !p.songs.find(s => s.videoId === song.videoId)) {
        return { ...p, songs: [...p.songs, song] }
      }
      return p
    })
    setPlaylists(updatedPlaylists)
    syncToCloud(savedSongs, updatedPlaylists)
  }

  const loadArtistView = async (artistId: string) => {
    setIsArtistLoading(true)
    setMainView('artist')
    setCurrentArtistData(null)
    setIsMobilePlayerExpanded(false)
    try {
      const res = await fetch(`/api/music/artist/${artistId}`)
      const data = await res.json()
      if (data && !data.error) setCurrentArtistData(data)
    } catch (e) { console.error(e) } 
    finally { setIsArtistLoading(false) }
  }

  const loadAlbumView = async (albumId: string) => {
    setIsAlbumLoading(true)
    setMainView('album')
    setCurrentAlbumData(null)
    setIsMobilePlayerExpanded(false)
    try {
      const res = await fetch(`/api/music/album/${albumId}`)
      const data = await res.json()
      if (data && !data.error) setCurrentAlbumData(data)
    } catch (e) { console.error(e) } 
    finally { setIsAlbumLoading(false) }
  }

  const loadPlaylistView = (playlist: Playlist) => {
    setCurrentPlaylistView(playlist)
    setMainView('playlist')
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
        setSearchResults(data.results ||[])
      } catch (error) { console.error(error) } 
      finally { setIsSearching(false) }
    }, 300)
  }, [searchQuery])

  const addToQueueAndPlay = async (song: Song) => {
    const saveSearchStr = searchQuery || song.title
    if (saveSearchStr.trim()) {
      const newHistory =[saveSearchStr, ...searchHistory.filter(q => q !== saveSearchStr)].slice(0, 15)
      setSearchHistory(newHistory)
      localStorage.setItem('ganvo_search_history', JSON.stringify(newHistory))
    }
    const existingIndex = queue.findIndex((s) => s.videoId === song.videoId)
    if (existingIndex >= 0) setCurrentIndex(existingIndex)
    else {
      setQueue((prev) => [...prev, song])
      setCurrentIndex(queue.length)
    }
    setSearchResults([])
    setSearchQuery("")
    setIsSearchExpanded(false)
    setSearchFocused(false)
    setMainView('player') 
    setSideView('queue')
  }

  const playFromLibrary = (song: Song) => addToQueueAndPlay(song)

  useEffect(() => {
    if (!currentSong) return
    const loadStream = async () => {
      setIsLoading(true)
      setAudioUrl(null)
      setLoadError(null)
      try {
        const response = await fetch(`/api/music/stream/${currentSong.videoId}`)
        const data = await response.json()
        if (data.error) setLoadError(data.error)
        else if (data.audioUrl) setAudioUrl(data.audioUrl)
      } catch (error) { setLoadError("Failed to fetch stream.") } 
      finally { setIsLoading(false) }
    }
    loadStream()
  }, [currentSong?.videoId])

  useEffect(() => {
    if (!currentSong) return
    const loadLyrics = async () => {
      setLyrics(null)
      setCurrentLyricIndex(-1)
      try {
        const params = new URLSearchParams({
          track: currentSong.title, artist: currentSong.artist, provider: lyricsProvider,
          ...(currentSong.album && { album: currentSong.album }),
          ...(currentSong.duration && { duration: String(currentSong.duration) }),
        })
        const res = await fetch(`/api/lyrics?${params}`)
        const data = await res.json()
        if (data.syncedLyrics || data.plainLyrics) setLyrics({ syncedLyrics: data.syncedLyrics, plainLyrics: data.plainLyrics })
      } catch (e) {}
    }
    loadLyrics()
  }, [currentSong?.videoId, lyricsProvider])

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.load()
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  },[audioUrl])

  useEffect(() => {
    if (!lyrics?.syncedLyrics) return
    const lyric = lyrics.syncedLyrics.findLast((l) => l.time <= currentTime)
    const index = lyric ? lyrics.syncedLyrics.indexOf(lyric) : -1
    if (index !== currentLyricIndex) {
      setCurrentLyricIndex(index)
      if (index >= 0) {
        setTimeout(() => {
          const lines = document.querySelectorAll('.lyric-active-line');
          lines.forEach(l => {
            const container = l.closest('.lyrics-scroll-container') as HTMLElement;
            if (container && l instanceof HTMLElement) {
              const scrollPos = l.offsetTop - (container.clientHeight / 2) + (l.clientHeight / 2);
              container.scrollTo({ top: scrollPos, behavior: 'smooth' });
            }
          })
        }, 50)
      }
    }
  },[currentTime, lyrics, currentLyricIndex])

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !audioUrl) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play().catch(() => {})
    setIsPlaying(!isPlaying)
  }, [isPlaying, audioUrl])

  const playNext = useCallback(() => {
    if (queue.length === 0) return
    let ni = shuffle ? Math.floor(Math.random() * queue.length) : (currentIndex + 1) % queue.length
    if (ni === 0 && repeatMode === "off" && !shuffle) { setIsPlaying(false); return }
    setCurrentIndex(ni)
  }, [queue.length, currentIndex, shuffle, repeatMode])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return
    if (currentTime > 3 && audioRef.current) { audioRef.current.currentTime = 0; return }
    setCurrentIndex((currentIndex - 1 + queue.length) % queue.length)
  },[queue.length, currentIndex, currentTime])

  const handleSeek = (val: number[]) => { if (audioRef.current) { audioRef.current.currentTime = val[0]; setCurrentTime(val[0]) } }
  const handleVolumeChange = (val: number[]) => { setVolume(val[0]); if (audioRef.current) audioRef.current.volume = val[0] / 100 }
  const toggleMute = () => { setIsMuted(!isMuted); if (audioRef.current) audioRef.current.volume = isMuted ? volume/100 : 0 }
  const removeFromQueue = (idx: number) => setQueue(prev => prev.filter((_, i) => i !== idx))

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2
  const showSearchDropdown = searchFocused && (searchResults.length > 0 || isSearching || (searchQuery.trim() === "" && searchHistory.length > 0))

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background transition-colors duration-500 font-sans relative z-0">
      
      {/* Background Modes */}
      {playerBgStyle === 'Gradient' && dominantColor && (
        <div className="absolute inset-0 z-[-1] animate-gradient-bg opacity-40" style={{ backgroundImage: `radial-gradient(circle at center, ${dominantColor} 0%, transparent 80%)` }} />
      )}
      {playerBgStyle === 'Blur' && currentSong && (
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <img src={currentSong.thumbnail} className="w-full h-full object-cover blur-[100px] opacity-30 transition-all duration-1000" />
        </div>
      )}

      {/* Header */}
      <header className="elevation-1 z-40 flex h-16 flex-shrink-0 items-center justify-between px-3 md:px-6 transition-all duration-500 relative bg-background/90 backdrop-blur-xl border-b border-border/40 gap-4">
        <div className={cn(
          "flex items-center shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-left overflow-hidden min-w-fit", 
          searchFocused ? "w-0 opacity-0 md:w-auto md:opacity-100" : "w-auto opacity-100 gap-3"
        )}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground shadow-md transition-transform hover:scale-110">
            <Music2 className="h-5 w-5 text-background fill-current" />
          </div>
          <div className="hidden sm:flex items-baseline gap-1 mr-4">
            <span className="text-xl font-normal text-muted-foreground tracking-tight">Ganvo</span>
            <span className="text-xl font-bold tracking-tight text-foreground">Music</span>
          </div>
        </div>

        {/* Search */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-2xl mx-auto w-full">
          <div className="relative flex items-center bg-muted/80 rounded-full transition-all duration-500 focus-within:bg-card focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary h-11 md:h-12 overflow-hidden">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground transition-colors" />
              <Input
                type="text" placeholder="Search..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)}
                className="h-full w-full border-0 bg-transparent pl-12 pr-10 text-base shadow-none outline-none focus-visible:ring-0 text-foreground"
              />
              {searchQuery && (
                <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(""); setSearchResults([]) }} className="absolute right-2 h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"><X className="h-4 w-4 text-current" /></Button>
              )}
            </div>
          </div>

          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full z-[60] mt-3 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              <div className={cn("flex-1 overflow-y-auto min-h-0 overscroll-contain transition-all duration-500", isSearchExpanded ? "max-h-[70vh]" : "max-h-[400px]")}>
                <div className="p-2">
                  {searchQuery.trim() === "" ? (
                    <div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Recent</span>
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setSearchHistory([]); localStorage.removeItem('ganvo_search_history') }} className="text-xs font-medium text-primary">Clear</button>
                      </div>
                      {searchHistory.map((h, i) => (
                        <button key={i} onMouseDown={(e) => e.preventDefault()} onClick={() => setSearchQuery(h)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-muted text-foreground"><History className="h-4 w-4 opacity-70" />{h}</button>
                      ))}
                    </div>
                  ) : isSearching && searchResults.length === 0 ? (
                    <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : (
                    searchResults.slice(0, isSearchExpanded ? undefined : 6).map((s, i) => (
                      <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToQueueAndPlay(s) }} className="song-card active:scale-[0.98] flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-secondary/60 text-foreground">
                        <img src={s.thumbnail} className="aspect-square h-12 w-12 rounded-lg object-cover shadow-sm" />
                        <div className="flex-1 overflow-hidden"><p className="truncate font-medium">{s.title}</p><p className="truncate text-xs text-muted-foreground mt-0.5">{s.artist}</p></div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              {searchQuery.trim() !== "" && searchResults.length > 6 && (
                <div className="border-t bg-card/80 p-2"><Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => setIsSearchExpanded(!isSearchExpanded)} className="w-full text-foreground">{isSearchExpanded ? 'Show less' : `Show all ${searchResults.length} results`}</Button></div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="hidden sm:flex h-10 w-10 rounded-full text-foreground hover:scale-110 active:scale-90"><Maximize className="h-5 w-5 text-current" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="h-10 w-10 rounded-full text-foreground hover:scale-110 active:scale-90">{isDark ? <Sun className="h-5 w-5 text-current" /> : <Moon className="h-5 w-5 text-current" />}</Button>
          <Button variant="ghost" size="icon" onClick={() => setShowAuthDialog(true)} className="h-10 w-10 rounded-full text-foreground active:scale-90">
            {user ? <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs uppercase">{user.displayName?.charAt(0) || "U"}</div> : <UserCircle2 className="h-5 w-5 text-current" />}
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden min-h-0 bg-transparent relative">
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0 z-10 pb-40 lg:pb-0 transition-all duration-500 ease-out">
          
          {/* Explore */}
          {mainView === 'explore' ? (
             <div className="p-6 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
               <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8 text-foreground">Explore</h2>
               {isExploreLoading ? <div className="py-32 flex flex-col items-center"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /><p className="font-bold text-muted-foreground">Discovering Music...</p></div> : (
                 <div className="space-y-12 pb-20">
                   <div>
                     <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground"><UserCircle2 className="h-6 w-6 text-primary"/> Top Artists</h3>
                     <div className="flex overflow-x-auto gap-6 no-scrollbar pb-4 -my-2 px-1">
                        {exploreData.artists.map((a, i) => (
                          <div key={i} onClick={() => loadArtistView(a.artistId)} className="group cursor-pointer snap-start w-32 sm:w-40 shrink-0 text-center">
                            <div className="relative aspect-square rounded-full overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-105 active:scale-95 mb-3"><img src={a.thumbnail} className="w-full h-full object-cover" /></div>
                            <p className="font-bold text-sm truncate text-foreground">{a.name}</p>
                          </div>
                        ))}
                     </div>
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground"><TrendingUp className="h-6 w-6 text-primary"/> Top Songs</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {exploreData.songs.slice(0, 9).map((s, i) => (
                          <div key={i} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-muted bg-card shadow-sm border text-foreground">
                            <img src={s.thumbnail} className="aspect-square h-14 w-14 rounded-xl object-cover shadow-sm" />
                            <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{s.title}</p><p className="text-xs font-medium text-muted-foreground truncate">{s.artist}</p></div>
                            <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(s)} className="rounded-full h-10 w-10 text-foreground"><Play className="h-5 w-5 fill-current text-current translate-x-[1px]"/></Button>
                          </div>
                        ))}
                     </div>
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground"><Disc3 className="h-6 w-6 text-primary"/> Top Albums</h3>
                     <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 -my-2 px-1">
                        {exploreData.albums.map((a, i) => (
                          <div key={i} onClick={() => loadAlbumView(a.albumId)} className="flex flex-col gap-3 w-40 sm:w-48 shrink-0 group cursor-pointer snap-start">
                            <div className="aspect-square overflow-hidden rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-500"><img src={a.thumbnail} className="w-full h-full object-cover" /></div>
                            <p className="font-bold text-sm truncate text-foreground group-hover:text-primary">{a.title}</p>
                          </div>
                        ))}
                     </div>
                   </div>
                 </div>
               )}
             </div>
          ) : mainView === 'artist' && currentArtistData ? (
             <div className="p-4 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-700">
                <Button variant="ghost" onClick={() => setMainView('explore')} className="mb-6 gap-2 font-bold text-muted-foreground hover:text-foreground text-foreground"><ArrowLeft className="h-4 w-4 text-current" /> Back</Button>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 p-6 bg-card/50 rounded-[2.5rem] border backdrop-blur-sm text-foreground">
                  <img src={currentArtistData.thumbnails?.[currentArtistData.thumbnails.length-1]?.url} className="aspect-square w-48 h-48 rounded-full object-cover shadow-xl" />
                  <div className="text-center md:text-left flex-1"><h1 className="text-4xl md:text-6xl font-black mb-2">{currentArtistData.name}</h1><p className="text-lg font-semibold text-muted-foreground">{currentArtistData.subscribers}</p></div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-foreground">Top Songs</h3>
                <div className="space-y-1 mb-12 bg-card p-4 rounded-[2rem] border text-foreground">
                  {currentArtistData.topSongs.map((s: any, i: number) => (
                    <div key={i} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-muted transition-colors">
                      <span className="w-6 text-center font-bold text-muted-foreground/50">{i + 1}</span>
                      <img src={s.thumbnail} className="aspect-square h-12 w-12 rounded-xl object-cover shadow-sm" />
                      <div className="flex-1 overflow-hidden"><p className="font-bold text-sm truncate">{s.title}</p></div>
                      <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(s)} className="rounded-full h-10 w-10 text-foreground"><Play className="h-5 w-5 fill-current text-current translate-x-[1px]"/></Button>
                    </div>
                  ))}
                </div>
                {currentArtistData.albums?.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 text-foreground">Albums</h3>
                    <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 px-1">
                      {currentArtistData.albums.map((a: any, i: number) => (
                        <div key={i} onClick={() => loadAlbumView(a.albumId)} className="w-40 sm:w-48 shrink-0 cursor-pointer group"><img src={a.thumbnail} className="aspect-square rounded-2xl mb-3 shadow-md group-hover:scale-105 transition-transform"/><p className="font-bold text-sm truncate text-foreground">{a.title}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {currentArtistData.singles?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-6 text-foreground">Singles & EPs</h3>
                    <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 px-1">
                      {currentArtistData.singles.map((a: any, i: number) => (
                        <div key={i} onClick={() => loadAlbumView(a.albumId)} className="w-40 sm:w-48 shrink-0 cursor-pointer group"><img src={a.thumbnail} className="aspect-square rounded-2xl mb-3 shadow-md group-hover:scale-105 transition-transform"/><p className="font-bold text-sm truncate text-foreground">{a.title}</p></div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          ) : mainView === 'album' && currentAlbumData ? (
             <div className="p-4 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500 text-foreground">
                <Button variant="ghost" onClick={() => setMainView('explore')} className="mb-6 gap-2 font-bold text-muted-foreground hover:text-foreground text-foreground"><ArrowLeft className="h-4 w-4 text-current" /> Back</Button>
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12 p-6 bg-card/50 rounded-[2.5rem] border">
                  <img src={currentAlbumData.thumbnail} className="aspect-square w-48 h-48 rounded-[2rem] object-cover shadow-xl" />
                  <div className="text-center md:text-left flex-1"><h1 className="text-4xl font-black mb-1">{currentAlbumData.name}</h1><p className="text-lg font-semibold text-muted-foreground">{currentAlbumData.artist} • {currentAlbumData.year}</p></div>
                </div>
                <div className="bg-card p-4 rounded-[2rem] border space-y-1">
                  {currentAlbumData.songs.map((s: any, i: number) => (
                    <div key={i} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-muted cursor-pointer" onClick={() => addToQueueAndPlay(s)}>
                      <span className="w-6 text-center font-bold text-muted-foreground/50">{i + 1}</span>
                      <p className="font-bold text-sm truncate flex-1">{s.title}</p>
                    </div>
                  ))}
                </div>
             </div>
          ) : mainView === 'playlist' && currentPlaylistView ? (
             <div className="p-4 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500 text-foreground">
                <Button variant="ghost" onClick={() => setMainView('explore')} className="mb-6 gap-2 font-bold text-muted-foreground hover:text-foreground text-foreground"><ArrowLeft className="h-4 w-4 text-current" /> Back</Button>
                <h1 className="text-5xl font-black mb-8">{currentPlaylistView.name}</h1>
                <div className="bg-card p-4 rounded-[2rem] border space-y-1">
                  {currentPlaylistView.songs.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-muted cursor-pointer" onClick={() => addToQueueAndPlay(s)}>
                       <img src={s.thumbnail} className="aspect-square w-12 rounded-xl object-cover shadow-sm" />
                       <div className="flex-1 overflow-hidden"><p className="font-bold text-sm truncate">{s.title}</p></div>
                    </div>
                  ))}
                </div>
             </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <div className="max-w-xs"><Music2 className="h-20 w-20 text-muted-foreground/40 mx-auto mb-6"/><h2 className="text-3xl font-black text-foreground mb-3">Discovery Mode</h2><p className="text-muted-foreground font-medium">Find your next favorite song in the Explore tab or Search bar.</p></div>
            </div>
          )}
        </div>

        {/* Sidebar Desktop */}
        <div className="hidden w-80 flex-col border-l border-border/40 bg-card/40 backdrop-blur-2xl lg:flex xl:w-[420px] overflow-hidden min-h-0 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-20 transition-all duration-500">
          <div className="flex p-3 gap-2 bg-muted/20 border-b border-border/40 flex-wrap">
            {['explore', 'queue', 'lyrics', 'library'].map((tab) => (
              <button key={tab} onClick={() => { if (tab==='explore') setMainView('explore'); setSideView(tab as any); }} className={cn("flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-500 active:scale-95 flex-1", sideView === tab ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                {tab === 'explore' && <TrendingUp className="h-4 w-4 text-current" />}
                {tab === 'queue' && <ListMusic className="h-4 w-4 text-current" />}
                {tab === 'lyrics' && <Mic2 className="h-4 w-4 text-current" />}
                {tab === 'library' && <Library className="h-4 w-4 text-current" />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain transition-all duration-500">
            {sideView === 'lyrics' ? (
              <div className="h-full overflow-y-auto no-scrollbar scroll-smooth lyrics-scroll-container pb-32">
                {lyrics?.syncedLyrics ? (
                  <div className="space-y-5 p-6">
                    {lyrics.syncedLyrics.map((l, i) => (
                      <p key={i} onClick={() => { if (audioRef.current) audioRef.current.currentTime = l.time }} className={cn("lyric-line transition-all duration-500 ease-out cursor-pointer rounded-2xl px-4 py-3 text-lg font-bold leading-relaxed text-center", i === currentLyricIndex ? "lyric-active-line scale-[1.05] bg-primary/10 text-primary shadow-sm" : "text-muted-foreground/70 hover:bg-muted hover:text-foreground scale-95")}>{l.text}</p>
                    ))}
                  </div>
                ) : lyrics?.plainLyrics ? (
                  <div className="p-6 text-center text-foreground"><p className="text-xs font-black uppercase text-primary mb-4 tracking-widest">Couldn't find timed lyrics</p><p className="whitespace-pre-wrap leading-relaxed font-medium">{lyrics.plainLyrics}</p></div>
                ) : <div className="flex flex-col items-center justify-center h-full p-6 text-center text-foreground"><Mic2 className="h-10 w-10 text-muted-foreground/40 mb-6" /><p className="font-extrabold text-xl">No lyrics found</p></div>}
              </div>
            ) : sideView === 'library' ? (
               <div className="p-4 space-y-6 pb-32 text-foreground">
                  <div>
                    <div className="mb-4 px-2 flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><ListPlus className="h-5 w-5 text-current"/> Playlists</h3><Button variant="secondary" size="sm" onClick={() => setShowPlaylistDialog(true)} className="rounded-xl font-bold text-foreground">New</Button></div>
                    {playlists.map(p => (
                      <div key={p.id} onClick={() => loadPlaylistView(p)} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted transition-colors cursor-pointer mb-2"><div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><ListMusic className="h-5 w-5 text-current"/></div><div><p className="font-bold text-sm">{p.name}</p><p className="text-xs font-medium text-muted-foreground">{p.songs.length} songs</p></div></div>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg px-2 mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-[var(--google-red)] fill-current"/> Liked Songs</h3>
                    {savedSongs.map((s, i) => (
                      <div key={i} className="group flex items-center gap-3 rounded-2xl p-2 transition-all hover:bg-muted">
                        <button onClick={() => playFromLibrary(s)} className="flex-1 flex items-center gap-3 text-left"><img src={s.thumbnail} className="aspect-square w-12 rounded-xl object-cover" /><div className="flex-1 overflow-hidden"><p className="truncate text-sm font-bold">{s.title}</p></div></button>
                        <Button variant="ghost" size="icon" onClick={() => toggleLike(s)} className="text-[var(--google-red)]"><Heart className="h-4 w-4 fill-current text-current"/></Button>
                      </div>
                    ))}
                  </div>
               </div>
            ) : (
              <div className="p-3 space-y-2 pb-32">
                {queue.map((s, i) => (
                  <div key={i} className={cn("group flex items-center gap-3 rounded-2xl p-2 transition-all hover:bg-muted/80 text-foreground", i === currentIndex ? "bg-primary/5 border border-primary/10" : "")}>
                    <button onClick={() => setCurrentIndex(i)} className="flex-1 flex items-center gap-4 text-left"><img src={s.thumbnail} className="aspect-square h-14 w-14 rounded-xl object-cover" /><div className="flex-1 overflow-hidden"><p className="truncate text-sm font-bold">{s.title}</p><p className="truncate text-xs font-semibold text-muted-foreground mt-0.5">{s.artist}</p></div></button>
                    <Button variant="ghost" size="icon" onClick={() => removeFromQueue(i)} className="text-destructive"><X className="h-4 w-4 text-current" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Mobile Player */}
      <div 
        className={cn(
          "fixed inset-0 z-[500] bg-background flex flex-col transition-transform duration-500 ease-out lg:hidden",
          isMobilePlayerExpanded ? "translate-y-0" : "translate-y-[100%]"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMobilePlayerExpanded(false)} className="h-12 w-12 rounded-full text-foreground"><ChevronDown className="h-8 w-8 text-current" /></Button>
          <div className="flex bg-muted/50 rounded-full p-1 gap-1">
            <Button variant={mobilePlayerTab === 'player' ? 'default' : 'ghost'} size="sm" onClick={() => setMobilePlayerTab('player')} className="rounded-full px-4 font-bold text-xs text-foreground">Player</Button>
            <Button variant={mobilePlayerTab === 'lyrics' ? 'default' : 'ghost'} size="sm" onClick={() => setMobilePlayerTab('lyrics')} className="rounded-full px-4 font-bold text-xs text-foreground">Lyrics</Button>
            <Button variant={mobilePlayerTab === 'queue' ? 'default' : 'ghost'} size="sm" onClick={() => setMobilePlayerTab('queue')} className="rounded-full px-4 font-bold text-xs text-foreground">Queue</Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowPlayerSettings(true)} className="h-12 w-12 rounded-full text-foreground"><MoreVertical className="h-6 w-6 text-current" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 relative px-6 pb-6 pt-4 flex flex-col">
          {mobilePlayerTab === 'player' && currentSong && (
            <div className="flex flex-col items-center h-full flex-1 justify-center">
              <div className="aspect-square w-full max-w-[320px] mx-auto overflow-hidden shadow-2xl relative mb-8" style={{ borderRadius: `${thumbnailRadius}px` }}>
                 <img src={currentSong.thumbnail} className={cn("w-full h-full object-cover transition-transform duration-[2s]", isPlaying ? "scale-105" : "scale-100")} />
                 {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md"><Loader2 className="h-12 w-12 animate-spin text-white" /></div>}
              </div>
              <div className="w-full flex items-center justify-between gap-4 mb-6">
                 <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-extrabold truncate text-foreground mb-1">{currentSong.title}</h2>
                    <button onClick={() => currentSong.artistId && loadArtistView(currentSong.artistId)} className="text-lg font-semibold text-muted-foreground truncate hover:text-primary">{currentSong.artist}</button>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => toggleLike(currentSong)} className="h-14 w-14 rounded-full text-foreground"><Heart className={cn("h-8 w-8 transition-all", likedSongs.has(currentSong.videoId) ? "fill-[var(--google-red)] text-[var(--google-red)]" : "text-current")} /></Button>
              </div>
              <div className="w-full mb-8">
                <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="mb-4 [&_[data-slot=thumb]]:h-5[&_[data-slot=thumb]]:w-5" />
                <div className="flex justify-between text-sm font-bold text-muted-foreground"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
              </div>
              <div className="flex items-center justify-between w-full mb-8 px-2">
                <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("h-12 w-12 rounded-full", shuffle && "bg-primary/20 text-primary")}><Shuffle className="h-6 w-6 text-current" /></Button>
                <Button variant="ghost" size="icon" onClick={playPrevious} className="h-16 w-16 rounded-full text-foreground"><SkipBack className="h-8 w-8 fill-current text-current" /></Button>
                <Button onClick={togglePlay} className="h-20 w-20 rounded-[2.5rem] bg-primary text-primary-foreground shadow-xl active:scale-95 flex items-center justify-center">{isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current translate-x-1" />}</Button>
                <Button variant="ghost" size="icon" onClick={playNext} className="h-16 w-16 rounded-full text-foreground"><SkipForward className="h-8 w-8 fill-current text-current" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off")} className={cn("h-12 w-12 rounded-full", repeatMode !== "off" && "bg-primary/20 text-primary")}>{repeatMode === "one" ? <Repeat1 className="h-6 w-6 text-current" /> : <Repeat className="h-6 w-6 text-current" />}</Button>
              </div>
              <div className="flex w-full items-center justify-between gap-3 px-2">
                <div className="flex flex-1 items-center gap-3 rounded-2xl bg-muted/60 backdrop-blur-sm px-4 py-3 text-foreground"><Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 text-foreground"><VolumeIcon className="h-5 w-5 text-current" /></Button><Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1 [&_[data-slot=thumb]]:h-4" /><span className="w-8 flex-shrink-0 text-right text-xs font-bold">{isMuted ? 0 : volume}%</span></div>
                <Button variant="secondary" size="icon" onClick={() => setShowEffectsDialog(true)} className="h-12 w-12 rounded-2xl text-foreground shadow-sm flex items-center justify-center"><AudioLines className="h-5 w-5 text-current" /></Button>
              </div>
            </div>
          )}
          {mobilePlayerTab === 'lyrics' && (
             <div className="h-full overflow-y-auto no-scrollbar scroll-smooth lyrics-scroll-container pb-32">
                {lyrics?.syncedLyrics ? (
                  <div className="space-y-6 py-10">
                    {lyrics.syncedLyrics.map((l, i) => (
                      <p key={i} onClick={() => { if (audioRef.current) audioRef.current.currentTime = l.time }} className={cn("lyric-line transition-all duration-500 cursor-pointer rounded-3xl px-6 py-4 text-2xl font-extrabold text-center", i === currentLyricIndex ? "lyric-active-line bg-primary/10 text-primary shadow-sm" : "text-muted-foreground/30 scale-95")}>{l.text}</p>
                    ))}
                  </div>
                ) : <div className="flex flex-col items-center justify-center h-full text-foreground"><Mic2 className="h-16 w-16 text-muted-foreground/40 mb-6" /><p className="font-extrabold text-2xl">No lyrics found</p></div>}
             </div>
          )}
          {mobilePlayerTab === 'queue' && (
             <div className="h-full overflow-y-auto pb-32 text-foreground">
                <h3 className="font-extrabold text-2xl mb-6 flex items-center gap-3"><ListMusic className="text-primary"/> Up Next</h3>
                <div className="space-y-3">
                  {queue.map((s, i) => (
                    <div key={i} className={cn("group flex items-center gap-4 rounded-2xl p-3 bg-muted/40", i === currentIndex ? "border-primary/50 border shadow-lg" : "")}><button onClick={() => setCurrentIndex(i)} className="flex-1 flex items-center gap-4 text-left"><img src={s.thumbnail} className="h-16 w-16 aspect-square rounded-xl object-cover shadow-sm" /><div className="flex-1"><p className="truncate text-base font-bold">{s.title}</p></div></button><Button variant="ghost" size="icon" onClick={() => removeFromQueue(i)} className="h-12 w-12 rounded-full text-destructive"><X className="h-5 w-5 text-current" /></Button></div>
                  ))}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Mini Player Mobile (Always visible across tabs unless expanded) */}
      {currentSong && !isMobilePlayerExpanded && (
        <div className="fixed bottom-4 left-4 right-4 z-[100] transition-all duration-500 lg:hidden">
          <div onClick={() => setIsMobilePlayerExpanded(true)} className="flex items-center gap-3 rounded-[2rem] bg-card/95 p-2.5 backdrop-blur-xl border border-border/50 shadow-2xl cursor-pointer text-foreground">
            <img src={currentSong.thumbnail} className="aspect-square h-14 w-14 rounded-[1.25rem] object-cover shadow-sm" />
            <div className="flex-1 overflow-hidden px-1"><p className="truncate text-sm font-extrabold">{currentSong.title}</p><p className="truncate text-xs font-semibold text-muted-foreground">{currentSong.artist}</p></div>
            <Button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong) }} variant="ghost" size="icon" className="h-12 w-12 rounded-full text-foreground"><Heart className={cn("h-5 w-5", likedSongs.has(currentSong.videoId) ? "fill-current text-[var(--google-red)]" : "text-current")} /></Button>
            <Button onClick={(e) => { e.stopPropagation(); togglePlay() }} disabled={isLoading || !audioUrl} className={cn("h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.5rem] shadow-lg", isPlaying ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current translate-x-[1px]" />}</Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={showEffectsDialog} onOpenChange={setShowEffectsDialog}><DialogContent className="rounded-[2rem] p-8 border-0 shadow-2xl bg-background !z-[600] outline-none text-foreground"><DialogHeader><DialogTitle className="text-2xl font-extrabold flex items-center gap-3"><AudioLines className="h-6 w-6 text-primary"/> Audio Effects</DialogTitle></DialogHeader><div className="space-y-8 mt-6"><div className="space-y-4"><div className="flex justify-between"><label className="text-sm font-bold">Playback Speed</label><span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full">{playbackRate.toFixed(2)}x</span></div><Slider value={[playbackRate]} min={0.5} max={2.0} step={0.05} onValueChange={(v) => setPlaybackRate(v[0])} /></div><div className="flex justify-between p-4 bg-muted/30 rounded-2xl"><div><span className="font-bold block">Preserve Pitch</span><span className="text-xs font-medium text-muted-foreground">Toggle for Nightcore mode</span></div><Switch checked={preservesPitch} onCheckedChange={setPreservesPitch} /></div><Button onClick={() => {setPlaybackRate(1); setPreservesPitch(true)}} variant="secondary" className="w-full h-12 rounded-xl font-bold">Reset</Button></div></DialogContent></Dialog>

      <Dialog open={showPlayerSettings} onOpenChange={setShowPlayerSettings}><DialogContent className="rounded-[2rem] p-0 border-0 shadow-2xl bg-background !z-[600] outline-none overflow-hidden text-foreground"><div className="flex items-center gap-4 p-5 border-b bg-card/50 backdrop-blur-sm"><Button variant="ghost" size="icon" onClick={() => setShowPlayerSettings(false)}><ArrowLeft className="w-6 h-6" /></Button><h2 className="text-xl font-bold">Appearance</h2></div><div className="p-4 space-y-6"><div className="space-y-2"><h3 className="text-xs font-bold text-primary uppercase ml-2 mb-2 tracking-widest">Theme</h3><div className="flex justify-between p-3 bg-muted/20 rounded-2xl items-center"><div className="flex gap-4 items-center"><Palette className="w-5 h-5"/><span>Dynamic Theme</span></div><Switch checked={dynamicTheme} onCheckedChange={setDynamicTheme} /></div><div className="flex justify-between p-3 bg-muted/20 rounded-2xl items-center cursor-pointer" onClick={() => setIsDark(!isDark)}><div className="flex gap-4 items-center"><Moon className="w-5 h-5"/><span>Dark theme: {isDark ? 'On' : 'Off'}</span></div></div></div><div className="space-y-2"><h3 className="text-xs font-bold text-primary uppercase ml-2 mb-2 tracking-widest">Player</h3><div className="flex justify-between p-3 bg-muted/20 rounded-2xl items-center"><div className="flex gap-4 items-center"><LayoutTemplate className="w-5 h-5"/><span>Background Style</span></div><select value={playerBgStyle} onChange={(e) => setPlayerBgStyle(e.target.value as any)} className="bg-muted text-sm font-bold rounded-lg px-2 py-1 outline-none border-none"><option value="Theme">Follow Theme</option><option value="Gradient">Gradient</option><option value="Blur">Blur</option></select></div><div className="p-3 bg-muted/20 rounded-2xl space-y-3"><div className="flex justify-between items-center"><div className="flex gap-4 items-center"><CornerUpRight className="w-5 h-5"/><span>Corner Radius</span></div><span className="text-xs font-bold">{thumbnailRadius}px</span></div><Slider value={[thumbnailRadius]} min={0} max={32} step={2} onValueChange={(v) => setThumbnailRadius(v[0])} /></div><div className="flex justify-between p-3 bg-muted/20 rounded-2xl items-center"><div className="flex gap-4 items-center"><MicVocal className="w-5 h-5"/><span>Provider</span></div><select value={lyricsProvider} onChange={(e) => setLyricsProvider(e.target.value as any)} className="bg-muted text-sm font-bold rounded-lg px-2 py-1 outline-none border-none"><option value="LRCLib">LRCLib</option><option value="KuGou">KuGou</option><option value="Both">Both</option></select></div></div></div></DialogContent></Dialog>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[2rem] sm:max-w-md p-8 border-0 shadow-2xl bg-background !z-[600] outline-none text-foreground text-center">
          <div className="mb-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary"><UserCircle2 className="h-10 w-10 text-current" /></div></div>
          <DialogTitle className="text-2xl font-extrabold tracking-tight">Account Sync</DialogTitle>
          <form onSubmit={handleEmailAuth} className="space-y-4 mt-6">
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="h-14 rounded-2xl bg-muted/50 border-transparent px-4 text-foreground text-center font-bold" />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="h-14 rounded-2xl bg-muted/50 border-transparent px-4 text-foreground text-center font-bold" />
            {authError && <p className="text-sm font-bold text-destructive bg-destructive/10 p-3 rounded-xl animate-in slide-in-from-top-1">{authError}</p>}
            <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-primary-foreground shadow-lg active:scale-95">{isSignUp ? "Sign Up" : "Sign In"}</Button>
            <div className="flex items-center gap-2 py-2"><div className="flex-1 h-px bg-border"></div><span className="text-xs font-bold text-muted-foreground">OR</span><div className="flex-1 h-px bg-border"></div></div>
            <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full h-14 rounded-2xl font-bold active:scale-95 flex items-center justify-center gap-3"><Users className="h-4 w-4" /> Google Login</Button>
            <p className="text-sm font-bold text-primary mt-4 cursor-pointer hover:underline" onClick={() => {setIsSignUp(!isSignUp); setAuthError("")}}>{isSignUp ? "Have an account? Sign in" : "Need an account? Sign up"}</p>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}><DialogContent className="rounded-[2rem] p-8 border-0 bg-background !z-[600] text-foreground"><DialogTitle className="text-2xl font-extrabold mb-6">Account Details</DialogTitle><form onSubmit={handleUpdateProfile} className="space-y-6"><div className="space-y-2"><label className="text-sm font-bold ml-1 text-muted-foreground">Name</label><Input value={displayNameInput} onChange={e => setDisplayNameInput(e.target.value)} className="h-14 rounded-2xl bg-muted/50 border-transparent font-bold px-4" /></div><Button type="submit" className="w-full h-14 rounded-2xl font-bold text-primary-foreground shadow-lg">Save Changes</Button></form></DialogContent></Dialog>
      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}><DialogContent className="rounded-[2rem] p-8 border-0 bg-background !z-[600] text-foreground"><DialogTitle className="text-2xl font-extrabold mb-6">New Playlist</DialogTitle><form onSubmit={handleCreatePlaylist} className="space-y-6"><Input value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} placeholder="Playlist Name" required className="h-14 rounded-2xl bg-muted/50 border-transparent font-bold px-4" /><Button type="submit" className="w-full h-14 rounded-2xl font-bold text-primary-foreground shadow-lg">Create</Button></form></DialogContent></Dialog>
      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}><DialogContent className="rounded-[2rem] p-8 border-0 bg-background !z-[600] text-foreground text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mx-auto mb-4"><Music2 className="h-8 w-8 text-primary-foreground fill-current" /></div><DialogTitle className="text-2xl font-black">Ganvo Music 1.0.0</DialogTitle><p className="text-muted-foreground mt-4 font-medium">A high-fidelity web player for YouTube Music built with MD3 principles.</p></DialogContent></Dialog>
    </div>
  )
}
