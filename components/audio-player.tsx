"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, User as FirebaseUser 
} from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  Search, Sun, Moon, Loader2, Music2,
  X, ListMusic, Mic2, MoreVertical, Info, Heart, ChevronDown,
  ChevronUp, ExternalLink, History, Library, UserCircle2, LogOut,
  Maximize, Minimize, Settings, TrendingUp, ListPlus, Disc3, MicVocal,
  ArrowLeft, Palette, LayoutTemplate, CornerUpRight, Type, Star, 
  ChevronLeft, ChevronRight, ListFilter, AlignLeft, ArrowDownUp, EyeOff, Trash2, Rows3, Maximize2, Activity, Speaker,
  Wind, Droplets, Timer, Gauge, SlidersHorizontal, Scissors, GitMerge, CircleStop, Wifi, Ghost,
  CloudDownload, PaintBucket, Copy, Check
} from "lucide-react"
import { cn } from "@/lib/utils"

// Custom Icon Components using Material Symbols
const MaterialIcon = ({ name, className }: { name: string, className?: string }) => {
  const sizeClasses = className?.split(' ').map(c => {
    if (c === 'h-4' || c === 'w-4') return 'text-[16px]'
    if (c === 'h-5' || c === 'w-5') return 'text-[20px]'
    if (c === 'h-6' || c === 'w-6') return 'text-[24px]'
    if (c === 'h-7' || c === 'w-7') return 'text-[28px]'
    if (c === 'h-8' || c === 'w-8') return 'text-[32px]'
    if (c === 'h-10' || c === 'w-10') return 'text-[40px]'
    return c
  }).join(' ')
  
  return (
    <span 
      className={cn("material-symbols-rounded block flex-shrink-0", sizeClasses)}
      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}
    >
      {name}
    </span>
  )
}

const Play = ({ className }: { className?: string }) => <MaterialIcon name="play_arrow" className={className} />
const Pause = ({ className }: { className?: string }) => <MaterialIcon name="pause" className={className} />
const SkipBack = ({ className }: { className?: string }) => <MaterialIcon name="skip_previous" className={className} />
const SkipForward = ({ className }: { className?: string }) => <MaterialIcon name="skip_next" className={className} />
const Shuffle = ({ className }: { className?: string }) => <MaterialIcon name="shuffle" className={className} />
const Repeat = ({ className }: { className?: string }) => <MaterialIcon name="repeat" className={className} />
const Repeat1 = ({ className }: { className?: string }) => <MaterialIcon name="repeat_one" className={className} />
const VolumeX = ({ className }: { className?: string }) => <MaterialIcon name="volume_off" className={className} />
const Volume1 = ({ className }: { className?: string }) => <MaterialIcon name="volume_down" className={className} />
const Volume2 = ({ className }: { className?: string }) => <MaterialIcon name="volume_up" className={className} />
const ShareIcon = ({ className }: { className?: string }) => <MaterialIcon name="ios_share" className={className} />
const MoreIcon = ({ className }: { className?: string }) => <MaterialIcon name="more_horiz" className={className} />

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

interface Song { videoId: string; title: string; artist: string; artistId?: string | null; album: string; duration: number; thumbnail: string; }
interface Playlist { id: string; name: string; songs: Song[]; }
interface LyricLine { time: number; text: string; }
interface LyricsData { syncedLyrics: LyricLine[] | null; plainLyrics: string | null; }

const COLOR_THEMES =[
  { id: 'default', name: 'Default', primary: '', secondary: '#64748b' },
  { id: 'teal', name: 'Teal Wave', primary: '#14b8a6', secondary: '#0f766e' },
  { id: 'green', name: 'Green Apple', primary: '#22c55e', secondary: '#15803d' },
  { id: 'blue', name: 'Ocean', primary: '#3b82f6', secondary: '#1d4ed8' },
  { id: 'purple', name: 'Amethyst', primary: '#a855f7', secondary: '#7e22ce' },
  { id: 'rose', name: 'Rose', primary: '#f43f5e', secondary: '#be123c' },
  { id: 'orange', name: 'Sunset', primary: '#f97316', secondary: '#c2410c' },
];

const ScrollableRow = ({ children, title, icon: Icon }: { children: React.ReactNode, title?: string, icon?: any }) => {
  const rowRef = useRef<HTMLDivElement>(null)
  return (
    <div className="mb-6">
      {title && Icon && <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground"><Icon className="h-6 w-6 text-primary"/> {title}</h3>}
      <div className="relative group/scroll">
        <Button variant="secondary" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex opacity-0 group-hover/scroll:opacity-100 transition-opacity rounded-full shadow-md" onClick={() => rowRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}><ChevronLeft className="h-5 w-5 text-foreground" /></Button>
        <div className="w-full relative transform-gpu" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
          <div ref={rowRef} className="flex overflow-x-auto overflow-y-hidden md:overflow-hidden overscroll-x-contain md:overscroll-auto gap-4 md:gap-6 snap-x no-scrollbar px-6 pt-4 pb-8 scroll-smooth items-center">
            {children}
          </div>
        </div>
        <Button variant="secondary" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex opacity-0 group-hover/scroll:opacity-100 transition-opacity rounded-full shadow-md" onClick={() => rowRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}><ChevronRight className="h-5 w-5 text-foreground" /></Button>
      </div>
    </div>
  )
}

const SettingsRow = ({ icon: Icon, title, desc, onClick, children }: { icon: any, title: string, desc: string, onClick?: () => void, children?: React.ReactNode }) => (
  <div onClick={onClick} className="flex items-center justify-between p-3 md:p-4 bg-transparent rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors gap-2">
    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
      <div className="p-2 md:p-2.5 bg-muted/80 rounded-xl text-foreground shrink-0"><Icon className="w-4 h-4 md:w-5 md:h-5 text-current"/></div>
      <div className="flex flex-col flex-1 min-w-0 pr-2">
        <span className="font-bold text-sm md:text-base text-foreground truncate">{title}</span>
        <span className="text-[11px] md:text-xs font-medium text-muted-foreground leading-tight mt-0.5 line-clamp-2 md:line-clamp-1">{desc}</span>
      </div>
    </div>
    {children}
  </div>
)

export function AudioPlayer() {
  const[isDark, setIsDark] = useState(false)
  const[isFullscreen, setIsFullscreen] = useState(false)
  
  const[searchQuery, setSearchQuery] = useState("")
  const[searchResults, setSearchResults] = useState<Song[]>([])
  const[searchSort, setSearchSort] = useState<'relevance' | 'az' | 'za'>('relevance')
  const[isSearching, setIsSearching] = useState(false)
  const[isSearchExpanded, setIsSearchExpanded] = useState(false)
  const[searchHistory, setSearchHistory] = useState<string[]>([])
  const[searchFocused, setSearchFocused] = useState(false)
  
  const[queue, setQueue] = useState<Song[]>([])
  const[currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const[currentTime, setCurrentTime] = useState(0)
  const[duration, setDuration] = useState(0)
  const[volume, setVolume] = useState(80)
  const[isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const[repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off")
  const[isLoading, setIsLoading] = useState(false)
  const[loadError, setLoadError] = useState<string | null>(null)
  
  const[playbackRate, setPlaybackRate] = useState(1)

  const [lyrics, setLyrics] = useState<LyricsData | null>(null)
  const[currentLyricIndex, setCurrentLyricIndex] = useState(-1)

  const [activeTab, setActiveTab] = useState<'player' | 'explore' | 'queue' | 'lyrics' | 'library' | 'artist' | 'album' | 'playlistView'>('explore')
  const[isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState(false)
  const[mobilePlayerTab, setMobilePlayerTab] = useState<'player' | 'lyrics' | 'queue'>('player')

  const[exploreData, setExploreData] = useState<{creatorsPicks: Song[], artists: any[], songs: Song[], albums: any[]}>({creatorsPicks:[], artists:[], songs: [], albums:[]})
  const[isExploreLoading, setIsExploreLoading] = useState(true)
  const[exploreError, setExploreError] = useState(false)
  
  const[currentArtistData, setCurrentArtistData] = useState<any>(null)
  const[isArtistLoading, setIsArtistLoading] = useState(false)
  const[currentAlbumData, setCurrentAlbumData] = useState<any>(null)
  const[isAlbumLoading, setIsAlbumLoading] = useState(false)
  const[currentPlaylistView, setCurrentPlaylistView] = useState<Playlist | null>(null)

  const[showAboutDialog, setShowAboutDialog] = useState(false)
  const[showCreditsDialog, setShowCreditsDialog] = useState(false)
  const[showAccountSettings, setShowAccountSettings] = useState(false) 
  const[showPlayerSettings, setShowPlayerSettings] = useState(false) 
  const[showPlaylistDialog, setShowPlaylistDialog] = useState(false)
  const[showColorPalette, setShowColorPalette] = useState(false)
  
  const[showCustomThemeDialog, setShowCustomThemeDialog] = useState(false)
  const[showImportThemeDialog, setShowImportThemeDialog] = useState(false)
  const[tempPrimaryColor, setTempPrimaryColor] = useState('#14b8a6')
  const[tempSecondaryColor, setTempSecondaryColor] = useState('#0f766e')
  const[importThemeString, setImportThemeString] = useState("")
  const[customThemeColors, setCustomThemeColors] = useState({ primary: '#14b8a6', secondary: '#0f766e' })

  const[newPlaylistName, setNewPlaylistName] = useState("")
  
  const[colorTheme, setColorTheme] = useState('default')
  const[playerStyle, setPlayerStyle] = useState<'Classic' | 'Open' | 'Modern' | 'Minimal' | 'Cinematic' | 'Expressive' | 'Immersive'>('Classic')

  const[dynamicTheme, setDynamicTheme] = useState(true)
  const[playerBgStyle, setPlayerBgStyle] = useState<'Theme' | 'Gradient' | 'Blur'>('Gradient')
  const[thumbnailRadius, setThumbnailRadius] = useState(32)
  const[dominantColor, setDominantColor] = useState<string | null>(null)
  const[lyricsProvider, setLyricsProvider] = useState<'lrclib' | 'kugou'>('lrclib')
  const[lyricsSize, setLyricsSize] = useState<'Normal' | 'Large' | 'Extra Large'>('Normal')
  const[audioQuality, setAudioQuality] = useState<'High' | 'Standard' | 'Low'>('High')
  const[autoPlaySimilar, setAutoPlaySimilar] = useState(false)
  
  // Expanded Settings State
  const[autoScrollLyrics, setAutoScrollLyrics] = useState(true)
  const[lyricsAlignment, setLyricsAlignment] = useState<'Left' | 'Center' | 'Right'>('Center')
  const[lyricsGlass, setLyricsGlass] = useState(false)
  const[hideCreatorsPicks, setHideCreatorsPicks] = useState(false)
  const[compactQueue, setCompactQueue] = useState(false)
  const[autoSwitchToPlayer, setAutoSwitchToPlayer] = useState(true)
  const[saveSearchHistory, setSaveSearchHistory] = useState(true)
  const[reduceMotion, setReduceMotion] = useState(false)
  const[autoOpenLyrics, setAutoOpenLyrics] = useState(false)

  // 10 New App Settings Added
  const[disableAnimations, setDisableAnimations] = useState(false)
  const[disableBlur, setDisableBlur] = useState(false)
  const[showTimeRemaining, setShowTimeRemaining] = useState(false)
  const[showPlaybackSpeed, setShowPlaybackSpeed] = useState(false)
  const[normalizeVolume, setNormalizeVolume] = useState(true)
  const[skipSilence, setSkipSilence] = useState(false)
  const[crossfade, setCrossfade] = useState(false)
  const[stopAfterCurrent, setStopAfterCurrent] = useState(false)
  const[dataSaver, setDataSaver] = useState(false)
  const[privateSession, setPrivateSession] = useState(false)
  
  const[showAuthDialog, setShowAuthDialog] = useState(false)
  const[user, setUser] = useState<FirebaseUser | null>(null)
  const [email, setEmail] = useState("")
  const[password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState("")
  const[displayNameInput, setDisplayNameInput] = useState("")
  
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set())
  const[savedSongs, setSavedSongs] = useState<Song[]>([])
  const[playlists, setPlaylists] = useState<Playlist[]>([])

  // YT IFrame Engine Refs
  const ytParentRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const handleEndedRef = useRef<() => void>(() => {})

  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const lyricsContainerRefMobile = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const currentSong = queue[currentIndex]

  const ALL_THEMES = [...COLOR_THEMES, { id: 'custom', name: 'Custom Theme', primary: customThemeColors.primary, secondary: customThemeColors.secondary }]
  const activeTheme = ALL_THEMES.find(t => t.id === colorTheme) || ALL_THEMES[0]

  const getLyricTextClass = () => {
    if (lyricsSize === 'Extra Large') return "text-2xl md:text-4xl"
    if (lyricsSize === 'Large') return "text-xl md:text-3xl"
    return "text-lg md:text-2xl"
  }
  
  const getLyricAlignWrapperClass = () => {
    if (lyricsAlignment === 'Left') return "items-start px-4 md:px-8"
    if (lyricsAlignment === 'Right') return "items-end px-4 md:px-8"
    return "items-center px-2"
  }

  const getLyricOriginClass = () => {
    if (lyricsAlignment === 'Left') return "text-left origin-left"
    if (lyricsAlignment === 'Right') return "text-right origin-right"
    return "text-center origin-center"
  }

  // Safely sample images while ensuring dead references are flushed
  useEffect(() => {
    let isActive = true;
    if (!currentSong?.thumbnail || playerBgStyle === 'Theme') {
      setDominantColor(null)
      return
    }
    const img = new Image()
    img.crossOrigin = "Anonymous"
    
    img.onload = () => {
      if (!isActive) return;
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0, 64, 64)
      try {
        const data = ctx.getImageData(0, 0, 64, 64).data
        let r = 0, g = 0, b = 0
        let count = 0;
        for (let i = 0; i < data.length; i += 16) {
          r += data[i]; g += data[i+1]; b += data[i+2];
          count++;
        }
        if (count > 0) {
           setDominantColor(`rgba(${~~(r/count)}, ${~~(g/count)}, ${~~(b/count)}, 0.45)`)
        }
      } catch(e) { if (isActive) setDominantColor(null) }
    }

    img.src = currentSong.thumbnail;

    return () => { 
      isActive = false; 
      img.onload = null; 
    }
  },[currentSong?.thumbnail, playerBgStyle])

  const applyAudioEffects = useCallback(() => {
    if (ytPlayerRef.current?.setPlaybackRate) {
      try { ytPlayerRef.current.setPlaybackRate(playbackRate) } catch(e){}
    }
  }, [playbackRate])

  useEffect(() => {
    applyAudioEffects()
  }, [applyAudioEffects])

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
      
      const loadBoolSetting = (key: string, setter: (val: boolean) => void) => {
        const val = localStorage.getItem(key);
        if (val !== null) setter(val === 'true');
      }

      const savedProvider = localStorage.getItem('ganvo_lyrics_provider')
      if (savedProvider) setLyricsProvider(savedProvider as 'lrclib' | 'kugou')
      const savedQuality = localStorage.getItem('ganvo_audio_quality')
      if (savedQuality) setAudioQuality(savedQuality as 'High' | 'Standard' | 'Low')
      const savedAlignment = localStorage.getItem('ganvo_lyrics_alignment')
      if (savedAlignment) setLyricsAlignment(savedAlignment as 'Left' | 'Center' | 'Right')
      
      const savedTheme = localStorage.getItem('ganvo_color_theme')
      if (savedTheme) setColorTheme(savedTheme)
      
      const savedCustomTheme = localStorage.getItem('ganvo_custom_theme')
      if (savedCustomTheme) {
        try {
          const parsed = JSON.parse(savedCustomTheme)
          setCustomThemeColors(parsed)
          setTempPrimaryColor(parsed.primary)
          setTempSecondaryColor(parsed.secondary)
        } catch(e) {}
      }

      const savedPlayerStyle = localStorage.getItem('ganvo_player_style')
      if (savedPlayerStyle) setPlayerStyle(savedPlayerStyle as any)

      loadBoolSetting('ganvo_autoplay_similar', setAutoPlaySimilar)
      loadBoolSetting('ganvo_auto_scroll_lyrics', setAutoScrollLyrics)
      loadBoolSetting('ganvo_lyrics_glass', setLyricsGlass)
      loadBoolSetting('ganvo_hide_picks', setHideCreatorsPicks)
      loadBoolSetting('ganvo_compact_queue', setCompactQueue)
      loadBoolSetting('ganvo_auto_switch_player', setAutoSwitchToPlayer)
      loadBoolSetting('ganvo_save_history', setSaveSearchHistory)
      loadBoolSetting('ganvo_reduce_motion', setReduceMotion)
      loadBoolSetting('ganvo_auto_open_lyrics', setAutoOpenLyrics)
      loadBoolSetting('ganvo_disable_animations', setDisableAnimations)
      loadBoolSetting('ganvo_disable_blur', setDisableBlur)
      loadBoolSetting('ganvo_show_time_remaining', setShowTimeRemaining)
      loadBoolSetting('ganvo_show_playback_speed', setShowPlaybackSpeed)
      loadBoolSetting('ganvo_normalize_volume', setNormalizeVolume)
      loadBoolSetting('ganvo_skip_silence', setSkipSilence)
      loadBoolSetting('ganvo_crossfade', setCrossfade)
      loadBoolSetting('ganvo_stop_after_current', setStopAfterCurrent)
      loadBoolSetting('ganvo_data_saver', setDataSaver)
      loadBoolSetting('ganvo_private_session', setPrivateSession)
    } catch (e) {}

    setIsExploreLoading(true)
    setExploreError(false)
    fetch('/api/music/explore')
      .then(res => res.json())
      .then(data => { 
        if (data && !data.error && data.artists && data.songs && data.albums) {
          setExploreData(data) 
        } else {
          setExploreError(true)
        }
      })
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
          await setDoc(userRef, { savedSongs:[], playlists:[] })
        }
      } else {
        const saved = localStorage.getItem('ganvo_saved_songs')
        const localPlaylists = localStorage.getItem('ganvo_playlists')
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
  },[])

  const syncToCloud = async (newSaved: Song[], newPlaylists: Playlist[]) => {
    localStorage.setItem('ganvo_saved_songs', JSON.stringify(newSaved))
    localStorage.setItem('ganvo_playlists', JSON.stringify(newPlaylists))
    if (user && db) {
      try {
        const userRef = doc(db, "users", user.uid)
        await setDoc(userRef, { savedSongs: newSaved, playlists: newPlaylists }, { merge: true })
      } catch (e) {}
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    if (!email.includes('@')) {
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
    } catch (error: any) { setAuthError(error.message.replace("Firebase: ", "")) }
  }

  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider) return
    setAuthError("")
    try {
      await signInWithPopup(auth, googleProvider)
      setShowAuthDialog(false)
    } catch (error: any) { setAuthError(error.message.replace("Firebase: ", "")) }
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
    const newPlaylist: Playlist = { id: Date.now().toString(), name: newPlaylistName.trim(), songs:[] }
    const updatedPlaylists =[...playlists, newPlaylist]
    setPlaylists(updatedPlaylists)
    syncToCloud(savedSongs, updatedPlaylists)
    setNewPlaylistName("")
    setShowPlaylistDialog(false)
    toast.success('Playlist created!')
  }

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        if (!p.songs.find(s => s.videoId === song.videoId)) {
          return { ...p, songs:[...p.songs, song] }
        }
      }
      return p
    })
    setPlaylists(updatedPlaylists)
    syncToCloud(savedSongs, updatedPlaylists)
    toast.success('Added to playlist')
  }

  const handleSaveCustomTheme = (e: React.FormEvent) => {
    e.preventDefault()
    const newTheme = { primary: tempPrimaryColor, secondary: tempSecondaryColor }
    setCustomThemeColors(newTheme)
    setColorTheme('custom')
    localStorage.setItem('ganvo_color_theme', 'custom')
    localStorage.setItem('ganvo_custom_theme', JSON.stringify(newTheme))
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
          setColorTheme('custom')
          localStorage.setItem('ganvo_color_theme', 'custom')
          localStorage.setItem('ganvo_custom_theme', JSON.stringify(parsed))
          setShowImportThemeDialog(false)
          setImportThemeString("")
          toast.success("Theme imported successfully!")
       } else throw new Error()
    } catch(err) {
       toast.error("Invalid theme format. Please provide valid JSON.")
    }
  }

  const handleShare = async (song: Song) => {
    const shareData = {
      title: `${song.title} by ${song.artist}`,
      text: `Listen to ${song.title} on Ganvo Music`,
      url: `https://music.youtube.com/watch?v=${song.videoId}`
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const loadArtistView = async (artistId: string) => {
    setIsArtistLoading(true)
    setActiveTab('artist')
    setCurrentArtistData(null)
    setIsMobilePlayerExpanded(false)
    try {
      const res = await fetch(`/api/music/artist/${artistId}`)
      const data = await res.json()
      if (data && !data.error) setCurrentArtistData(data)
    } catch (e) {} finally { setIsArtistLoading(false) }
  }

  const loadAlbumView = async (albumId: string) => {
    setIsAlbumLoading(true)
    setActiveTab('album')
    setCurrentAlbumData(null)
    setIsMobilePlayerExpanded(false)
    try {
      const res = await fetch(`/api/music/album/${albumId}`)
      const data = await res.json()
      if (data && !data.error) setCurrentAlbumData(data)
    } catch (e) {} finally { setIsAlbumLoading(false) }
  }

  const loadPlaylistView = (playlist: Playlist) => {
    setCurrentPlaylistView(playlist)
    setActiveTab('playlistView')
    setIsMobilePlayerExpanded(false)
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  },[isDark])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-radix-popper-content-wrapper]')) return;
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
        setIsSearchExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  },[])

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
      } catch (error) {} finally { setIsSearching(false) }
    }, 300)

    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  },[searchQuery])

  const sortedSearchResults =[...searchResults].sort((a, b) => {
    if (searchSort === 'az') return a.title.localeCompare(b.title)
    if (searchSort === 'za') return b.title.localeCompare(a.title)
    return 0
  })

  const addToQueueAndPlay = async (song: Song) => {
    const saveSearchStr = searchQuery || song.title
    if (saveSearchStr.trim() && saveSearchHistory && !privateSession) {
      const newHistory =[saveSearchStr, ...searchHistory.filter(q => q !== saveSearchStr)].slice(0, 15)
      setSearchHistory(newHistory)
      localStorage.setItem('ganvo_search_history', JSON.stringify(newHistory))
    }
    
    if (autoSwitchToPlayer && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setActiveTab(autoOpenLyrics ? 'lyrics' : 'player');
    }
    if (autoOpenLyrics) {
      setMobilePlayerTab('lyrics');
    }
    
    // Check if the current queued song array contains our requested track natively already.
    const existingIndex = queue.findIndex((s) => s.videoId === song.videoId)
    
    if (existingIndex >= 0) {
      if (currentIndex === existingIndex && ytPlayerRef.current) {
        setIsLoading(true);
        setCurrentTime(0);
        ytPlayerRef.current.loadVideoById(song.videoId);
        ytPlayerRef.current.playVideo();
      } else {
        setCurrentIndex(existingIndex);
      }
    } else {
      setQueue((prev) =>[...prev, song])
      setCurrentIndex(queue.length)
    }
    setSearchResults([])
    setSearchQuery("")
    setIsSearchExpanded(false)
    setSearchFocused(false)
  }


  const playFromLibrary = (song: Song) => addToQueueAndPlay(song)

  // ======== NATIVE YT IFRAME MOUNTING ======== //
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
          setIsLoading(true);
          try {
            const res = await fetch(`/api/music/search?q=${encodeURIComponent(currentSong.artist + ' ' + currentSong.title)}`);
            const data = await res.json();
            const similar = (data.results ||[]).filter((s: Song) => !queue.find(q => q.videoId === s.videoId));
            if (similar.length > 0) {
              setQueue(prev =>[...prev, similar[0]]);
              setCurrentIndex(queue.length);
            } else setIsPlaying(false);
          } catch {
            setIsPlaying(false);
          } finally {
            setIsLoading(false);
          }
        } else {
          playNext()
        }
      }
    };
  });

  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!ytParentRef.current || !isMounted) return;
      
      // Isolate React's virtual DOM from Google API overwriting the Div
      const playerDiv = document.createElement('div');
      ytParentRef.current.innerHTML = '';
      ytParentRef.current.appendChild(playerDiv);

      ytPlayerRef.current = new (window as any).YT.Player(playerDiv, {
        height: '1', width: '1',
        videoId: currentSong?.videoId || '', // Explicit payload bypass origin
        playerVars: { playsinline: 1, controls: 0, disablekb: 1 },
        events: {
          onReady: (event: any) => {
            if (isMounted && event.target.setVolume) {
                event.target.setVolume(volume);
                if (currentSong) {
                   setIsLoading(true);
                   event.target.loadVideoById(currentSong.videoId);
                   event.target.playVideo();
                }
            }
          },
          onStateChange: (e: any) => {
            if (!isMounted) return;
            if (e.data === 1) { 
              setIsPlaying(true); setIsLoading(false);
              setDuration(ytPlayerRef.current.getDuration() || 0);
            } else if (e.data === 2 || e.data === 0) { 
              setIsPlaying(false); setIsLoading(false);
              if (e.data === 0 && handleEndedRef.current) handleEndedRef.current();
            } else if (e.data === 3) {
              setIsPlaying(true); setIsLoading(true);
            }
          },
          onError: () => {
            setIsLoading(false); setIsPlaying(false);
            setLoadError("Audio track unavailable in your region. Trying next...");
            setTimeout(() => playNext(), 3000);
          }
        }
      });
    };

    if (typeof window !== "undefined") {
      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer();
      } else {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) firstScript.parentNode.insertBefore(tag, firstScript);
        else document.head.appendChild(tag);

        const existingCallback = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (existingCallback) existingCallback();
          initPlayer();
        };
      }
    }

    return () => {
      isMounted = false;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
         ytPlayerRef.current.destroy();
         ytPlayerRef.current = null;
      }
      if (ytParentRef.current) ytParentRef.current.innerHTML = '';
    };
  },[]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          const t = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || 0;
          setCurrentTime(t);
          if (dur > 0) setDuration(dur);
        }
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  },[isPlaying]);

  useEffect(() => {
    if (currentSong && ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
      setIsLoading(true);
      setCurrentTime(0);
      setLoadError(null);
      ytPlayerRef.current.loadVideoById(currentSong.videoId);
      ytPlayerRef.current.playVideo();
    }
  },[currentSong?.videoId]);
  
  useEffect(() => {
    if (!currentSong) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
         ytPlayerRef.current.stopVideo();
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }
  },[currentSong]);

  useEffect(() => {
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) ytPlayerRef.current.setVolume(volume);
    if (ytPlayerRef.current && ytPlayerRef.current.mute) isMuted ? ytPlayerRef.current.mute() : ytPlayerRef.current.unMute();
  },[volume, isMuted]);

  // ============================================================== //

  useEffect(() => {
    if (!currentSong) return

    const loadLyrics = async () => {
      setLyrics(null)
      setCurrentLyricIndex(-1)

      try {
        const params = new URLSearchParams({
          track: currentSong.title, artist: currentSong.artist,
          ...(currentSong.album && { album: currentSong.album }),
          ...(currentSong.duration && { duration: String(currentSong.duration) }),
          provider: lyricsProvider
        })
        const response = await fetch(`/api/lyrics?${params}`)
        const data = await response.json()
        if (data.syncedLyrics || data.plainLyrics) setLyrics({ syncedLyrics: data.syncedLyrics, plainLyrics: data.plainLyrics })
        else setLyrics({ syncedLyrics: null, plainLyrics: null })
      } catch (error) { setLyrics({ syncedLyrics: null, plainLyrics: null }) }
    }
    loadLyrics()
  },[currentSong?.videoId, lyricsProvider])

  useEffect(() => {
    if (!lyrics?.syncedLyrics) return
    const lyric = lyrics.syncedLyrics.findLast((l) => l.time <= currentTime)
    const index = lyric ? lyrics.syncedLyrics.indexOf(lyric) : -1

    if (index !== currentLyricIndex) {
      setCurrentLyricIndex(index)
      if (index >= 0 && autoScrollLyrics) {
        setTimeout(() => {
          const activeLines = document.querySelectorAll('.lyric-active-line');
          activeLines.forEach((line) => {
            const container = line.closest('.lyrics-scroll-container') as HTMLElement;
            if (container && line instanceof HTMLElement) {
              const scrollPos = line.offsetTop - (container.clientHeight / 2) + (line.clientHeight / 2);
              container.scrollTo({ top: scrollPos, behavior: 'smooth' });
            }
          })
        }, 50)
      }
    }
  },[currentTime, lyrics, currentLyricIndex, autoScrollLyrics])

  const playNext = useCallback(() => {
    if (queue.length === 0) return
    let nextIndex = shuffle ? Math.floor(Math.random() * queue.length) : (currentIndex + 1) % queue.length
    if (nextIndex === 0 && repeatMode === "off" && !shuffle) {
      setIsPlaying(false)
      if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo()
      return
    }
    setCurrentIndex(nextIndex)
  },[queue.length, currentIndex, shuffle, repeatMode])

  const togglePlay = useCallback(() => {
    if (!ytPlayerRef.current) return
    if (isPlaying) ytPlayerRef.current.pauseVideo()
    else ytPlayerRef.current.playVideo()
    setIsPlaying(!isPlaying)
  },[isPlaying])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return
    if (currentTime > 3) {
      if (ytPlayerRef.current) ytPlayerRef.current.seekTo(0, true)
      return
    }
    setCurrentIndex((currentIndex - 1 + queue.length) % queue.length)
  },[queue.length, currentIndex, currentTime])

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
      let newSaved =[...savedSongs]
      if (next.has(song.videoId)) {
        next.delete(song.videoId)
        newSaved = newSaved.filter(s => s.videoId !== song.videoId)
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

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2
  const showSearchDropdown = searchFocused && (searchResults.length > 0 || isSearching || (searchQuery.trim() === "" && searchHistory.length > 0))

  const VolumeControls = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center gap-3 w-full px-2 mt-auto pb-8", className)}>
      <div className="flex flex-1 items-center gap-3 rounded-[2rem] bg-muted/60 backdrop-blur-sm px-5 py-4 transition-all duration-300 hover:bg-muted/80">
        <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 flex-shrink-0 rounded-full p-0 transition-transform duration-300 hover:scale-110 active:scale-90 flex items-center justify-center text-foreground outline-none focus:outline-none"><VolumeIcon className="text-[20px] text-current" /></Button>
        <Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1 cursor-grab active:cursor-grabbing [&_[data-slot=range]]:bg-foreground [&_[data-slot=thumb]]:h-5 [&_[data-slot=thumb]]:w-5 [&_[data-slot=track]]:h-2 [&_[data-slot=track]]:bg-foreground/10" />
        <span className="w-8 flex-shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">{isMuted ? 0 : volume}%</span>
      </div>
    </div>
  )

  const PlayerMenuOptions = ({ song }: { song: Song }) => (
    <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] shadow-xl z-[400] border-border/50 p-2">
       <DropdownMenuItem onSelect={() => { if (song.artistId) loadArtistView(song.artistId); }} className="rounded-xl py-3 cursor-pointer text-foreground font-medium transition-all active:scale-[0.98]">
         <UserCircle2 className="mr-3 h-5 w-5 text-muted-foreground" /> Go to Artist
       </DropdownMenuItem>
       {song.album && (
         <DropdownMenuItem onSelect={() => { setSearchQuery(song.album); setSearchFocused(true); setIsMobilePlayerExpanded(false); }} className="rounded-xl py-3 cursor-pointer text-foreground font-medium transition-all active:scale-[0.98]">
           <Disc3 className="mr-3 h-5 w-5 text-muted-foreground" /> Search Album
         </DropdownMenuItem>
       )}
       <DropdownMenuSeparator className="my-2" />
       <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
       {playlists.map(pl => (
         <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 text-foreground transition-all active:scale-[0.98]"><ListMusic className="mr-3 h-4 w-4 text-primary" /> {pl.name}</DropdownMenuItem>
       ))}
    </DropdownMenuContent>
  )

  // MOBILE PLAYER RENDERING STRATEGIES
  const renderClassicPlayer = () => (
    <div className="flex flex-col items-center min-h-full py-4 w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-500 relative m-auto">
      <div className="w-full max-w-[320px] aspect-square mx-auto overflow-hidden shadow-2xl relative mb-8 shrink-0 flex items-center justify-center" style={{ borderRadius: `${thumbnailRadius}px` }}>
         <img src={currentSong.thumbnail} className={cn("w-full h-full object-cover transition-transform duration-[2s] ease-out absolute inset-0", isPlaying ? "scale-105" : "scale-100")} />
         {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md z-10">
              <Loader2 className="h-12 w-12 animate-spin text-white mb-2" />
            </div>
          )}
      </div>
      <div className="w-full flex items-center px-4 mb-6">
         <div className="flex items-center gap-1 flex-shrink-0">
           <Button variant="ghost" size="icon" onClick={() => handleShare(currentSong)} className="h-12 w-12 rounded-full"><ShareIcon className="text-[24px]"/></Button>
         </div>
         <div className="flex-1 min-w-0 text-center px-4">
            <h2 className="text-2xl font-extrabold truncate text-foreground mb-1">{currentSong.title}</h2>
            <button onClick={() => currentSong.artistId && loadArtistView(currentSong.artistId)} className="max-w-full text-base font-semibold text-muted-foreground/80 hover:text-primary hover:underline transition-colors outline-none focus:outline-none truncate">{currentSong.artist}</button>
         </div>
         <div className="flex items-center gap-1 flex-shrink-0">
           <Button variant="ghost" size="icon" onClick={() => toggleLike(currentSong)} className="h-12 w-12 p-0 rounded-full text-foreground hover:bg-primary/10 outline-none focus:outline-none">
              <Heart className={cn("h-6 w-6 transition-all", likedSongs.has(currentSong.videoId) ? "fill-[var(--primary)] text-[var(--primary)] scale-110" : "text-current")} />
           </Button>
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full"><MoreIcon className="text-[24px]"/></Button>
             </DropdownMenuTrigger>
             <PlayerMenuOptions song={currentSong} />
           </DropdownMenu>
         </div>
      </div>
      
      {showPlaybackSpeed && (
        <div className="flex w-full items-center justify-between px-4 mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Gauge className="w-4 h-4"/> Speed</span>
          <Select value={playbackRate.toString()} onValueChange={(v: any) => setPlaybackRate(parseFloat(v))}>
            <SelectTrigger className="w-[80px] h-8 rounded-full border-none bg-muted/50 text-xs font-bold focus:ring-0 outline-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl z-[500]">
              <SelectItem value="0.5" className="text-xs font-bold py-2">0.5x</SelectItem>
              <SelectItem value="0.75" className="text-xs font-bold py-2">0.75x</SelectItem>
              <SelectItem value="1" className="text-xs font-bold py-2">1x</SelectItem>
              <SelectItem value="1.25" className="text-xs font-bold py-2">1.25x</SelectItem>
              <SelectItem value="1.5" className="text-xs font-bold py-2">1.5x</SelectItem>
              <SelectItem value="2" className="text-xs font-bold py-2">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="w-full mb-8 px-4">
        <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="mb-4 [&_[data-slot=range]]:bg-primary [&_[data-slot=thumb]]:h-5[&_[data-slot=thumb]]:w-5[&_[data-slot=track]]:h-2" />
        <div className="flex justify-between text-xs font-bold text-muted-foreground px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{showTimeRemaining && duration ? `-${formatTime(duration - currentTime)}` : formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between w-full mb-8 px-4">
        <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("h-14 w-14 p-0 rounded-full flex items-center justify-center outline-none focus:outline-none", shuffle ? "bg-primary/20 text-primary" : "text-foreground")}><Shuffle className="text-[24px]" /></Button>
        <Button variant="ghost" size="icon" onClick={playPrevious} className="h-16 w-16 p-0 rounded-full text-foreground flex items-center justify-center outline-none focus:outline-none"><SkipBack className="text-[36px]" /></Button>
        <Button size="icon" onClick={togglePlay} className="h-24 w-24 p-0 rounded-[2rem] bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center outline-none focus:outline-none">
           {isPlaying ? <Pause className="text-[48px] text-primary-foreground" /> : <Play className="text-[48px] text-primary-foreground translate-x-[2px]" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={playNext} className="h-16 w-16 p-0 rounded-full text-foreground flex items-center justify-center outline-none focus:outline-none"><SkipForward className="text-[36px]" /></Button>
        <Button variant="ghost" size="icon" onClick={() => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off")} className={cn("h-14 w-14 p-0 rounded-full flex items-center justify-center outline-none focus:outline-none", repeatMode !== "off" ? "bg-primary/20 text-primary" : "text-foreground")}>
          {repeatMode === "one" ? <Repeat1 className="text-[24px]" /> : <Repeat className="text-[24px]" />}
        </Button>
      </div>
      
      <VolumeControls />
    </div>
  )

  const renderOpenPlayer = () => (
    <div className="flex flex-col items-center min-h-full py-2 w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-500 relative m-auto">
      <div className="text-center mb-6 mt-2 px-4">
        <p className="text-sm font-bold text-foreground tracking-wide uppercase">Now Playing</p>
        <p className="text-sm font-medium text-muted-foreground truncate max-w-full mt-1">{currentSong.album || `${currentSong.artist} Mix`}</p>
      </div>
      <div className="w-full max-w-[380px] aspect-square mx-auto overflow-hidden shadow-sm relative shrink-0 flex items-center justify-center rounded-[2.5rem] px-4">
         <img src={currentSong.thumbnail} className={cn("w-full h-full object-cover transition-transform duration-[2s] ease-out rounded-[2.5rem]", isPlaying ? "scale-105" : "scale-100")} />
      </div>
      <div className="w-full flex items-center justify-between gap-4 mt-8 mb-6 px-6">
         <div className="flex-1 min-w-0 text-left pr-4">
            <h2 className="text-3xl font-extrabold truncate text-foreground mb-1 tracking-tight">{currentSong.title}</h2>
            <p className="text-lg font-semibold text-muted-foreground truncate">{currentSong.artist}</p>
         </div>
         <div className="flex items-center gap-1 flex-shrink-0">
           <Button variant="ghost" size="icon" onClick={() => handleShare(currentSong)} className="h-14 w-14 rounded-full hover:bg-muted"><ShareIcon className="text-[28px]"/></Button>
           <Button variant="ghost" size="icon" onClick={() => toggleLike(currentSong)} className="h-14 w-14 rounded-full hover:bg-muted">
              <Heart className={cn("text-[28px] transition-all", likedSongs.has(currentSong.videoId) ? "fill-[var(--primary)] text-[var(--primary)] scale-110" : "text-current")} />
           </Button>
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full hover:bg-muted"><MoreIcon className="text-[28px]"/></Button>
             </DropdownMenuTrigger>
             <PlayerMenuOptions song={currentSong} />
           </DropdownMenu>
         </div>
      </div>
      <div className="w-full mb-8 px-6">
        <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="mb-5 [&_[data-slot=range]]:bg-primary [&_[data-slot=thumb]]:h-4 [&_[data-slot=thumb]]:w-4 [&_[data-slot=track]]:h-2 [&_[data-slot=track]]:bg-muted" />
        <div className="flex justify-between text-xs font-bold text-muted-foreground tracking-wider">
          <span>{formatTime(currentTime)}</span>
          <span>{showTimeRemaining && duration ? `-${formatTime(duration - currentTime)}` : formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between w-full mb-8 px-4">
        <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("h-14 w-14 p-0 rounded-full", shuffle ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted")}><Shuffle className="text-[28px]" /></Button>
        <Button variant="ghost" size="icon" onClick={playPrevious} className="h-20 w-20 p-0 rounded-full text-foreground hover:bg-muted"><SkipBack className="text-[40px]" /></Button>
        <Button size="icon" onClick={togglePlay} className="h-24 w-24 p-0 rounded-[2.5rem] bg-foreground text-background shadow-2xl hover:scale-105 transition-transform active:scale-95">
           {isPlaying ? <Pause className="text-[48px] text-background" /> : <Play className="text-[48px] text-background" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={playNext} className="h-20 w-20 p-0 rounded-full text-foreground hover:bg-muted"><SkipForward className="text-[40px]" /></Button>
        <Button variant="ghost" size="icon" onClick={() => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off")} className={cn("h-14 w-14 p-0 rounded-full", repeatMode !== "off" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted")}>
          {repeatMode === "one" ? <Repeat1 className="text-[28px]" /> : <Repeat className="text-[28px]" />}
        </Button>
      </div>

      <VolumeControls className="mt-0" />

      <div className="flex w-full gap-4 mt-2 mb-2 px-4">
         <Button variant="secondary" className="flex-1 rounded-[1.5rem] h-16 bg-muted/60 font-bold text-base shadow-sm hover:bg-muted/80" onClick={() => setMobilePlayerTab('queue')}><ListMusic className="mr-3 h-5 w-5"/> Queue</Button>
         <Button variant="secondary" size="icon" className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-muted/60 shadow-sm hover:bg-muted/80" onClick={() => setIsDark(!isDark)}><Moon className="h-6 w-6"/></Button>
         <Button variant="secondary" className="flex-1 rounded-[1.5rem] h-16 bg-muted/60 font-bold text-base shadow-sm hover:bg-muted/80" onClick={() => setMobilePlayerTab('lyrics')}><AlignLeft className="mr-3 h-5 w-5"/> Lyrics</Button>
      </div>
    </div>
  )

  const renderModernPlayer = () => (
    <div className="flex flex-col items-center min-h-full py-2 w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-500 relative m-auto">
      <div className="text-center mb-6 mt-2 px-4">
        <p className="text-sm font-bold text-foreground">Now Playing</p>
        <p className="text-sm font-medium text-muted-foreground truncate max-w-full mt-1">{currentSong.album || `${currentSong.artist} Mix`}</p>
      </div>
      <div className="w-full max-w-[380px] aspect-square mx-auto overflow-hidden shadow-sm relative shrink-0 flex items-center justify-center rounded-[2.5rem] px-4">
         <img src={currentSong.thumbnail} className={cn("w-full h-full object-cover transition-transform duration-[2s] ease-out rounded-[2.5rem]", isPlaying ? "scale-105" : "scale-100")} />
      </div>
      <div className="w-full flex items-center justify-between gap-4 mt-8 mb-6 px-6">
         <div className="flex-1 min-w-0 text-left pr-4">
            <h2 className="text-3xl font-extrabold truncate text-foreground mb-1 tracking-tight">{currentSong.title}</h2>
            <p className="text-lg font-semibold text-muted-foreground truncate">{currentSong.artist}</p>
         </div>
         <div className="flex items-center gap-2 flex-shrink-0">
           <Button variant="secondary" size="icon" onClick={() => handleShare(currentSong)} className="h-14 w-14 rounded-full bg-muted/60 hover:bg-muted/80"><ShareIcon className="text-[24px]"/></Button>
           <Button variant="secondary" size="icon" onClick={() => toggleLike(currentSong)} className="h-14 w-14 rounded-full bg-muted/60 hover:bg-muted/80">
              <Heart className={cn("text-[24px] transition-all", likedSongs.has(currentSong.videoId) ? "fill-[var(--primary)] text-[var(--primary)] scale-110" : "text-current")} />
           </Button>
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full bg-muted/60 hover:bg-muted/80"><MoreIcon className="text-[24px]"/></Button>
             </DropdownMenuTrigger>
             <PlayerMenuOptions song={currentSong} />
           </DropdownMenu>
         </div>
      </div>
      <div className="w-full mb-6 px-6">
        <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="mb-5 [&_[data-slot=range]]:bg-primary [&_[data-slot=thumb]]:h-4 [&_[data-slot=thumb]]:w-4 [&_[data-slot=track]]:h-2 [&_[data-slot=track]]:bg-muted" />
        <div className="flex justify-between text-xs font-bold text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{showTimeRemaining && duration ? `-${formatTime(duration - currentTime)}` : formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Modern Control Pill */}
      <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-[3rem] p-3 mx-6 w-[calc(100%-3rem)]">
         <Button variant="ghost" onClick={playPrevious} className="flex-1 h-20 rounded-[2.5rem] text-primary hover:bg-primary/20"><SkipBack className="text-[36px]"/></Button>
         <Button onClick={togglePlay} className="h-24 w-28 shrink-0 rounded-[2.5rem] bg-foreground text-background shadow-xl hover:scale-105 transition-transform active:scale-95">
            {isPlaying ? <Pause className="text-[40px] text-background" /> : <Play className="text-[40px] text-background" />}
         </Button>
         <Button variant="ghost" onClick={playNext} className="flex-1 h-20 rounded-[2.5rem] text-primary hover:bg-primary/20"><SkipForward className="text-[36px]"/></Button>
      </div>
      
      <div className="flex justify-center gap-8 mt-6 mb-8 w-full">
         <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("h-14 w-14 rounded-full bg-muted/30", shuffle ? "text-primary bg-primary/10" : "text-muted-foreground")}><Shuffle className="text-[24px]" /></Button>
         <Button variant="ghost" size="icon" onClick={() => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off")} className={cn("h-14 w-14 rounded-full bg-muted/30", repeatMode !== "off" ? "text-primary bg-primary/10" : "text-muted-foreground")}>
           {repeatMode === "one" ? <Repeat1 className="text-[24px]" /> : <Repeat className="text-[24px]" />}
         </Button>
      </div>

      <VolumeControls className="mt-0" />

      <div className="flex w-full gap-4 mt-2 mb-2 px-4">
         <Button variant="secondary" className="flex-1 rounded-[1.5rem] h-16 bg-muted/60 font-bold text-base hover:bg-muted/80" onClick={() => setMobilePlayerTab('queue')}><ListMusic className="mr-3 h-5 w-5"/> Queue</Button>
         <Button variant="secondary" size="icon" className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-muted/60 hover:bg-muted/80" onClick={() => setIsDark(!isDark)}><Moon className="h-6 w-6"/></Button>
         <Button variant="secondary" className="flex-1 rounded-[1.5rem] h-16 bg-muted/60 font-bold text-base hover:bg-muted/80" onClick={() => setMobilePlayerTab('lyrics')}><AlignLeft className="mr-3 h-5 w-5"/> Lyrics</Button>
      </div>
    </div>
  )

  const renderMinimalPlayer = () => (
    <div className="flex flex-col items-center justify-center min-h-full py-8 w-full max-w-[480px] animate-in fade-in duration-500 relative m-auto px-6">
      <div className="w-full max-w-[300px] aspect-square mx-auto overflow-hidden shadow-sm relative shrink-0 mb-12 flex items-center justify-center rounded-[2.5rem] border border-border/20">
         <img src={currentSong.thumbnail} className={cn("w-full h-full object-cover transition-opacity duration-[2s]", isPlaying ? "opacity-100" : "opacity-80")} />
      </div>
      
      <div className="w-full text-center mb-8 px-4 flex flex-col items-center relative">
        <h2 className="text-3xl font-bold truncate text-foreground tracking-tight w-full px-12">{currentSong.title}</h2>
        <p className="text-lg font-medium text-muted-foreground truncate mt-2 w-full px-12">{currentSong.artist}</p>
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => toggleLike(currentSong)} className="h-10 w-10 text-muted-foreground hover:bg-transparent">
            <Heart className={cn("h-6 w-6 transition-all", likedSongs.has(currentSong.videoId) ? "fill-foreground text-foreground" : "text-current")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-transparent"><MoreIcon className="text-[24px]"/></Button>
            </DropdownMenuTrigger>
            <PlayerMenuOptions song={currentSong} />
          </DropdownMenu>
        </div>
      </div>
      
      <div className="w-full mb-12 px-4">
        <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="[&_[data-slot=range]]:bg-foreground [&_[data-slot=thumb]]:hidden [&_[data-slot=track]]:h-[3px] [&_[data-slot=track]]:bg-muted-foreground/20" />
        <div className="flex justify-between text-[11px] font-bold tracking-widest text-muted-foreground/60 mt-3 uppercase">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-12 w-full mb-14">
        <Button variant="ghost" size="icon" onClick={playPrevious} className="h-16 w-16 text-muted-foreground hover:text-foreground"><SkipBack className="text-[36px] font-light" /></Button>
        <Button variant="ghost" size="icon" onClick={togglePlay} className="h-24 w-24 p-0 flex items-center justify-center text-foreground hover:bg-muted/30 rounded-full">
           {isPlaying ? <Pause className="text-[56px] font-light" /> : <Play className="text-[56px] font-light" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={playNext} className="h-16 w-16 text-muted-foreground hover:text-foreground"><SkipForward className="text-[36px] font-light" /></Button>
      </div>
      
      <div className="flex items-center gap-4 w-full px-8 mt-auto pb-4 opacity-50 hover:opacity-100 transition-opacity">
        <VolumeIcon className="text-[20px]" />
        <Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1 [&_[data-slot=range]]:bg-foreground [&_[data-slot=thumb]]:h-4 [&_[data-slot=thumb]]:w-4 [&_[data-slot=track]]:h-1 [&_[data-slot=track]]:bg-foreground/10" />
      </div>
    </div>
  )

  const renderCinematicPlayer = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-end w-full animate-in fade-in duration-1000 z-50">
      <div className="absolute inset-0 z-[-1] overflow-hidden bg-black">
        <img src={currentSong.thumbnail} className={cn("w-full h-[70vh] object-cover opacity-80 blur-md scale-110 transition-transform duration-[10s]", isPlaying && "scale-125")} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>
      <div className="w-full px-6 pb-12 pt-32 max-w-[480px]">
        <div className="mb-6 flex justify-between items-end">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-4xl font-black text-white truncate drop-shadow-lg tracking-tight">{currentSong.title}</h2>
            <p className="text-xl font-bold text-white/70 truncate mt-2">{currentSong.artist}</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => toggleLike(currentSong)} className="text-white/70 hover:text-white shrink-0 h-14 w-14">
               <Heart className={cn("text-[28px] drop-shadow-md", likedSongs.has(currentSong.videoId) ? "fill-white text-white scale-110" : "")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white shrink-0 h-14 w-14"><MoreIcon className="text-[28px] drop-shadow-md"/></Button>
              </DropdownMenuTrigger>
              <PlayerMenuOptions song={currentSong} />
            </DropdownMenu>
          </div>
        </div>
        <div className="w-full mb-8">
          <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="[&_[data-slot=range]]:bg-white [&_[data-slot=thumb]]:bg-white [&_[data-slot=thumb]]:h-4 [&_[data-slot=thumb]]:w-4 [&_[data-slot=track]]:h-1.5 [&_[data-slot=track]]:bg-white/20" />
          <div className="flex justify-between text-xs font-bold text-white/60 mt-3 tracking-widest">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between w-full mb-10 px-2">
          <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("text-white/50 h-14 w-14", shuffle && "text-white bg-white/10 rounded-full")}><Shuffle className="text-[28px]" /></Button>
          <Button variant="ghost" size="icon" onClick={playPrevious} className="text-white h-16 w-16"><SkipBack className="text-[40px]" /></Button>
          <Button variant="ghost" size="icon" onClick={togglePlay} className="h-24 w-24 p-0 text-white flex items-center justify-center">
             {isPlaying ? <Pause className="text-[64px] drop-shadow-2xl" /> : <Play className="text-[64px] drop-shadow-2xl translate-x-[2px]" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext} className="text-white h-16 w-16"><SkipForward className="text-[40px]" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off")} className={cn("text-white/50 h-14 w-14", repeatMode !== "off" && "text-white bg-white/10 rounded-full")}><Repeat className="text-[28px]" /></Button>
        </div>
        
        <div className="flex items-center gap-4 w-full opacity-60 hover:opacity-100 transition-opacity text-white px-4">
          <VolumeIcon className="text-[20px]" />
          <Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1 [&_[data-slot=range]]:bg-white [&_[data-slot=thumb]]:h-4 [&_[data-slot=thumb]]:w-4 [&_[data-slot=track]]:h-1.5 [&_[data-slot=track]]:bg-white/20" />
        </div>
      </div>
    </div>
  )

  const renderExpressivePlayer = () => (
    <div className="flex flex-col items-center min-h-full py-8 w-full max-w-[480px] animate-in slide-in-from-bottom-8 duration-700 relative m-auto px-6">
      <div className={cn("w-64 h-64 mx-auto overflow-hidden shadow-[0_0_80px_rgba(var(--primary),0.5)] relative mb-12 shrink-0 flex items-center justify-center rounded-full border-[6px] border-background transition-transform duration-1000", isPlaying ? "animate-[spin_10s_linear_infinite] scale-105" : "scale-100")}>
         <img src={currentSong.thumbnail} className="w-full h-full object-cover" />
         <div className="absolute inset-0 border-[8px] border-primary/20 rounded-full pointer-events-none" />
         <div className="absolute w-14 h-14 bg-background rounded-full border-[6px] border-primary/20 shadow-inner z-10" />
      </div>
      <div className="w-full text-center mb-8 px-4 bg-card/40 backdrop-blur-3xl py-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
         <div className="absolute right-4 top-4 flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => toggleLike(currentSong)} className="text-muted-foreground hover:bg-muted/50 rounded-full h-10 w-10">
               <Heart className={cn("text-[20px] transition-all", likedSongs.has(currentSong.videoId) ? "fill-[var(--primary)] text-[var(--primary)] scale-110" : "text-current")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 rounded-full h-10 w-10"><MoreIcon className="text-[20px]"/></Button>
              </DropdownMenuTrigger>
              <PlayerMenuOptions song={currentSong} />
            </DropdownMenu>
         </div>

         <div className="px-4 mt-6">
            <h2 className="text-3xl font-black truncate text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">{currentSong.title}</h2>
            <p className="text-base font-bold text-muted-foreground truncate uppercase tracking-[0.2em]">{currentSong.artist}</p>
         </div>
         
         <div className="w-full mt-10 mb-8 px-6">
            <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="[&_[data-slot=range]]:bg-gradient-to-r [&_[data-slot=range]]:from-primary [&_[data-slot=range]]:to-secondary [&_[data-slot=thumb]]:h-6 [&_[data-slot=thumb]]:w-6 [&_[data-slot=thumb]]:border-[5px] [&_[data-slot=thumb]]:border-primary [&_[data-slot=track]]:h-3 [&_[data-slot=track]]:bg-muted rounded-full" />
            <div className="flex justify-between text-xs font-bold text-muted-foreground mt-3 uppercase tracking-widest px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
         </div>

         <div className="flex items-center justify-center gap-8 w-full px-4">
            <Button variant="outline" size="icon" onClick={playPrevious} className="h-16 w-16 p-0 rounded-full bg-background shadow-lg text-primary flex items-center justify-center border-none"><SkipBack className="text-[32px]" /></Button>
            <Button size="icon" onClick={togglePlay} className="h-24 w-24 p-0 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-xl hover:scale-110 transition-transform">
               {isPlaying ? <Pause className="text-[40px]" /> : <Play className="text-[40px] translate-x-[2px]" />}
            </Button>
            <Button variant="outline" size="icon" onClick={playNext} className="h-16 w-16 p-0 rounded-full bg-background shadow-lg text-primary flex items-center justify-center border-none"><SkipForward className="text-[32px]" /></Button>
         </div>
      </div>
      <VolumeControls className="mt-0 pb-0" />
    </div>
  )

  const renderImmersivePlayer = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center w-full animate-in fade-in duration-1000 z-50 overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
         <img src={currentSong.thumbnail} className={cn("w-full h-full object-cover blur-[100px] opacity-60 scale-125 transition-transform duration-[10s]", isPlaying && "scale-150")} />
         <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90" />
      </div>
      
      <div className="w-[85vw] max-w-[380px] aspect-square rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-10 mb-10 border border-white/10">
         <img src={currentSong.thumbnail} className={cn("w-full h-full object-cover transition-transform duration-[3s] ease-out", isPlaying ? "scale-105" : "scale-100")} />
      </div>
      
      <div className="w-full max-w-[420px] bg-white/10 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/20 z-10 text-white shadow-2xl mx-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-3xl font-extrabold truncate drop-shadow-sm tracking-tight">{currentSong.title}</h2>
            <p className="text-lg font-semibold text-white/70 truncate mt-1">{currentSong.artist}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => toggleLike(currentSong)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full h-12 w-12 shrink-0 flex items-center justify-center p-0">
               <Heart className={cn("text-[24px]", likedSongs.has(currentSong.videoId) ? "fill-white text-white" : "")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full h-12 w-12 shrink-0 flex items-center justify-center p-0"><MoreIcon className="text-[24px]"/></Button>
              </DropdownMenuTrigger>
              <PlayerMenuOptions song={currentSong} />
            </DropdownMenu>
          </div>
        </div>
        
        <div className="w-full mb-8 relative z-10">
          <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="mb-4 [&_[data-slot=range]]:bg-white [&_[data-slot=thumb]]:bg-white [&_[data-slot=thumb]]:h-5 [&_[data-slot=thumb]]:w-5 [&_[data-slot=track]]:h-2 [&_[data-slot=track]]:bg-white/20" />
          <div className="flex justify-between text-xs font-bold text-white/60 mt-2 tracking-widest">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full px-2 mb-8 relative z-10">
          <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("text-white/50 hover:text-white flex items-center justify-center p-0 h-12 w-12 rounded-full", shuffle && "text-white bg-white/10")}><Shuffle className="text-[24px]" /></Button>
          <Button variant="ghost" size="icon" onClick={playPrevious} className="text-white hover:bg-white/20 flex items-center justify-center p-0 h-16 w-16 rounded-full"><SkipBack className="text-[36px]" /></Button>
          <Button variant="ghost" size="icon" onClick={togglePlay} className="h-20 w-20 p-0 text-white hover:bg-white/20 bg-white/10 rounded-full flex items-center justify-center shadow-lg">
             {isPlaying ? <Pause className="text-[48px]" /> : <Play className="text-[48px] translate-x-[2px]" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext} className="text-white hover:bg-white/20 flex items-center justify-center p-0 h-16 w-16 rounded-full"><SkipForward className="text-[36px]" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off")} className={cn("text-white/50 hover:text-white flex items-center justify-center p-0 h-12 w-12 rounded-full", repeatMode !== "off" && "text-white bg-white/10")}><Repeat className="text-[24px]" /></Button>
        </div>
        
        <div className="flex items-center gap-4 w-full px-4 opacity-60 hover:opacity-100 transition-opacity text-white relative z-10">
          <VolumeIcon className="text-[20px]" />
          <Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1 [&_[data-slot=range]]:bg-white [&_[data-slot=thumb]]:h-4 [&_[data-slot=thumb]]:w-4 [&_[data-slot=track]]:h-1.5 [&_[data-slot=track]]:bg-white/20" />
        </div>
      </div>
    </div>
  )

  const renderMobilePlayerContent = () => {
    switch(playerStyle) {
      case 'Open': return renderOpenPlayer();
      case 'Modern': return renderModernPlayer();
      case 'Minimal': return renderMinimalPlayer();
      case 'Cinematic': return renderCinematicPlayer();
      case 'Expressive': return renderExpressivePlayer();
      case 'Immersive': return renderImmersivePlayer();
      default: return renderClassicPlayer();
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden font-sans relative z-0 bg-background transition-colors duration-1000">
      
      {/* Global CSS Injections for Themes and Settings */}
      {colorTheme !== 'default' && (
        <style dangerouslySetInnerHTML={{__html: `
          :root, .dark {
            --primary: ${activeTheme.primary};
            --ring: ${activeTheme.primary};
          }
        `}} />
      )}

      {disableAnimations && (
        <style dangerouslySetInnerHTML={{__html: `
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            scroll-behavior: auto !important;
          }
        `}} />
      )}

      {disableBlur && (
        <style dangerouslySetInnerHTML={{__html: `
          * {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            filter: none !important;
          }
        `}} />
      )}

      <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div ref={ytParentRef}></div>
      </div>

      {dynamicTheme && playerBgStyle === 'Gradient' && (
        <>
          <div 
            className="absolute inset-0 z-[-2] transition-colors duration-1000 ease-in-out" 
            style={{ backgroundColor: dominantColor || 'transparent' }} 
          />
          <div 
            className={cn(
              "absolute inset-0 z-[-1] bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none transition-opacity duration-1000 ease-in-out",
              dominantColor ? "opacity-100" : "opacity-0"
            )} 
          />
        </>
      )}

      {dynamicTheme && playerBgStyle === 'Blur' && (
        <div className={cn(
          "absolute inset-0 z-[-2] overflow-hidden pointer-events-none bg-background transition-opacity duration-1000 ease-in-out",
          currentSong ? "opacity-100" : "opacity-0"
        )}>
          <img 
            key={currentSong?.videoId || 'empty'}
            src={currentSong?.thumbnail || ''} 
            className={cn(
              "w-full h-full object-cover blur-3xl opacity-40 will-change-transform transform-gpu",
              !reduceMotion && "scale-[1.2]",
              currentSong ? (reduceMotion ? "animate-in fade-in duration-500" : "animate-in fade-in duration-1000") : ""
            )} 
          />
        </div>
      )}

      {/* Header Layout Optimized */}
      <header className="elevation-1 z-40 flex h-16 flex-shrink-0 items-center justify-between px-3 md:px-6 transition-all duration-500 ease-out relative bg-background/90 backdrop-blur-xl border-b border-border/40 gap-2">
        <div className={cn(
          "flex items-center shrink-0 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] origin-left whitespace-nowrap overflow-hidden", 
          searchFocused ? "max-w-0 opacity-0 gap-0 border-0 p-0 mr-0 md:max-w-[280px] md:opacity-100 md:gap-3 md:mr-4" : "max-w-[280px] opacity-100 mr-2 md:mr-4 gap-3"
        )}>
          <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-primary shadow-lg", !reduceMotion && "transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110")}>
            <Music2 className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          <div className="hidden sm:flex items-baseline pl-1 opacity-100 transition-opacity duration-300">
            <span className="text-xl font-normal text-muted-foreground tracking-tight">Ganvo</span>
            <span className="text-[20px] font-extrabold tracking-tight text-foreground ml-1">Music</span>
          </div>
        </div>

        {/* Search bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-2xl mx-auto w-full transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground transition-colors" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className={cn(
                "h-11 md:h-12 w-full rounded-full border-0 bg-muted/80 pl-12 pr-12 text-base shadow-none transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] text-foreground outline-none focus:outline-none focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-card focus-visible:shadow-lg sm:placeholder:text-transparent md:placeholder:text-muted-foreground",
                searchFocused && "bg-card shadow-lg ring-2 ring-primary",
                searchFocused && !reduceMotion && "scale-[1.01] md:scale-100"
              )}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSearchQuery(""); setSearchResults([]) }}
                className={cn("absolute right-2 h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95", !reduceMotion && "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110")}
              >
                <X className="h-4 w-4 text-current" />
              </Button>
            )}
          </div>

          {/* Search Dropdown max width container resolved */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full z-[60] mt-3 flex flex-col overflow-hidden rounded-[1.5rem] border bg-card shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ease-out max-w-full">
              <div className={cn("flex-1 overflow-y-auto min-h-0 overscroll-contain transition-all duration-500", isSearchExpanded ? "max-h-[70vh]" : "max-h-[400px]")}>
                <div className="p-2">
                  {searchQuery.trim() === "" ? (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Searches</span>
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setSearchHistory([]); localStorage.removeItem('ganvo_search_history') }} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">CLEAR</button>
                      </div>
                      {searchHistory.map((historyItem, idx) => (
                        <button key={`history-${idx}`} onMouseDown={(e) => e.preventDefault()} onClick={() => setSearchQuery(historyItem)} className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-all duration-200 hover:bg-muted active:scale-[0.98] text-foreground">
                          <div className="p-2 rounded-full bg-muted/50"><History className="h-4 w-4 text-muted-foreground opacity-70" /></div>
                          <span className="font-semibold text-sm">{historyItem}</span>
                        </button>
                      ))}
                    </div>
                  ) : isSearching && searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary mb-3" /><span className="text-muted-foreground font-semibold">Searching...</span></div>
                  ) : (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center justify-between p-3 mb-2 border-b bg-muted/20 rounded-[1rem]">
                        <span className="text-xs font-extrabold text-muted-foreground ml-3 tracking-widest uppercase">Results</span>
                        <Select value={searchSort} onValueChange={(v: any) => setSearchSort(v)}>
                          <SelectTrigger className="h-8 text-xs w-[130px] rounded-full border-none bg-muted font-bold text-foreground outline-none focus:ring-0"><SelectValue placeholder="Sort" /></SelectTrigger>
                          <SelectContent className="rounded-2xl z-[400]"><SelectItem value="relevance" className="font-bold text-xs py-2 rounded-lg">Relevance</SelectItem><SelectItem value="az" className="font-bold text-xs py-2 rounded-lg">A - Z</SelectItem><SelectItem value="za" className="font-bold text-xs py-2 rounded-lg">Z - A</SelectItem></SelectContent>
                        </Select>
                      </div>
                      {sortedSearchResults.slice(0, isSearchExpanded ? undefined : 6).map((song, index) => (
                        <button key={song.videoId} onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToQueueAndPlay(song) }} className={cn("song-card active:scale-[0.98] flex w-full items-center gap-4 rounded-[1.25rem] p-3 text-left hover:bg-secondary/60 text-foreground", !reduceMotion && "transition-all duration-300 ease-out")} style={{ animationDelay: `${index * 30}ms` }}>
                          <img src={song.thumbnail || "/placeholder.svg"} alt={song.title} className={cn("aspect-square h-14 w-14 rounded-xl object-cover shadow-sm", !reduceMotion && "transition-transform duration-500 hover:scale-110")} />
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate font-bold leading-tight text-foreground">{song.title}</p>
                            <p className="truncate text-sm font-medium text-muted-foreground mt-1">{song.artist} {song.album && `• ${song.album}`}</p>
                          </div>
                          <span className="flex-shrink-0 text-xs font-bold text-muted-foreground/80 tracking-widest">{formatTime(song.duration)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {searchQuery.trim() !== "" && searchResults.length > 6 && (
                <div className="flex-shrink-0 border-t bg-card/80 backdrop-blur-xl p-3">
                  <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsSearchExpanded(!isSearchExpanded) }} className="w-full justify-center gap-2 rounded-xl h-10 font-bold hover:bg-primary/10 text-foreground transition-all duration-300 active:scale-[0.98]">
                    {isSearchExpanded ? <><ChevronUp className="h-4 w-4 transition-transform duration-300 text-current" />Show less</> : <><ChevronDown className="h-4 w-4 transition-transform duration-300 text-current" />Show all {searchResults.length} results</>}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side Profile Header Interface */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0 ml-2">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className={cn("hidden sm:flex h-10 w-10 rounded-full text-foreground hover:bg-muted active:scale-90 outline-none focus:outline-none focus-visible:outline-none", !reduceMotion && "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110")}>
            {isFullscreen ? <Minimize className="h-5 w-5 fill-current" /> : <Maximize className="h-5 w-5 fill-current" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-full text-foreground hover:bg-muted active:scale-90 outline-none focus:outline-none focus-visible:outline-none", !reduceMotion && "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110")}>
                {user ? (
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm uppercase shadow-sm">
                    {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0) || "U"}
                  </div>
                ) : (
                  <UserCircle2 className="h-6 w-6 text-current" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl animate-in fade-in zoom-in-95 duration-300 ease-out p-2 shadow-xl border-border/50 z-[250]">
              {user ? (
                <div className="px-3 py-2.5 mb-1 bg-muted/50 rounded-xl">
                  <p className="text-sm font-bold truncate text-foreground">{user.displayName || "Library Synced"}</p>
                  <p className="text-xs font-medium text-muted-foreground truncate">{user.email}</p>
                </div>
              ) : (
                <div className="px-2 py-2 mb-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Account</p>
                  <Button onClick={() => setShowAuthDialog(true)} className="w-full justify-start rounded-xl h-10 font-bold transition-all active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90" size="sm">Sign In / Sign Up</Button>
                </div>
              )}
              <DropdownMenuSeparator className="my-2"/>
              {user && (
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setShowAccountSettings(true), 100); }} className="cursor-pointer gap-3 rounded-xl py-3 font-semibold transition-colors active:scale-[0.98] text-foreground">
                  <UserCircle2 className="h-5 w-5 text-muted-foreground text-current" /> Account Details
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setShowPlayerSettings(true), 100); }} className="cursor-pointer gap-3 rounded-xl py-3 font-semibold transition-colors active:scale-[0.98] text-foreground">
                <Settings className="h-5 w-5 text-muted-foreground text-current" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setShowAboutDialog(true), 100); }} className="cursor-pointer gap-3 rounded-xl py-3 font-semibold transition-colors active:scale-[0.98] text-foreground">
                <Info className="h-5 w-5 text-muted-foreground text-current" /> About Ganvo
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator className="my-2"/>
                  <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer gap-3 rounded-xl py-3 font-bold text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors active:scale-[0.98]">
                    <LogOut className="h-5 w-5 text-current" /> Sign Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Center Explore Feed Core Logic Data  */}
      <div className="flex flex-1 overflow-hidden min-h-0 bg-transparent relative">
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0 z-10 pb-40 lg:pb-0 transition-all duration-500 ease-out">
          {activeTab === 'explore' ? (
             <div className="p-6 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
               <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-foreground">Explore</h2>
               <p className="text-muted-foreground font-semibold mb-12 text-lg">Discover top global artists and trending music.</p>
               
               {isExploreLoading ? (
                 <div className="flex flex-col items-center justify-center py-32"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="font-bold text-lg text-muted-foreground">Discovering Music...</p></div>
               ) : exploreError ? (
                 <div className="flex flex-col items-center justify-center py-32 text-center"><TrendingUp className="h-20 w-20 text-muted-foreground/40 mb-6" /><p className="font-black text-3xl mb-2 text-foreground">Explore Unavailable</p><p className="text-base font-medium text-muted-foreground max-w-[350px]">Servers are temporarily busy. Use the search bar to find music.</p></div>
               ) : (
                 <div className="space-y-14">
                   {!hideCreatorsPicks && exploreData?.creatorsPicks?.length > 0 && (
                     <ScrollableRow title="Creator's Top Picks" icon={Star}>
                        {exploreData.creatorsPicks.map((song, idx) => (
                          <div key={idx} onClick={() => addToQueueAndPlay(song)} className="group flex flex-col gap-3 w-40 sm:w-48 shrink-0 cursor-pointer snap-start transition-all">
                            <div className={cn("overflow-hidden rounded-[2rem] shadow-lg aspect-square relative", !reduceMotion && "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-active:scale-95")}>
                              <img src={song.thumbnail} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <Play className="text-[48px] text-white" />
                              </div>
                            </div>
                            <div className="px-2">
                              <p className="font-extrabold text-base truncate text-foreground group-hover:text-primary transition-colors">{song.title}</p>
                              <p className="text-sm font-semibold text-muted-foreground mt-0.5 truncate">{song.artist}</p>
                            </div>
                          </div>
                        ))}
                     </ScrollableRow>
                   )}
                   {exploreData?.artists?.length > 0 && (
                     <ScrollableRow title="Top Artists" icon={UserCircle2}>
                        {exploreData.artists.map((artist, idx) => (
                          <div key={artist.artistId || idx} onClick={() => loadArtistView(artist.artistId)} className="group flex flex-col items-center gap-4 cursor-pointer snap-start w-36 sm:w-44 shrink-0 transition-all">
                            <div className={cn("relative w-full aspect-square rounded-full overflow-hidden shadow-xl", !reduceMotion && "transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-active:scale-95")}>
                              <img src={artist.thumbnail || "/placeholder.svg"} alt={artist.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="text-center w-full px-2">
                              <p className="font-extrabold text-base truncate transition-colors group-hover:text-primary text-foreground">{artist.name}</p>
                              <p className="text-xs text-muted-foreground font-semibold mt-1 tracking-wider uppercase">{artist.subscribers}</p>
                            </div>
                          </div>
                        ))}
                     </ScrollableRow>
                   )}
                   {exploreData?.songs?.length > 0 && (
                     <div>
                       <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground"><TrendingUp className="h-6 w-6 text-primary"/> Top Songs</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {exploreData.songs.slice(0, 9).map((song, idx) => (
                            <div key={idx} className="group flex items-center gap-4 p-3 rounded-[1.5rem] hover:bg-muted/80 transition-colors duration-300 ease-out bg-card shadow-sm border border-border/40">
                              <img src={song.thumbnail} className={cn("aspect-square h-16 w-16 rounded-[1rem] object-cover shadow-sm", !reduceMotion && "transition-transform duration-500 group-hover:scale-105")} />
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="font-bold text-base truncate text-foreground">{song.title}</p>
                                <p className="text-sm font-semibold text-muted-foreground truncate mt-0.5">{song.artist}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:outline-none"><ListPlus className="h-5 w-5 text-current" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                                  <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                                  {playlists.map(pl => (
                                    <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-95 text-foreground"><ListMusic className="h-4 w-4 mr-3 text-primary"/>{pl.name}</DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(song)} className="rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 text-foreground h-12 w-12 bg-secondary hover:bg-secondary/80 outline-none focus:outline-none flex items-center justify-center p-0 shadow-md">
                                <Play className="text-[24px] translate-x-[1px]"/>
                              </Button>
                            </div>
                          ))}
                       </div>
                     </div>
                   )}
                   {exploreData?.albums?.length > 0 && (
                     <ScrollableRow title="Top Albums" icon={Disc3}>
                        {exploreData.albums.map((album, idx) => (
                          <div key={idx} onClick={() => loadAlbumView(album.albumId)} className="flex flex-col gap-3 w-40 sm:w-48 shrink-0 group cursor-pointer snap-start transition-all">
                            <div className={cn("overflow-hidden rounded-[2rem] shadow-md aspect-square relative", !reduceMotion && "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-active:scale-95")}>
                              <img src={album.thumbnail} className="w-full h-full object-cover" />
                            </div>
                            <div className="px-2">
                              <p className="font-extrabold text-base truncate text-foreground group-hover:text-primary transition-colors">{album.title}</p>
                              <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{album.artist} • {album.year}</p>
                            </div>
                          </div>
                        ))}
                     </ScrollableRow>
                   )}
                 </div>
               )}
             </div>
          ) : activeTab === 'artist' ? (
             <div className="p-4 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
                <Button variant="ghost" onClick={() => setActiveTab('explore')} className="mb-6 -ml-2 md:-ml-4 gap-2 font-bold text-muted-foreground hover:text-foreground transition-all outline-none focus:outline-none h-12 rounded-full px-4"><SkipBack className="h-5 w-5" /> Back to Explore</Button>
                {isArtistLoading ? (
                  <div className="flex flex-col items-center justify-center py-32"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="font-bold text-lg text-muted-foreground">Loading Artist Profile...</p></div>
                ) : currentArtistData ? (
                  <div className="animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-12 p-6 md:p-10 bg-card/50 rounded-[3rem] border shadow-sm backdrop-blur-sm">
                      <img src={currentArtistData.thumbnails?.[currentArtistData.thumbnails.length-1]?.url || "/placeholder.svg"} alt={currentArtistData.name} className="aspect-square w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-2xl" />
                      <div className="text-center md:text-left flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-sm mb-3 uppercase tracking-[0.2em]"><MicVocal className="h-5 w-5 text-current"/> Artist</div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4 text-foreground">{currentArtistData.name}</h1>
                        <p className="text-muted-foreground font-semibold mb-6 text-xl">{currentArtistData.subscribers}</p>
                        <p className="text-base leading-relaxed max-w-3xl text-muted-foreground/90 line-clamp-3 md:line-clamp-none font-medium">{currentArtistData.description}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground"><TrendingUp className="h-6 w-6 text-primary"/> Top Songs</h3>
                    <div className="space-y-2 mb-14 bg-card p-3 md:p-6 rounded-[2.5rem] border shadow-sm">
                      {currentArtistData.topSongs?.map((song: any, idx: number) => (
                        <div key={song.videoId} className="group flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-[1.5rem] hover:bg-muted/80 transition-colors duration-300 ease-out">
                          <span className="w-8 text-center font-bold text-muted-foreground/50">{idx + 1}</span>
                          <img src={song.thumbnail} className={cn("aspect-square h-14 w-14 rounded-[1rem] object-cover shadow-sm", !reduceMotion && "transition-transform duration-500 group-hover:scale-105")} />
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-bold text-base truncate text-foreground">{song.title}</p>
                            <p className="text-sm font-medium text-muted-foreground truncate mt-0.5">{song.album}</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:outline-none"><ListPlus className="h-6 w-6 text-current" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                              <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                              {playlists.map(pl => (
                                <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-[0.98] text-foreground"><ListMusic className="h-4 w-4 mr-3 text-primary"/>{pl.name}</DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(song)} className="rounded-full font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 shadow-md text-foreground h-12 w-12 bg-secondary hover:bg-secondary/80 outline-none focus:outline-none flex items-center justify-center p-0">
                            <Play className="text-[20px] translate-x-[1px]"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleLike(song)} className={cn("text-muted-foreground hover:text-[var(--google-red)] transition-all outline-none focus:outline-none flex items-center justify-center p-0 h-12 w-12 rounded-full", likedSongs.has(song.videoId) && "text-[var(--google-red)]")}>
                            <Heart className={cn("h-6 w-6", likedSongs.has(song.videoId) && "fill-current text-current")} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {currentArtistData.albums?.length > 0 && (
                      <div className="mb-14">
                        <ScrollableRow title="Albums" icon={Disc3}>
                            {currentArtistData.albums.map((album: any, idx: number) => (
                              <div key={idx} onClick={() => loadAlbumView(album.albumId)} className="flex flex-col gap-3 w-40 sm:w-48 shrink-0 group cursor-pointer snap-start transition-all">
                                <div className={cn("overflow-hidden rounded-[2rem] shadow-lg aspect-square relative", !reduceMotion && "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-active:scale-95")}>
                                  <img src={album.thumbnail} className="w-full h-full object-cover" />
                                </div>
                                <div className="px-2">
                                  <p className="font-extrabold text-base truncate text-foreground group-hover:text-primary transition-colors">{album.title}</p>
                                  <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mt-1">{album.year}</p>
                                </div>
                              </div>
                            ))}
                        </ScrollableRow>
                      </div>
                    )}
                    
                    {currentArtistData.singles?.length > 0 && (
                      <div className="mb-10">
                        <ScrollableRow title="Singles & EPs" icon={Music2}>
                            {currentArtistData.singles.map((single: any, idx: number) => (
                              <div key={idx} onClick={() => loadAlbumView(single.albumId)} className="flex flex-col gap-3 w-40 sm:w-48 shrink-0 group cursor-pointer snap-start transition-all">
                                <div className={cn("overflow-hidden rounded-[2rem] shadow-lg aspect-square relative", !reduceMotion && "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-active:scale-95")}>
                                  <img src={single.thumbnail} className="w-full h-full object-cover" />
                                </div>
                                <div className="px-2">
                                  <p className="font-extrabold text-base truncate text-foreground group-hover:text-primary transition-colors">{single.title}</p>
                                  <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mt-1">{single.year}</p>
                                </div>
                              </div>
                            ))}
                        </ScrollableRow>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-foreground">Failed to load artist.</p>
                )}
             </div>
          ) : activeTab === 'album' ? (
            <div className="p-4 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
                <Button variant="ghost" onClick={() => setActiveTab('explore')} className="mb-6 -ml-2 md:-ml-4 gap-2 font-bold text-muted-foreground hover:text-foreground transition-all outline-none focus:outline-none h-12 rounded-full px-4"><SkipBack className="h-5 w-5" /> Back</Button>
                {isAlbumLoading ? (
                  <div className="flex flex-col items-center justify-center py-32"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="font-bold text-lg text-muted-foreground">Loading Album...</p></div>
                ) : currentAlbumData ? (
                  <div className="animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mb-12 p-6 md:p-10 bg-card/20 rounded-[3rem]">
                      <img src={currentAlbumData.thumbnails?.[currentAlbumData.thumbnails.length-1]?.url || "/placeholder.svg"} alt={currentAlbumData.name} className="aspect-square w-56 h-56 md:w-72 md:h-72 rounded-[2.5rem] object-cover shadow-2xl" />
                      <div className="text-center md:text-left flex-1 flex flex-col justify-end">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-sm mb-3 uppercase tracking-[0.2em]"><Disc3 className="h-5 w-5 text-current"/> Album</div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-foreground leading-tight">{currentAlbumData.name}</h1>
                        <p className="text-muted-foreground font-semibold mb-8 text-xl cursor-pointer hover:underline hover:text-primary transition-colors" onClick={() => currentAlbumData.songs[0]?.artistId && loadArtistView(currentAlbumData.songs[0].artistId)}>{currentAlbumData.artist} • {currentAlbumData.year}</p>
                        <div className="flex gap-4 justify-center md:justify-start">
                          <Button onClick={() => addToQueueAndPlay(currentAlbumData.songs[0])} className="rounded-[2rem] font-bold text-lg px-10 h-16 shadow-xl hover:scale-105 active:scale-95 transition-all bg-primary text-primary-foreground outline-none focus:outline-none flex items-center justify-center p-0">
                            <Play className="text-[28px] mr-3"/> Play Album
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-14 bg-card p-3 md:p-6 rounded-[2.5rem] border shadow-sm">
                      {currentAlbumData.songs?.map((song: any, idx: number) => (
                        <div key={song.videoId} className="group flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-[1.5rem] hover:bg-muted/80 transition-colors duration-300 ease-out">
                          <span className="w-8 text-center font-bold text-muted-foreground/50">{idx + 1}</span>
                          <div className="flex-1 min-w-0 pl-2">
                            <p className="font-bold text-base truncate text-foreground">{song.title}</p>
                            <p className="text-sm font-medium text-muted-foreground truncate mt-0.5">{song.artist}</p>
                          </div>
                          <span className="text-sm font-bold tabular-nums text-muted-foreground/50 mr-2">{formatTime(song.duration)}</span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:outline-none"><ListPlus className="h-6 w-6 text-current" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                              <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                              {playlists.map(pl => (
                                <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-[0.98] text-foreground"><ListMusic className="mr-3 h-4 w-4 text-primary"/>{pl.name}</DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(song)} className="rounded-full font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 shadow-md text-foreground h-12 w-12 bg-secondary hover:bg-secondary/80 outline-none focus:outline-none flex items-center justify-center p-0">
                            <Play className="text-[20px] translate-x-[1px]"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleLike(song)} className={cn("text-muted-foreground hover:text-[var(--google-red)] transition-all outline-none focus:outline-none flex items-center justify-center p-0 h-12 w-12 rounded-full", likedSongs.has(song.videoId) && "text-[var(--google-red)]")}>
                            <Heart className={cn("h-6 w-6", likedSongs.has(song.videoId) && "fill-current text-current")} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground">Failed to load album.</p>
                )}
             </div>
          ) : activeTab === 'playlistView' && currentPlaylistView ? (
             <div className="p-4 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
                <Button variant="ghost" onClick={() => setActiveTab('library')} className="mb-6 -ml-2 md:-ml-4 gap-2 font-bold text-muted-foreground hover:text-foreground transition-all outline-none focus:outline-none h-12 rounded-full px-4">
                  <SkipBack className="h-5 w-5" /> Back to Library
                </Button>
                <div className="animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mb-12 p-6 md:p-10 bg-card/20 rounded-[3rem]">
                    <div className="w-56 h-56 md:w-72 md:h-72 rounded-[2.5rem] object-cover shadow-2xl bg-primary/10 flex items-center justify-center">
                      <ListMusic className="h-24 w-24 text-primary" />
                    </div>
                    <div className="text-center md:text-left flex-1 flex flex-col justify-end">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-sm mb-3 uppercase tracking-[0.2em]"><ListPlus className="h-5 w-5 text-current"/> Playlist</div>
                      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-foreground leading-tight">{currentPlaylistView.name}</h1>
                      <p className="text-muted-foreground font-semibold mb-8 text-xl">{currentPlaylistView.songs.length} songs</p>
                      <div className="flex gap-4 justify-center md:justify-start">
                        <Button onClick={() => {if(currentPlaylistView.songs.length>0) addToQueueAndPlay(currentPlaylistView.songs[0])}} disabled={currentPlaylistView.songs.length===0} className="rounded-[2rem] font-bold text-lg px-10 h-16 shadow-xl hover:scale-105 active:scale-95 transition-all bg-primary text-primary-foreground outline-none focus:outline-none flex items-center justify-center p-0">
                          <Play className="text-[28px] mr-3"/> Play Playlist
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {currentPlaylistView.songs.length > 0 ? (
                    <div className="space-y-2 mb-14 bg-card p-3 md:p-6 rounded-[2.5rem] border shadow-sm">
                      {currentPlaylistView.songs.map((song: any, idx: number) => (
                        <div key={song.videoId} className="group flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-[1.5rem] hover:bg-muted/80 transition-colors duration-300 ease-out">
                          <span className="w-8 text-center font-bold text-muted-foreground/50">{idx + 1}</span>
                          <img src={song.thumbnail} className={cn("aspect-square h-14 w-14 rounded-[1rem] object-cover shadow-sm", !reduceMotion && "transition-transform duration-500 group-hover:scale-105")} />
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-bold text-base truncate text-foreground">{song.title}</p>
                            <p className="text-sm font-medium text-muted-foreground truncate mt-0.5">{song.artist}</p>
                          </div>
                          <span className="text-sm font-bold tabular-nums text-muted-foreground/50 mr-4">{formatTime(song.duration)}</span>
                          
                          <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(song)} className="rounded-full font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 shadow-md text-foreground h-12 w-12 bg-secondary hover:bg-secondary/80 outline-none focus:outline-none flex items-center justify-center p-0">
                            <Play className="text-[20px] translate-x-[1px]"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleLike(song)} className={cn("text-muted-foreground hover:text-[var(--google-red)] transition-all outline-none focus:outline-none flex items-center justify-center p-0 h-12 w-12 rounded-full", likedSongs.has(song.videoId) && "text-[var(--google-red)]")}>
                            <Heart className={cn("h-6 w-6", likedSongs.has(song.videoId) && "fill-current text-current")} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                      <ListMusic className="h-16 w-16 text-muted-foreground/40 mb-6" />
                      <p className="font-black text-2xl mb-2 text-foreground">Empty Playlist</p>
                      <p className="text-base font-medium text-muted-foreground">Add songs from the explore page or search.</p>
                    </div>
                  )}
                </div>
             </div>
          ) :['player', 'lyrics', 'queue', 'library'].includes(activeTab) ? (
            <div className="flex flex-1 flex-col items-center px-4 py-8 md:px-8 md:py-12 relative min-h-full">
              {loadError && (
                <div className="absolute top-4 bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-xl z-50 animate-in fade-in slide-in-from-top-4 text-center mx-4">
                  {loadError}
                </div>
              )}
              {currentSong ? (
                renderMobilePlayerContent()
              ) : (
                <div className="flex flex-col items-center px-4 text-center animate-in fade-in zoom-in-95 duration-700 ease-out m-auto">
                  <div className={cn("mb-8 flex h-48 w-48 items-center justify-center rounded-[3rem] bg-muted/50 shadow-inner", !reduceMotion && "transition-all duration-700 hover:scale-105")}>
                    <Music2 className={cn("h-24 w-24 text-muted-foreground/40", !reduceMotion && "transition-transform duration-700")} />
                  </div>
                  <h2 className="mb-4 text-4xl font-black tracking-tight text-foreground transition-colors">Start Listening</h2>
                  <p className="max-w-md text-lg font-medium text-muted-foreground/80 leading-relaxed transition-colors">
                    Search for songs or check the Explore tab to find music.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Desktop Sidebar - Queue, Lyrics, Library */}
        <div className="hidden w-80 flex-col border-l border-border/40 bg-card/40 backdrop-blur-2xl lg:flex xl:w-[420px] overflow-hidden min-h-0 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-20 transition-all duration-500">
          <div className="flex p-3 gap-2 bg-muted/20 border-b border-border/40 flex-wrap transition-colors duration-300 relative">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-muted/20 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-muted/20 to-transparent z-10 pointer-events-none" />
            <div className="flex w-full overflow-x-auto no-scrollbar gap-2 px-2 snap-x">
              {['player', 'explore', 'queue', 'lyrics', 'library'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ease-out active:scale-95 shrink-0 snap-center outline-none focus:outline-none",
                    activeTab === tab ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {tab === 'player' && <Play className="text-[16px]" />}
                  {tab === 'explore' && <TrendingUp className="h-4 w-4 text-current" />}
                  {tab === 'queue' && <ListMusic className="h-4 w-4 text-current" />}
                  {tab === 'lyrics' && <Mic2 className="h-4 w-4 text-current" />}
                  {tab === 'library' && <Library className="h-4 w-4 text-current" />}
                  <span className="capitalize hidden xl:inline tracking-wide">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={cn(
            "flex-1 min-h-0 overscroll-contain transition-all duration-500",['lyrics', 'queue', 'library'].includes(activeTab) ? "overflow-hidden flex flex-col" : "overflow-y-auto"
          )}>
            {activeTab === 'explore' || activeTab === 'artist' || activeTab === 'player' || activeTab === 'album' || activeTab === 'playlistView' ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Music2 className="h-16 w-16 text-muted-foreground/40 mb-6" />
                <p className="font-extrabold text-xl text-foreground capitalize">{activeTab} is open</p>
                <p className="text-sm font-medium text-muted-foreground mt-2">Check the main view on the left.</p>
              </div>
            ) : activeTab === 'lyrics' ? (
              <div className="h-full w-full relative overflow-hidden" style={{ isolation: 'isolate', maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
                <div ref={lyricsContainerRef} className="h-full w-full overflow-y-auto overscroll-contain no-scrollbar scroll-smooth lyrics-scroll-container pb-[50vh]">
                  {lyrics?.syncedLyrics ? (
                    <div className={cn("flex flex-col gap-6 py-12 mt-4", getLyricAlignWrapperClass(), lyricsGlass && "bg-black/10 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] mx-4 my-4 p-8 shadow-xl border border-white/5")}>
                      {lyrics.syncedLyrics.map((line, index) => (
                        <p key={index} onClick={() => { if (ytPlayerRef.current) ytPlayerRef.current.seekTo(line.time, true) }} className={cn("lyric-line transition-all duration-500 ease-out cursor-pointer rounded-2xl py-3 font-extrabold leading-relaxed text-center max-w-full tracking-wide", getLyricTextClass(), getLyricOriginClass(), index === currentLyricIndex ? "lyric-active-line scale-[1.05] bg-primary/10 text-primary shadow-sm" : index < currentLyricIndex ? "text-muted-foreground/30 scale-95" : "text-muted-foreground/70 hover:bg-muted hover:text-foreground scale-95", lyricsAlignment === 'Center' && "px-6")}>
                          {line.text}
                        </p>
                      ))}
                    </div>
                  ) : lyrics?.plainLyrics ? (
                    <p className={cn("whitespace-pre-wrap leading-relaxed text-muted-foreground font-semibold text-lg text-center animate-in fade-in duration-500 p-8", getLyricAlignWrapperClass(), lyricsGlass && "bg-black/10 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] mx-4 my-4 p-8 shadow-xl border border-white/5")}>{lyrics.plainLyrics}</p>
                  ) : currentSong ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center h-full"><Mic2 className="h-14 w-14 text-muted-foreground/40 mb-6" /><p className="font-black text-2xl mb-2 text-foreground">Couldn't find timed lyrics</p><p className="text-base font-medium text-muted-foreground px-4 mt-2">Try changing the lyrics provider in Settings.</p></div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center h-full"><Music2 className="h-14 w-14 text-muted-foreground/40 mb-6" /><p className="font-black text-3xl mb-2 text-foreground">Nothing Playing</p></div>
                  )}
                </div>
              </div>
            ) : activeTab === 'library' ? (
               <div className="h-full w-full relative overflow-hidden" style={{ isolation: 'isolate', maskImage: 'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)' }}>
                 <div className="h-full w-full p-4 space-y-8 pb-32 animate-in slide-in-from-bottom-8 duration-700 ease-out overflow-y-auto overscroll-contain no-scrollbar">
                  {/* Playlists Section */}
                  <div>
                    <div className="mb-5 px-3 flex items-center justify-between">
                      <h3 className="font-extrabold text-xl flex items-center gap-3 text-foreground"><ListPlus className="h-6 w-6 text-primary"/> Playlists</h3>
                      <Button variant="secondary" size="sm" onClick={() => setShowPlaylistDialog(true)} className="rounded-xl font-bold text-sm h-10 px-4 text-foreground bg-secondary hover:bg-secondary/80 outline-none focus:outline-none">New</Button>
                    </div>
                    {playlists.length > 0 ? (
                      <div className="space-y-3">
                        {playlists.map((playlist) => (
                          <div key={playlist.id} onClick={() => loadPlaylistView(playlist)} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-muted/40 hover:bg-muted/80 transition-colors cursor-pointer text-foreground">
                            <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black shadow-sm"><ListMusic className="h-6 w-6 text-current"/></div>
                            <div>
                              <p className="font-bold text-base">{playlist.name}</p>
                              <p className="text-sm font-medium text-muted-foreground mt-0.5">{playlist.songs.length} songs</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground px-4 font-medium">No playlists created yet.</p>
                    )}
                  </div>

                  {/* Liked Songs Section */}
                  <div>
                    <div className="mb-5 px-3 flex items-center justify-between">
                      <h3 className="font-extrabold text-xl flex items-center gap-3 text-foreground"><Heart className="h-6 w-6 text-[var(--google-red)] fill-current"/> Liked Songs</h3>
                    </div>
                    {savedSongs.length > 0 ? (
                      <div className="space-y-3">
                        {savedSongs.map((song, index) => (
                          <div key={`lib-${song.videoId}-${index}`} className="group flex items-center gap-3 rounded-[1.5rem] p-3 transition-all duration-300 hover:bg-muted/80">
                            <button onClick={() => playFromLibrary(song)} className="flex flex-1 items-center gap-4 text-left outline-none min-w-0">
                              <img src={song.thumbnail} className={cn("aspect-square rounded-[1rem] object-cover shadow-sm shrink-0", !reduceMotion && "transition-transform duration-500 group-hover:scale-105", compactQueue ? "h-12 w-12" : "h-14 w-14")} />
                              <div className="flex-1 overflow-hidden">
                                <p className={cn("truncate font-bold leading-tight text-foreground transition-colors", compactQueue ? "text-sm" : "text-base")}>{song.title}</p>
                                <p className={cn("truncate font-semibold text-muted-foreground transition-colors", compactQueue ? "text-xs mt-0.5" : "text-sm mt-1")}>{song.artist}</p>
                              </div>
                            </button>
                            {/* Playlist Add Button Dropdown */}
                            {playlists.length > 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary outline-none focus:outline-none"><ListPlus className="h-5 w-5 text-current" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                                  <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                                  {playlists.map(pl => (
                                    <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-[0.98] text-foreground"><ListMusic className="mr-3 h-4 w-4 text-primary"/>{pl.name}</DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => toggleLike(song)} className="h-10 w-10 rounded-full text-[var(--google-red)] opacity-100 flex items-center justify-center transition-all duration-300 hover:bg-[var(--google-red)]/10 active:scale-90 outline-none focus:outline-none p-0">
                              <Heart className="h-5 w-5 fill-current text-current transition-transform duration-500 hover:scale-110" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground px-4 font-medium">Like songs to see them here.</p>
                    )}
                  </div>
                 </div>
               </div>
            ) : (
              <div className="h-full w-full relative overflow-hidden" style={{ isolation: 'isolate', maskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)' }}>
                <div className="h-full w-full p-4 space-y-3 pb-32 animate-in slide-in-from-bottom-8 duration-700 ease-out overflow-y-auto overscroll-contain no-scrollbar">
                  {queue.length > 0 ? (
                  queue.map((song, index) => (
                    <div key={`${song.videoId}-${index}`} className={cn("group flex items-center gap-3 rounded-[1.5rem] transition-all duration-300 hover:bg-muted/80", index === currentIndex ? "bg-primary/10 shadow-sm border border-primary/20 scale-[1.02]" : "border border-transparent", compactQueue ? "p-2" : "p-3")}>
                      <button onClick={() => setCurrentIndex(index)} className="flex flex-1 items-center gap-4 text-left outline-none min-w-0">
                        <div className={cn("relative flex-shrink-0 overflow-hidden rounded-[1rem] shadow-sm", compactQueue ? "h-12 w-12" : "h-14 w-14")}><img src={song.thumbnail} className="aspect-square h-full w-full object-cover" /></div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className={cn("truncate font-bold leading-tight", index === currentIndex ? "text-primary" : "text-foreground", compactQueue ? "text-sm" : "text-base")}>{song.title}</p>
                          <p className={cn("truncate font-semibold text-muted-foreground mt-0.5", compactQueue ? "text-[10px]" : "text-xs")}>{song.artist}</p>
                        </div>
                      </button>
                      
                      {playlists.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity outline-none focus:outline-none"><ListPlus className="h-5 w-5 text-current" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                            <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                            {playlists.map(pl => (
                              <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-[0.98] text-foreground"><ListMusic className="mr-3 h-4 w-4 text-primary"/>{pl.name}</DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => removeFromQueue(index)} className="h-10 w-10 rounded-full opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 text-destructive focus:opacity-100 outline-none focus:outline-none p-0"><X className="h-5 w-5 text-current" /></Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center"><ListMusic className="h-14 w-14 text-muted-foreground/40 mb-6" /><p className="font-black text-2xl mb-2 text-foreground">Queue is empty</p></div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MINI BOTTOM PLAYER (Mobile) --- */}
      {currentSong && !isMobilePlayerExpanded && (
        <div className="fixed bottom-4 left-4 right-4 z-[150] transition-all duration-500 ease-out lg:hidden">
          <div onClick={() => setIsMobilePlayerExpanded(true)} className="flex items-center gap-3 rounded-[2rem] bg-card/95 p-2 backdrop-blur-xl border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all duration-500 cursor-pointer active:scale-[0.98]">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[1rem] shadow-sm ml-1">
              <img src={currentSong.thumbnail || "/placeholder.svg"} className={cn("aspect-square w-full h-full object-cover transition-transform duration-700 ease-out", isPlaying ? "scale-110" : "scale-100")} />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center px-1">
              <p className="truncate text-sm md:text-base font-extrabold leading-tight transition-colors text-foreground">{currentSong.title}</p>
              <p className="truncate text-xs font-semibold text-muted-foreground mt-0.5 transition-colors">{currentSong.artist}</p>
            </div>
            <Button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong) }} variant="ghost" size="icon" className={cn("h-10 w-10 flex-shrink-0 p-0 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 text-foreground outline-none focus:outline-none", likedSongs.has(currentSong.videoId) && "text-[var(--google-red)] hover:text-[var(--google-red)]")}>
              <Heart className={cn("h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]", likedSongs.has(currentSong.videoId) ? "fill-current scale-110 text-current" : "text-current")} />
            </Button>
            <Button size="icon" onClick={(e) => { e.stopPropagation(); togglePlay() }} disabled={isLoading} className={cn("h-12 w-12 flex flex-shrink-0 p-0 items-center justify-center rounded-2xl shadow-md transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] active:scale-90 outline-none focus:outline-none", isPlaying ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-current" /> : isPlaying ? <Pause className="text-[24px]" /> : <Play className="text-[24px] translate-x-[2px]" />}
            </Button>
            <Button size="icon" onClick={(e) => { e.stopPropagation(); setQueue([]); setCurrentIndex(0); }} variant="ghost" className="h-10 w-10 flex flex-shrink-0 p-0 items-center justify-center rounded-full transition-all duration-300 active:scale-90 text-muted-foreground hover:bg-destructive/10 hover:text-destructive outline-none focus:outline-none mr-1">
              <X className="h-5 w-5 text-current" />
            </Button>
          </div>
        </div>
      )}

      {/* --- EXPANDABLE MOBILE PLAYER OVERLAY --- */}
      <div 
        className={cn(
          "fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out lg:hidden",
          isMobilePlayerExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobilePlayerExpanded(false)}
      />
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-[200] bg-background flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] lg:hidden rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]",
          isMobilePlayerExpanded ? "translate-y-0 h-[100dvh]" : "translate-y-[100%] h-[100dvh]"
        )}
      >
        {dynamicTheme && playerBgStyle === 'Gradient' && (
          <>
            <div className="absolute inset-0 z-[-2] transition-colors duration-1000 ease-in-out rounded-t-[3rem]" style={{ backgroundColor: dominantColor || 'transparent' }} />
            <div className={cn(
              "absolute inset-0 z-[-1] bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none rounded-t-[3rem] transition-opacity duration-1000 ease-in-out",
              dominantColor ? "opacity-100" : "opacity-0"
            )} />
          </>
        )}
        
        {dynamicTheme && playerBgStyle === 'Blur' && (
          <div className={cn(
            "absolute inset-0 z-[-2] overflow-hidden pointer-events-none bg-background rounded-t-[3rem] transition-opacity duration-1000 ease-in-out",
            currentSong ? "opacity-100" : "opacity-0"
          )}>
            <img 
              key={currentSong?.videoId || 'empty'} 
              src={currentSong?.thumbnail || ''} 
              className={cn(
                "w-full h-full object-cover blur-3xl opacity-40 will-change-transform transform-gpu",
                !reduceMotion && "scale-[1.2]",
                currentSong ? (reduceMotion ? "animate-in fade-in duration-500" : "animate-in fade-in duration-1000") : ""
              )} 
            />
          </div>
        )}

        {/* Mobile App Header Bar */}
        <div className="flex items-center justify-between p-4 mt-2 relative z-50">
          <Button variant="ghost" size="icon" onClick={() => setIsMobilePlayerExpanded(false)} className="h-12 w-12 rounded-full hover:bg-muted/50 active:scale-90 text-foreground outline-none focus:outline-none">
            <ChevronDown className="h-8 w-8 text-current" />
          </Button>
          
          <div className="flex bg-muted/60 rounded-full p-1.5 gap-1.5 relative shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background/50 to-transparent pointer-events-none rounded-l-full" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background/50 to-transparent pointer-events-none rounded-r-full" />
            <Button variant={mobilePlayerTab === 'player' ? 'default' : 'ghost'} size="sm" onClick={() => setMobilePlayerTab('player')} className="rounded-full px-5 font-bold text-sm text-foreground outline-none focus:outline-none">Player</Button>
            <Button variant={mobilePlayerTab === 'lyrics' ? 'default' : 'ghost'} size="sm" onClick={() => setMobilePlayerTab('lyrics')} className="rounded-full px-5 font-bold text-sm text-foreground outline-none focus:outline-none">Lyrics</Button>
            <Button variant={mobilePlayerTab === 'queue' ? 'default' : 'ghost'} size="sm" onClick={() => setMobilePlayerTab('queue')} className="rounded-full px-5 font-bold text-sm text-foreground outline-none focus:outline-none">Queue</Button>
          </div>
          
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-muted/50 active:scale-90 text-foreground outline-none focus:outline-none">
                <MoreVertical className="h-7 w-7 text-current" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl animate-in fade-in zoom-in-95 duration-300 ease-out p-2 shadow-xl border-border/50 z-[400]">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setShowPlayerSettings(true), 100); }} className="cursor-pointer gap-3 rounded-xl py-3 font-semibold transition-colors active:scale-[0.98] text-foreground outline-none focus:outline-none">
                <Settings className="h-5 w-5 text-muted-foreground text-current" /> Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 min-h-0 relative w-full z-0">
          
          {/* PLAYER TAB */}
          <div className={cn(
            "absolute inset-0 flex flex-col z-10 transition-opacity duration-300", 
            mobilePlayerTab === 'player' ? "opacity-100 pointer-events-auto overflow-y-auto no-scrollbar" : "opacity-0 pointer-events-none overflow-hidden"
          )}>
            {currentSong ? (
               renderMobilePlayerContent()
            ) : (
              <div className="flex flex-col items-center px-4 py-20 text-center">
                 <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-[3rem] bg-muted/50 shadow-inner"><Music2 className="h-24 w-24 text-muted-foreground/40" /></div>
                 <h2 className="mb-3 text-4xl font-black text-foreground tracking-tight">Start Listening</h2>
              </div>
            )}
          </div>

          {/* LYRICS TAB */}
          <div 
            className={cn(
              "absolute inset-0 z-10 transition-opacity duration-300 overflow-hidden",
              mobilePlayerTab === 'lyrics' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )} 
            style={{ 
              isolation: 'isolate', 
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', 
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' 
            }}
          >
             <div ref={lyricsContainerRefMobile} className="h-full w-full overflow-y-auto overscroll-contain no-scrollbar scroll-smooth lyrics-scroll-container pb-[50vh]">
                {lyrics?.syncedLyrics ? (
                  <div className={cn("flex flex-col gap-6 py-10 mt-2", getLyricAlignWrapperClass(), lyricsGlass && "bg-black/10 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] mx-4 my-4 p-8 shadow-xl border border-white/5")}>
                    {lyrics.syncedLyrics.map((line, index) => (
                      <p key={index} onClick={() => { if (ytPlayerRef.current) ytPlayerRef.current.seekTo(line.time, true) }} className={cn("lyric-line transition-all duration-500 ease-out cursor-pointer rounded-[2rem] py-4 font-black leading-tight max-w-full tracking-wide", getLyricTextClass(), getLyricOriginClass(), index === currentLyricIndex ? "lyric-active-line scale-[1.05] bg-primary/10 text-primary shadow-sm" : index < currentLyricIndex ? "text-muted-foreground/30 scale-95" : "text-muted-foreground/70 hover:bg-muted hover:text-foreground scale-95", lyricsAlignment === 'Center' && "px-6")}>
                        {line.text}
                      </p>
                    ))}
                  </div>
                ) : lyrics?.plainLyrics ? (
                  <p className={cn("whitespace-pre-wrap leading-relaxed text-muted-foreground font-bold text-xl animate-in fade-in duration-500 py-10 px-8", getLyricAlignWrapperClass(), lyricsGlass && "bg-black/10 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] mx-4 my-4 p-8 shadow-xl border border-white/5")}>{lyrics.plainLyrics}</p>
                ) : currentSong ? (
                  <div className="flex flex-col items-center justify-center h-full"><Mic2 className="h-16 w-16 text-muted-foreground/40 mb-6" /><p className="font-black text-3xl mb-2 text-foreground">Couldn't find timed lyrics</p><p className="text-base font-semibold text-muted-foreground px-6 mt-2 text-center">Try changing the lyrics provider in Settings.</p></div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full"><Music2 className="h-16 w-16 text-muted-foreground/40 mb-6" /><p className="font-black text-3xl mb-2 text-foreground">Nothing Playing</p></div>
                )}
             </div>
          </div>

          {/* QUEUE TAB */}
          <div 
            className={cn(
              "absolute inset-0 z-10 transition-opacity duration-300 overflow-hidden",
              mobilePlayerTab === 'queue' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            style={{ 
              isolation: 'isolate', 
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 85%, transparent 100%)', 
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 85%, transparent 100%)' 
            }}
          >
             <div className="h-full w-full overflow-y-auto overscroll-contain pb-32 pt-4 px-6 no-scrollbar">
               <h3 className="font-black text-3xl mb-8 flex items-center gap-3 text-foreground tracking-tight"><ListMusic className="text-primary h-8 w-8"/> Up Next</h3>
               <div className="space-y-4">
                 {queue.map((song, index) => (
                   <div key={`${song.videoId}-${index}`} className={cn("group flex items-center gap-4 rounded-[1.5rem] transition-all duration-300", index === currentIndex ? "bg-primary/10 shadow-sm border border-primary/20" : "hover:bg-muted/80", compactQueue ? "p-2" : "p-3")}>
                     <button onClick={() => setCurrentIndex(index)} className="flex flex-1 items-center gap-5 text-left outline-none min-w-0">
                       <img src={song.thumbnail} className={cn("aspect-square rounded-[1rem] object-cover shadow-sm flex-shrink-0", compactQueue ? "h-14 w-14" : "h-16 w-16")} />
                       <div className="flex-1 min-w-0 overflow-hidden">
                         <p className={cn("truncate font-bold", index === currentIndex ? "text-primary" : "text-foreground", compactQueue ? "text-base" : "text-lg")}>{song.title}</p>
                         <p className={cn("truncate font-semibold text-muted-foreground mt-0.5", compactQueue ? "text-xs" : "text-sm")}>{song.artist}</p>
                       </div>
                     </button>
                     <Button variant="ghost" size="icon" onClick={() => removeFromQueue(index)} className="h-12 w-12 rounded-full text-destructive bg-destructive/10 hover:bg-destructive/20 outline-none focus:outline-none p-0"><X className="h-6 w-6 text-current" /></Button>
                   </div>
                 ))}
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* --- ALL DIALOGS (SETTINGS, EFFECTS, AUTH, PLAYLISTS, CREDITS) --- */}
      
      <Dialog open={showColorPalette} onOpenChange={setShowColorPalette}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md p-0 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[500] max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 p-6 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setShowColorPalette(false)} className="rounded-full text-foreground outline-none focus:outline-none"><ArrowLeft className="w-6 h-6 text-current"/></Button>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Color Palette</h2>
          </div>
          <div className="px-8 flex-1 overflow-y-auto no-scrollbar pb-8">
            
            {/* Preview Card */}
            <div className="w-full h-64 rounded-[2rem] relative shadow-xl mb-10 flex flex-col justify-between p-8 transition-colors duration-500 overflow-hidden" style={{ backgroundColor: colorTheme === 'default' ? '#0f172a' : activeTheme.secondary }}>
               <div className="flex justify-between items-start z-10 relative w-full">
                  <div className="space-y-4 w-1/2">
                     <div className="w-14 h-12 rounded-xl bg-white/20 backdrop-blur-md shadow-sm" />
                     <div className="flex items-center">
                        <div className="w-3/4 h-2 rounded-l-full bg-white transition-colors duration-500" style={{ backgroundColor: colorTheme === 'default' ? '#38bdf8' : activeTheme.primary }} />
                        <div className="w-1/4 h-2 rounded-r-full bg-white/20" />
                     </div>
                  </div>
                  
                  <div className="w-16 h-16 shrink-0 rounded-[1.5rem] flex items-center justify-center shadow-lg bg-white transition-colors duration-500" style={{ backgroundColor: colorTheme === 'default' ? '#38bdf8' : activeTheme.primary }}>
                     <Play className="text-[32px] text-white" />
                  </div>
               </div>
               
               {/* Center overlapping circles */}
               <div className="absolute inset-0 m-auto w-fit h-fit flex items-center justify-center z-0">
                  <div className="w-24 h-24 rounded-full shadow-md bg-white transition-colors duration-500" style={{ backgroundColor: colorTheme === 'default' ? '#38bdf8' : activeTheme.primary }} />
                  <div className="w-16 h-16 rounded-full shadow-md -ml-8 bg-white/80 transition-colors duration-500" style={{ backgroundColor: colorTheme === 'default' ? '#38bdf8' : activeTheme.primary }} />
                  <div className="w-10 h-10 rounded-full shadow-md -ml-6 bg-white/60 transition-colors duration-500" style={{ backgroundColor: colorTheme === 'default' ? '#38bdf8' : activeTheme.primary }} />
               </div>

               {/* Bottom pills */}
               <div className="flex gap-3 z-10 relative">
                  <div className="w-16 h-10 rounded-[1rem] bg-white/10 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>
                  <div className="w-16 h-10 rounded-[1rem] bg-white/10 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>
               </div>
               
               {/* Label badge */}
               <div className="absolute bottom-0 right-0 px-5 py-3 rounded-tl-3xl font-bold text-sm transition-colors duration-500 shadow-xl bg-white text-white uppercase tracking-widest" style={{ backgroundColor: colorTheme === 'default' ? '#38bdf8' : activeTheme.primary }}>
                  {activeTheme.name || 'Default'}
               </div>
            </div>

            {/* Swatch Carousel */}
            <div className="relative w-full mb-10">
               <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
               <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
               
               <div className="flex overflow-x-auto gap-4 py-2 no-scrollbar snap-x z-10">
                  {ALL_THEMES.map(theme => (
                    <div key={theme.id} onClick={() => { setColorTheme(theme.id); localStorage.setItem('ganvo_color_theme', theme.id); }} className={cn("relative shrink-0 w-24 h-24 rounded-[2rem] flex items-center justify-center cursor-pointer transition-all active:scale-95 snap-center", colorTheme === theme.id ? "border-[4px] scale-105" : "border-2 border-transparent opacity-80 hover:opacity-100 bg-muted/30")} style={{ borderColor: colorTheme === theme.id ? (theme.primary || '#94a3b8') : undefined }}>
                      <div className="w-16 h-16 rounded-full overflow-hidden flex transform -rotate-45 shadow-sm">
                         <div className="w-1/2 h-full" style={{ backgroundColor: theme.primary || '#94a3b8' }} />
                         <div className="w-1/2 h-full" style={{ backgroundColor: theme.secondary || '#64748b' }} />
                      </div>
                      {colorTheme === theme.id && (
                        <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                          <Check className="text-[16px]" style={{ color: theme.primary || '#0f172a' }} />
                        </div>
                      )}
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-4 items-end">
               <Button onClick={() => setShowCustomThemeDialog(true)} className="rounded-[1.5rem] w-full h-16 font-bold text-base bg-primary text-primary-foreground shadow-lg hover:scale-[1.02] active:scale-95 transition-all"><PaintBucket className="mr-3 w-5 h-5"/> Create Custom Theme</Button>
               <Button onClick={() => setShowImportThemeDialog(true)} variant="secondary" className="rounded-[1.5rem] w-full h-16 font-bold text-base shadow-sm hover:scale-[1.02] active:scale-95 transition-all"><CloudDownload className="mr-3 w-5 h-5"/> Import Theme JSON</Button>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Custom Theme Creation Dialog */}
      <Dialog open={showCustomThemeDialog} onOpenChange={setShowCustomThemeDialog}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[550]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">Custom Theme</DialogTitle>
            <DialogDescription className="font-medium text-base">Select your primary and secondary colors.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCustomTheme} className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Primary Color</Label>
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-2xl border shadow-sm shrink-0 overflow-hidden relative">
                   <input type="color" value={tempPrimaryColor} onChange={(e) => setTempPrimaryColor(e.target.value)} className="absolute -inset-4 w-[200%] h-[200%] cursor-pointer" />
                </div>
                <Input value={tempPrimaryColor} onChange={(e) => setTempPrimaryColor(e.target.value)} className="h-14 rounded-2xl font-bold uppercase tracking-wider bg-muted/50 border-transparent text-foreground" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Secondary Color</Label>
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-2xl border shadow-sm shrink-0 overflow-hidden relative">
                   <input type="color" value={tempSecondaryColor} onChange={(e) => setTempSecondaryColor(e.target.value)} className="absolute -inset-4 w-[200%] h-[200%] cursor-pointer" />
                </div>
                <Input value={tempSecondaryColor} onChange={(e) => setTempSecondaryColor(e.target.value)} className="h-14 rounded-2xl font-bold uppercase tracking-wider bg-muted/50 border-transparent text-foreground" />
              </div>
            </div>
            <DialogFooter className="mt-8">
               <Button type="button" variant="ghost" onClick={() => setShowCustomThemeDialog(false)} className="rounded-[1.5rem] h-12 font-bold px-6">Cancel</Button>
               <Button type="submit" className="rounded-[1.5rem] h-12 font-bold px-8 bg-primary text-primary-foreground shadow-lg hover:scale-105">Save Theme</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Theme Dialog */}
      <Dialog open={showImportThemeDialog} onOpenChange={setShowImportThemeDialog}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[550]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">Import Theme</DialogTitle>
            <DialogDescription className="font-medium text-base">Paste a theme JSON object.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportTheme} className="space-y-6 mt-4">
            <Textarea 
              value={importThemeString}
              onChange={(e) => setImportThemeString(e.target.value)}
              placeholder={`{\n  "primary": "#ff0000",\n  "secondary": "#990000"\n}`}
              className="min-h-[150px] rounded-[1.5rem] font-mono text-sm bg-muted/50 border-transparent text-foreground resize-none p-4"
            />
            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => setShowImportThemeDialog(false)} className="rounded-[1.5rem] h-12 font-bold px-6">Cancel</Button>
               <Button type="submit" disabled={!importThemeString.trim()} className="rounded-[1.5rem] h-12 font-bold px-8 bg-primary text-primary-foreground shadow-lg hover:scale-105 disabled:opacity-50 disabled:scale-100">Apply</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showPlayerSettings} onOpenChange={setShowPlayerSettings}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md p-0 border-0 shadow-2xl animate-in zoom-in-95 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] outline-none overflow-hidden bg-background !z-[400]">
          <div className="flex items-center gap-4 p-5 md:p-6 border-b bg-card/50 backdrop-blur-sm">
            <Button variant="ghost" size="icon" onClick={() => setShowPlayerSettings(false)} className="rounded-full text-foreground outline-none focus:outline-none"><ArrowLeft className="w-6 h-6 text-current"/></Button>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Settings</h2>
          </div>
          <div className="p-2 overflow-y-auto max-h-[70vh] no-scrollbar pb-10">
             
             {/* Appearance Settings */}
             <div className="px-3 md:px-5 py-4 space-y-1">
               <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-4 uppercase tracking-widest ml-4">Appearance</h3>
               <SettingsRow icon={Palette} title="Theme colors" desc={activeTheme.name || 'Default'} onClick={() => setShowColorPalette(true)}>
                 <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground shrink-0" />
               </SettingsRow>
               <SettingsRow icon={LayoutTemplate} title="Dynamic theme" desc="Extracts colors from the active album cover.">
                 <Switch checked={dynamicTheme} onCheckedChange={setDynamicTheme} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Moon} title="Dark mode" desc="Toggle application theme." onClick={() => setIsDark(!isDark)}>
                 <Switch checked={isDark} onCheckedChange={setIsDark} className="shrink-0 pointer-events-none" />
               </SettingsRow>
               <SettingsRow icon={Activity} title="Reduce motion" desc="Disables player scale animations.">
                 <Switch checked={reduceMotion} onCheckedChange={(val) => { setReduceMotion(val); localStorage.setItem('ganvo_reduce_motion', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Wind} title="Disable all animations" desc="Removes all transitions and motion.">
                 <Switch checked={disableAnimations} onCheckedChange={(val) => { setDisableAnimations(val); localStorage.setItem('ganvo_disable_animations', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Droplets} title="Disable blur effects" desc="Removes backdrop blurs for performance.">
                 <Switch checked={disableBlur} onCheckedChange={(val) => { setDisableBlur(val); localStorage.setItem('ganvo_disable_blur', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={EyeOff} title="Hide Creator's Picks" desc="Remove top picks from the Explore tab.">
                 <Switch checked={hideCreatorsPicks} onCheckedChange={(val) => { setHideCreatorsPicks(val); localStorage.setItem('ganvo_hide_picks', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Rows3} title="Compact queue layout" desc="Shrink queue items to show more per page.">
                 <Switch checked={compactQueue} onCheckedChange={(val) => { setCompactQueue(val); localStorage.setItem('ganvo_compact_queue', val.toString()) }} className="shrink-0" />
               </SettingsRow>
             </div>
             
             {/* Player Settings */}
             <div className="px-3 md:px-5 py-4 space-y-1">
               <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-4 uppercase tracking-widest ml-4">Player View</h3>
               <SettingsRow icon={Music2} title="Player style" desc="Main screen design.">
                 <Select value={playerStyle} onValueChange={(v: any) => { setPlayerStyle(v); localStorage.setItem('ganvo_player_style', v); }}>
                    <SelectTrigger className="w-[110px] md:w-[130px] rounded-xl md:rounded-2xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 md:h-11 shrink-0 outline-none focus:ring-0">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl z-[500]">
                      <SelectItem value="Classic" className="font-bold py-2 md:py-3 text-xs md:text-sm">Classic</SelectItem>
                      <SelectItem value="Open" className="font-bold py-2 md:py-3 text-xs md:text-sm">Open</SelectItem>
                      <SelectItem value="Modern" className="font-bold py-2 md:py-3 text-xs md:text-sm">Modern</SelectItem>
                      <SelectItem value="Minimal" className="font-bold py-2 md:py-3 text-xs md:text-sm">Minimal</SelectItem>
                      <SelectItem value="Cinematic" className="font-bold py-2 md:py-3 text-xs md:text-sm">Cinematic</SelectItem>
                      <SelectItem value="Expressive" className="font-bold py-2 md:py-3 text-xs md:text-sm">Expressive</SelectItem>
                      <SelectItem value="Immersive" className="font-bold py-2 md:py-3 text-xs md:text-sm">Immersive</SelectItem>
                    </SelectContent>
                  </Select>
               </SettingsRow>
               <SettingsRow icon={LayoutTemplate} title="Background style" desc="How the background renders.">
                 <Select disabled={!dynamicTheme} value={playerBgStyle} onValueChange={(v: any) => setPlayerBgStyle(v)}>
                    <SelectTrigger className="w-[110px] md:w-[130px] rounded-xl md:rounded-2xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 md:h-11 shrink-0 outline-none focus:ring-0">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl z-[500]">
                      <SelectItem value="Theme" className="font-bold py-2 md:py-3 text-xs md:text-sm">Follow theme</SelectItem>
                      <SelectItem value="Gradient" className="font-bold py-2 md:py-3 text-xs md:text-sm">Gradient</SelectItem>
                      <SelectItem value="Blur" className="font-bold py-2 md:py-3 text-xs md:text-sm">Blur</SelectItem>
                    </SelectContent>
                  </Select>
               </SettingsRow>
               
               <div className="flex flex-col p-3 md:p-4 mt-1 bg-transparent rounded-2xl transition-colors">
                 <div className="flex items-center justify-between mb-4 gap-2">
                   <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                     <div className="p-2 md:p-2.5 bg-muted/80 rounded-xl text-foreground shrink-0"><CornerUpRight className="w-4 h-4 md:w-5 md:h-5 text-current"/></div>
                     <span className="font-bold text-sm md:text-base text-foreground truncate">Thumbnail corner radius</span>
                   </div>
                   <span className="text-xs font-bold bg-muted px-2.5 py-1.5 rounded-full text-foreground shrink-0">{thumbnailRadius}px</span>
                 </div>
                 <Slider 
                    value={[thumbnailRadius]} 
                    min={0} max={64} step={2} 
                    onValueChange={(val) => setThumbnailRadius(val[0])} 
                    className="[&_[data-slot=range]]:bg-primary [&_[data-slot=thumb]]:h-5 [&_[data-slot=thumb]]:w-5 [&_[data-slot=track]]:h-1.5" 
                  />
               </div>

               <SettingsRow icon={Maximize2} title="Auto-switch to player" desc="Jump to Player tab when selecting a song.">
                 <Switch checked={autoSwitchToPlayer} onCheckedChange={(val) => { setAutoSwitchToPlayer(val); localStorage.setItem('ganvo_auto_switch_player', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Timer} title="Show time remaining" desc="Display countdown instead of duration.">
                 <Switch checked={showTimeRemaining} onCheckedChange={(val) => { setShowTimeRemaining(val); localStorage.setItem('ganvo_show_time_remaining', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Gauge} title="Show playback speed" desc="Display speed control on the player.">
                 <Switch checked={showPlaybackSpeed} onCheckedChange={(val) => { setShowPlaybackSpeed(val); localStorage.setItem('ganvo_show_playback_speed', val.toString()) }} className="shrink-0" />
               </SettingsRow>
             </div>
             
             {/* Audio Settings */}
             <div className="px-3 md:px-5 py-4 space-y-1">
               <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-4 uppercase tracking-widest ml-4">Audio & Playback</h3>
               <SettingsRow icon={Speaker} title="Audio quality" desc="Streaming quality preset.">
                 <Select value={audioQuality} onValueChange={(v: any) => { setAudioQuality(v); localStorage.setItem('ganvo_audio_quality', v)}}>
                    <SelectTrigger className="w-[100px] md:w-[130px] rounded-xl md:rounded-2xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 md:h-11 shrink-0 outline-none focus:ring-0">
                      <SelectValue placeholder="Quality" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl z-[500]">
                      <SelectItem value="High" className="font-bold py-2 md:py-3 text-xs md:text-sm">High</SelectItem>
                      <SelectItem value="Standard" className="font-bold py-2 md:py-3 text-xs md:text-sm">Standard</SelectItem>
                      <SelectItem value="Low" className="font-bold py-2 md:py-3 text-xs md:text-sm">Low</SelectItem>
                    </SelectContent>
                  </Select>
               </SettingsRow>
               <SettingsRow icon={ListFilter} title="Auto-play similar songs" desc="Keep the music going when queue ends.">
                 <Switch checked={autoPlaySimilar} onCheckedChange={(val) => { setAutoPlaySimilar(val); localStorage.setItem('ganvo_autoplay_similar', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={SlidersHorizontal} title="Normalize volume" desc="Balance audio levels across tracks.">
                 <Switch checked={normalizeVolume} onCheckedChange={(val) => { setNormalizeVolume(val); localStorage.setItem('ganvo_normalize_volume', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Scissors} title="Skip silence" desc="Remove quiet gaps at start/end of songs.">
                 <Switch checked={skipSilence} onCheckedChange={(val) => { setSkipSilence(val); localStorage.setItem('ganvo_skip_silence', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={GitMerge} title="Crossfade tracks" desc="Smoothly blend into the next song.">
                 <Switch checked={crossfade} onCheckedChange={(val) => { setCrossfade(val); localStorage.setItem('ganvo_crossfade', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={CircleStop} title="Stop after current" desc="Pause playback when this song finishes.">
                 <Switch checked={stopAfterCurrent} onCheckedChange={(val) => { setStopAfterCurrent(val); localStorage.setItem('ganvo_stop_after_current', val.toString()) }} className="shrink-0" />
               </SettingsRow>
             </div>
             
             {/* Lyrics Settings */}
             <div className="px-3 md:px-5 py-4 space-y-1">
               <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-4 uppercase tracking-widest ml-4">Lyrics</h3>
               <SettingsRow icon={Mic2} title="Auto-open lyrics" desc="Switch to lyrics when playing a song.">
                 <Switch checked={autoOpenLyrics} onCheckedChange={(val) => { setAutoOpenLyrics(val); localStorage.setItem('ganvo_auto_open_lyrics', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={ArrowDownUp} title="Auto-scroll lyrics" desc="Keep active lyric in the center.">
                 <Switch checked={autoScrollLyrics} onCheckedChange={(val) => { setAutoScrollLyrics(val); localStorage.setItem('ganvo_auto_scroll_lyrics', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={AlignLeft} title="Text alignment" desc="Align lyrics text to the edges.">
                 <Select value={lyricsAlignment} onValueChange={(v: any) => { setLyricsAlignment(v); localStorage.setItem('ganvo_lyrics_alignment', v)}}>
                    <SelectTrigger className="w-[100px] md:w-[130px] rounded-xl md:rounded-2xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 md:h-11 shrink-0 outline-none focus:ring-0">
                      <SelectValue placeholder="Align" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl z-[500]">
                      <SelectItem value="Left" className="font-bold py-2 md:py-3 text-xs md:text-sm">Left</SelectItem>
                      <SelectItem value="Center" className="font-bold py-2 md:py-3 text-xs md:text-sm">Center</SelectItem>
                      <SelectItem value="Right" className="font-bold py-2 md:py-3 text-xs md:text-sm">Right</SelectItem>
                    </SelectContent>
                  </Select>
               </SettingsRow>
               <SettingsRow icon={LayoutTemplate} title="Glass backdrop" desc="Darkened glass effect behind lyrics.">
                 <Switch checked={lyricsGlass} onCheckedChange={(val) => { setLyricsGlass(val); localStorage.setItem('ganvo_lyrics_glass', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={MicVocal} title="Data provider" desc="Source used for synced lyrics.">
                 <Select value={lyricsProvider} onValueChange={(v: any) => { setLyricsProvider(v); localStorage.setItem('ganvo_lyrics_provider', v)}}>
                    <SelectTrigger className="w-[100px] md:w-[130px] rounded-xl md:rounded-2xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 md:h-11 shrink-0 outline-none focus:ring-0">
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl z-[500]">
                      <SelectItem value="lrclib" className="font-bold py-2 md:py-3 text-xs md:text-sm">LRCLib</SelectItem>
                      <SelectItem value="kugou" className="font-bold py-2 md:py-3 text-xs md:text-sm">KuGou</SelectItem>
                    </SelectContent>
                  </Select>
               </SettingsRow>
               <SettingsRow icon={Type} title="Text size" desc="Adjust synced lyrics font size.">
                 <Select value={lyricsSize} onValueChange={(v: any) => setLyricsSize(v)}>
                    <SelectTrigger className="w-[110px] md:w-[140px] rounded-xl md:rounded-2xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 md:h-11 shrink-0 outline-none focus:ring-0">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl z-[500]">
                      <SelectItem value="Normal" className="font-bold py-2 md:py-3 text-xs md:text-sm">Normal</SelectItem>
                      <SelectItem value="Large" className="font-bold py-2 md:py-3 text-xs md:text-sm">Large</SelectItem>
                      <SelectItem value="Extra Large" className="font-bold py-2 md:py-3 text-xs md:text-sm">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
               </SettingsRow>
             </div>

             {/* Data Settings */}
             <div className="px-3 md:px-5 py-4 space-y-1">
               <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-4 uppercase tracking-widest ml-4">Data & Privacy</h3>
               <SettingsRow icon={History} title="Save search history" desc="Remember your previous searches.">
                 <Switch checked={saveSearchHistory} onCheckedChange={(val) => { setSaveSearchHistory(val); localStorage.setItem('ganvo_save_history', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Ghost} title="Private session" desc="Temporarily pause history tracking.">
                 <Switch checked={privateSession} onCheckedChange={(val) => { setPrivateSession(val); localStorage.setItem('ganvo_private_session', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               <SettingsRow icon={Wifi} title="Data saver mode" desc="Reduce network usage when streaming.">
                 <Switch checked={dataSaver} onCheckedChange={(val) => { setDataSaver(val); localStorage.setItem('ganvo_data_saver', val.toString()) }} className="shrink-0" />
               </SettingsRow>
               
               <div className="flex items-center justify-between p-3 md:p-4 bg-transparent rounded-2xl cursor-pointer hover:bg-destructive/10 transition-colors text-destructive gap-2" onClick={() => { if(window.confirm("Clear all app preferences and search history? Your cloud playlists will not be deleted.")) { localStorage.clear(); window.location.reload(); } }}>
                 <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                   <div className="p-2 md:p-2.5 bg-destructive/10 rounded-xl text-current shrink-0"><Trash2 className="w-4 h-4 md:w-5 md:h-5 text-current"/></div>
                   <div className="flex flex-col flex-1 min-w-0">
                     <span className="font-bold text-sm md:text-base text-current truncate">Clear all local data</span>
                     <span className="text-[11px] md:text-xs font-medium opacity-80 mt-0.5 line-clamp-2 md:line-clamp-1">Resets settings and search history.</span>
                   </div>
                 </div>
               </div>
             </div>

          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] sm:max-w-md p-10 border-0 shadow-2xl animate-in zoom-in-95 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] outline-none bg-background !z-[400]">
          <DialogHeader>
            <div className="mb-6 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary/10 text-primary"><UserCircle2 className="h-12 w-12 text-current" /></div></div>
            <DialogTitle className="text-3xl font-black text-center text-foreground">Account Sync</DialogTitle>
            <DialogDescription className="font-medium text-center mt-3 text-base">Sign in to save your playlists and liked songs to the cloud.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailAuth} className="space-y-5 mt-4">
            <div className="space-y-4">
              <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="h-16 rounded-[1.5rem] bg-muted/50 border-transparent focus-visible:ring-primary font-bold px-6 text-lg text-foreground outline-none" />
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="h-16 rounded-[1.5rem] bg-muted/50 border-transparent focus-visible:ring-primary font-bold px-6 text-lg text-foreground outline-none" />
            </div>
            {authError && <p className="text-sm font-bold text-destructive text-center p-4 bg-destructive/10 rounded-2xl animate-in slide-in-from-top-2">{authError}</p>}
            <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] text-primary-foreground outline-none focus:outline-none">{isSignUp ? "Create Account" : "Sign In"}</Button>
            <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-border"></div><span className="text-sm font-extrabold text-muted-foreground uppercase tracking-widest">OR</span><div className="flex-1 h-px bg-border"></div></div>
            <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full h-16 rounded-[1.5rem] font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-foreground outline-none focus:outline-none border-2">Continue with Google</Button>
            <p className="text-base text-center font-bold text-primary mt-6 cursor-pointer hover:underline" onClick={() => {setIsSignUp(!isSignUp); setAuthError("")}}>{isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}</p>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
        <DialogContent className="rounded-[3rem] sm:max-w-md p-10 border-0 shadow-2xl animate-in zoom-in-95 duration-500 ease-out outline-none bg-background !z-[400]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black flex items-center gap-4 text-foreground"><UserCircle2 className="h-8 w-8 text-primary"/> Account Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-8 mt-6">
            <div className="space-y-3">
              <label className="text-sm font-extrabold uppercase tracking-widest ml-2 text-muted-foreground">Display Name</label>
              <Input value={displayNameInput} onChange={e => setDisplayNameInput(e.target.value)} placeholder="Your Name" className="h-16 rounded-[1.5rem] bg-muted/50 border-transparent font-bold px-6 text-xl text-foreground outline-none" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-extrabold uppercase tracking-widest ml-2 text-muted-foreground">Email Address</label>
              <Input value={user?.email || ""} disabled className="h-16 rounded-[1.5rem] bg-muted/30 border-transparent font-semibold px-6 text-lg text-muted-foreground opacity-70 outline-none" />
            </div>
            <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-bold text-lg shadow-xl transition-transform active:scale-[0.98] text-primary-foreground outline-none focus:outline-none mt-4">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
        <DialogContent className="rounded-[3rem] sm:max-w-md p-10 border-0 shadow-2xl animate-in zoom-in-95 duration-500 ease-out outline-none bg-background !z-[400]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black flex items-center gap-4 text-foreground"><ListPlus className="h-8 w-8 text-primary"/> New Playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePlaylist} className="space-y-8 mt-6">
            <div className="space-y-3">
              <Input value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} placeholder="Playlist Name" autoFocus required className="h-16 rounded-[1.5rem] bg-muted/50 border-transparent font-bold px-6 text-xl text-foreground outline-none" />
            </div>
            <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-bold text-lg shadow-xl transition-transform active:scale-[0.98] text-primary-foreground outline-none focus:outline-none">Create Playlist</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="rounded-[3rem] sm:max-w-md p-8 sm:p-10 border-0 shadow-2xl animate-in zoom-in-95 duration-500 ease-out outline-none bg-background !z-[400]">
          <DialogHeader>
            <div className="mb-6 flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary shadow-xl"><Music2 className="h-10 w-10 text-primary-foreground fill-current" /></div>
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight text-foreground">Ganvo Music</DialogTitle>
                <DialogDescription className="font-bold mt-1 text-base">Version 1.0.0</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-5 text-base font-medium text-muted-foreground leading-relaxed mt-2">
            <p>A modern audio player inspired by Material Design 3 Expressive, featuring seamless YouTube Music search, synchronized lyrics, and fluid animations.</p>
            <p>Built with Next.js App Router, Tailwind CSS, Firebase Auth, and shadcn/ui.</p>
            
            <div className="flex flex-col gap-4 mt-6 bg-muted/40 p-6 rounded-[2rem]">
              <div>
                <h4 className="font-extrabold text-foreground mb-1 text-sm uppercase tracking-widest">Terms of Service</h4>
                <p className="text-sm">By using this service, you agree to respect the intellectual property of the artists. This app is for personal, non-commercial use only.</p>
              </div>
              <div className="mt-2">
                <h4 className="font-extrabold text-foreground mb-1 text-sm uppercase tracking-widest">Copyright</h4>
                <p className="text-sm">All music metadata, album arts, and audio streams are provided through third-party APIs. Ganvo Music acts merely as a client.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogContent className="rounded-[3rem] sm:max-w-md p-8 sm:p-10 border-0 shadow-2xl animate-in zoom-in-95 duration-500 ease-out outline-none bg-background !z-[400]">
          <DialogHeader><DialogTitle className="flex items-center gap-4 text-3xl font-black tracking-tight text-foreground"><Heart className="h-8 w-8 text-[var(--google-red)] fill-[var(--google-red)]" />Credits</DialogTitle></DialogHeader>
          <div className="space-y-5 mt-6">
            <div className="rounded-[2rem] bg-muted/50 p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-muted hover:shadow-lg border border-transparent hover:border-border/50">
              <h4 className="mb-3 font-extrabold text-lg text-foreground uppercase tracking-wider">Inspired By</h4>
              <a href="https://github.com/koiverse/ArchiveTune" target="_blank" className="flex items-center gap-2 text-base font-bold text-primary hover:underline transition-all active:scale-95 w-fit outline-none focus:outline-none">ArchiveTune by koiverse<ExternalLink className="h-5 w-5" /></a>
              <p className="mt-2 text-sm font-semibold text-muted-foreground leading-relaxed">Material 3 Expressive YouTube Music client for Android</p>
            </div>
            <div className="rounded-[2rem] bg-muted/50 p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-muted hover:shadow-lg border border-transparent hover:border-border/50">
              <h4 className="mb-4 font-extrabold text-lg text-foreground uppercase tracking-wider">APIs & Services</h4>
              <ul className="space-y-4 text-base font-semibold text-muted-foreground">
                <li className="flex items-center gap-4 group"><span className="h-3 w-3 rounded-full bg-blue-500 shadow-md" />ytmusic-api (YouTube Music search)</li>
                <li className="flex items-center gap-4 group"><span className="h-3 w-3 rounded-full bg-green-500 shadow-md" />LRCLIB & KuGou (Synchronized lyrics)</li>
                <li className="flex items-center gap-4 group"><span className="h-3 w-3 rounded-full bg-yellow-500 shadow-md" />YouTube IFrame API (Native stream execution)</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  )
}