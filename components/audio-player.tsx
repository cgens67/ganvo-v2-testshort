"use client"

import React from "react"
import { usePlayerState } from "@/hooks/use-player-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Toaster } from "@/components/ui/sonner"
import {
  Search,
  Music2,
  X,
  History,
  TrendingUp,
  ListMusic,
  Mic2,
  Library,
  UserCircle2,
  Settings,
  Info,
  LogOut,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
  Loader2,
  Heart,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExploreView, ArtistView, AlbumView } from "@/components/player/explore-views"
import { QueueView, LyricsView, LibraryView } from "@/components/player/sidebar-views"
import { ClassicPlayerView } from "@/components/player/player-views"
import {
  ColorPaletteDialog,
  CustomThemeDialog,
  ImportThemeDialog,
  PlayerSettingsDialog,
  AuthDialog,
  AccountSettingsDialog,
  PlaylistDialog,
  AboutDialog,
  CreditsDialog,
} from "@/components/player/player-dialogs"

const PlayIcon = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    play_arrow
  </span>
)
const PauseIcon = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    pause
  </span>
)
const VolumeIcon = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    volume_up
  </span>
)

export function AudioPlayer() {
  const p = usePlayerState()

  const showSearchDropdown = p.searchFocused && (p.searchResults.length > 0 || p.isSearching || (p.searchQuery.trim() === "" && p.searchHistory.length > 0))

  return (
    <div className="flex h-screen flex-col overflow-hidden font-sans relative z-0 bg-background transition-colors duration-1000">
      {p.colorTheme !== "default" && (
        <style dangerouslySetInnerHTML={{ __html: `:root, .dark { --primary: ${p.activeTheme.primary}; --ring: ${p.activeTheme.primary}; }` }} />
      )}
      {p.disableAnimations && (
        <style dangerouslySetInnerHTML={{ __html: `*, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }` }} />
      )}
      {p.disableBlur && (
        <style dangerouslySetInnerHTML={{ __html: `* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; filter: none !important; }` }} />
      )}

      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none", zIndex: -1 }}>
        <div ref={p.ytParentRef}></div>
      </div>

      {p.dynamicTheme && p.playerBgStyle === "Gradient" && (
        <>
          <div className="absolute inset-0 z-[-2] transition-colors duration-1000 ease-in-out" style={{ backgroundColor: p.dominantColor || "transparent" }} />
          <div className={cn("absolute inset-0 z-[-1] bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none transition-opacity duration-1000 ease-in-out", p.dominantColor ? "opacity-100" : "opacity-0")} />
        </>
      )}

      {p.dynamicTheme && p.playerBgStyle === "Blur" && (
        <div className={cn("absolute inset-0 z-[-2] overflow-hidden pointer-events-none bg-background transition-opacity duration-1000 ease-in-out", p.currentSong ? "opacity-100" : "opacity-0")}>
          <img key={p.currentSong?.videoId || "empty"} src={p.currentSong?.thumbnail || ""} className={cn("w-full h-full object-cover blur-3xl opacity-40 will-change-transform transform-gpu", !p.reduceMotion && "scale-[1.2]", p.currentSong ? "animate-in fade-in duration-1000" : "")} />
        </div>
      )}

      {/* Header */}
      <header className="elevation-1 z-40 flex h-16 flex-shrink-0 items-center justify-between px-3 md:px-6 transition-all duration-500 ease-out relative bg-background/90 backdrop-blur-xl border-b border-border/40 gap-2">
        <div className={cn("flex items-center shrink-0 transition-all duration-500 origin-left whitespace-nowrap overflow-hidden", p.searchFocused ? "max-w-0 opacity-0 gap-0 border-0 p-0 mr-0 md:max-w-[280px] md:opacity-100 md:gap-3 md:mr-4" : "max-w-[280px] opacity-100 mr-2 md:mr-4 gap-3")}>
          <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-primary shadow-lg", !p.reduceMotion && "transition-transform duration-700 hover:scale-110")}>
            <Music2 className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          <div className="hidden sm:flex items-baseline pl-1 opacity-100 transition-opacity duration-300">
            <span className="text-xl font-normal text-muted-foreground tracking-tight">Ganvo</span>
            <span className="text-[20px] font-extrabold tracking-tight text-foreground ml-1">Music</span>
          </div>
        </div>

        {/* Search */}
        <div ref={p.searchContainerRef} className="relative flex-1 max-w-2xl mx-auto w-full transition-all duration-500">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground transition-colors" />
            <Input
              type="text"
              placeholder="Search songs, albums, artists, or videos..."
              value={p.searchQuery}
              onChange={(e) => p.setSearchQuery(e.target.value)}
              onFocus={() => p.setSearchFocused(true)}
              className={cn(
                "h-11 md:h-12 w-full rounded-full border-0 bg-muted/80 pl-12 pr-12 text-base shadow-none transition-all text-foreground outline-none focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-card focus-visible:shadow-lg sm:placeholder:text-transparent md:placeholder:text-muted-foreground",
                p.searchFocused && "bg-card shadow-lg ring-2 ring-primary"
              )}
            />
            {p.searchQuery && (
              <Button variant="ghost" size="icon" onClick={() => { p.setSearchQuery(""); p.setSearchResults([]) }} className="absolute right-2 h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95">
                <X className="h-4 w-4 text-current" />
              </Button>
            )}
          </div>

          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full z-[60] mt-3 flex flex-col overflow-hidden rounded-[1.5rem] border bg-card shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ease-out max-w-full">
              <div className={cn("flex-1 overflow-y-auto min-h-0 overscroll-contain transition-all duration-500", p.isSearchExpanded ? "max-h-[70vh]" : "max-h-[400px]")}>
                <div className="p-2">
                  {p.searchQuery.trim() === "" ? (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Searches</span>
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => { p.setSearchHistory([]); localStorage.removeItem("ganvo_search_history") }} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">CLEAR</button>
                      </div>
                      {p.searchHistory.map((historyItem, idx) => (
                        <button key={`history-${idx}`} onMouseDown={(e) => e.preventDefault()} onClick={() => p.setSearchQuery(historyItem)} className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-all hover:bg-muted active:scale-[0.98] text-foreground">
                          <div className="p-2 rounded-full bg-muted/50"><History className="h-4 w-4 text-muted-foreground opacity-70" /></div>
                          <span className="font-semibold text-sm truncate">{historyItem}</span>
                        </button>
                      ))}
                    </div>
                  ) : p.isSearching && p.searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary mb-3" /><span className="text-muted-foreground font-semibold">Searching...</span></div>
                  ) : (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center justify-between p-3 mb-2 border-b bg-muted/20 rounded-[1rem]">
                        <span className="text-xs font-extrabold text-muted-foreground ml-3 tracking-widest uppercase">Results</span>
                        <Select value={p.searchSort} onValueChange={(v: any) => p.setSearchSort(v)}>
                          <SelectTrigger className="h-8 text-xs w-[130px] rounded-full border-none bg-muted font-bold text-foreground outline-none focus:ring-0"><SelectValue placeholder="Sort" /></SelectTrigger>
                          <SelectContent className="rounded-2xl z-[400]"><SelectItem value="relevance" className="font-bold text-xs py-2 rounded-lg">Relevance</SelectItem><SelectItem value="az" className="font-bold text-xs py-2 rounded-lg">A - Z</SelectItem><SelectItem value="za" className="font-bold text-xs py-2 rounded-lg">Z - A</SelectItem></SelectContent>
                        </Select>
                      </div>
                      {p.sortedSearchResults.slice(0, p.isSearchExpanded ? undefined : 6).map((song, index) => (
                        <button key={song.videoId} onClick={(e) => { e.preventDefault(); e.stopPropagation(); p.addToQueueAndPlay(song) }} className="song-card active:scale-[0.98] flex w-full items-center gap-3 sm:gap-4 rounded-[1.25rem] p-3 text-left hover:bg-secondary/60 text-foreground transition-all duration-300 min-w-0" style={{ animationDelay: `${index * 30}ms` }}>
                          <img src={song.thumbnail || "/placeholder.svg"} alt={song.title} className="aspect-square h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover shadow-sm shrink-0" />
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="truncate font-bold leading-tight text-foreground text-sm sm:text-base">{song.title}</p>
                            <p className="truncate text-xs sm:text-sm font-medium text-muted-foreground mt-1">{song.artist} {song.album && `• ${song.album}`}</p>
                          </div>
                          <span className="flex-shrink-0 text-xs font-bold text-muted-foreground/80 tracking-widest">{p.formatTime(song.duration)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {p.searchQuery.trim() !== "" && p.searchResults.length > 6 && (
                <div className="flex-shrink-0 border-t bg-card/80 backdrop-blur-xl p-3">
                  <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.preventDefault(); e.stopPropagation(); p.setIsSearchExpanded(!p.isSearchExpanded) }} className="w-full justify-center gap-2 rounded-xl h-10 font-bold hover:bg-primary/10 text-foreground transition-all active:scale-[0.98]">
                    {p.isSearchExpanded ? <><ChevronUp className="h-4 w-4 text-current" />Show less</> : <><ChevronDown className="h-4 w-4 text-current" />Show all {p.searchResults.length} results</>}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0 ml-2">
          <Button variant="ghost" size="icon" onClick={p.toggleFullscreen} className="hidden sm:flex h-10 w-10 rounded-full text-foreground hover:bg-muted active:scale-90 outline-none">
            {p.isFullscreen ? <Minimize className="h-5 w-5 fill-current" /> : <Maximize className="h-5 w-5 fill-current" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-foreground hover:bg-muted active:scale-90 outline-none">
                {p.user ? (
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm uppercase shadow-sm">
                    {p.user.displayName ? p.user.displayName.charAt(0) : p.user.email?.charAt(0) || "U"}
                  </div>
                ) : (
                  <UserCircle2 className="h-6 w-6 text-current" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl animate-in fade-in zoom-in-95 duration-300 ease-out p-2 shadow-xl border-border/50 z-[250]">
              {p.user ? (
                <div className="px-3 py-2.5 mb-1 bg-muted/50 rounded-xl">
                  <p className="text-sm font-bold truncate text-foreground">{p.user.displayName || "Library Synced"}</p>
                  <p className="text-xs font-medium text-muted-foreground truncate">{p.user.email}</p>
                </div>
              ) : (
                <div className="px-2 py-2 mb-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Account</p>
                  <Button onClick={() => p.setShowAuthDialog(true)} className="w-full justify-start rounded-xl h-10 font-bold transition-all active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90" size="sm">Sign In / Sign Up</Button>
                </div>
              )}
              <DropdownMenuSeparator className="my-2" />
              {p.user && (
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => p.setShowAccountSettings(true), 100); }} className="cursor-pointer gap-3 rounded-xl py-3 font-semibold transition-colors active:scale-[0.98] text-foreground">
                  <UserCircle2 className="h-5 w-5 text-muted-foreground text-current" /> Account Details
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => p.setShowPlayerSettings(true), 100); }} className="cursor-pointer gap-3 rounded-xl py-3 font-semibold transition-colors active:scale-[0.98] text-foreground">
                <Settings className="h-5 w-5 text-muted-foreground text-current" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => p.setShowAboutDialog(true), 100); }} className="cursor-pointer gap-3 rounded-xl py-3 font-semibold transition-colors active:scale-[0.98] text-foreground">
                <Info className="h-5 w-5 text-muted-foreground text-current" /> About Ganvo
              </DropdownMenuItem>
              {p.user && (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onSelect={p.handleSignOut} className="cursor-pointer gap-3 rounded-xl py-3 font-bold text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors active:scale-[0.98]">
                    <LogOut className="h-5 w-5 text-current" /> Sign Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Body Views */}
      <div className="flex flex-1 overflow-hidden min-h-0 bg-transparent relative">
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0 z-10 pb-40 lg:pb-0 transition-all duration-500 ease-out">
          {p.activeTab === "explore" ? (
            <ExploreView exploreData={p.exploreData} isExploreLoading={p.isExploreLoading} exploreError={p.exploreError} hideCreatorsPicks={p.hideCreatorsPicks} reduceMotion={p.reduceMotion} playlists={p.playlists} addToQueueAndPlay={p.addToQueueAndPlay} addSongToPlaylist={p.addSongToPlaylist} loadArtistView={p.loadArtistView} loadAlbumView={p.loadAlbumView} />
          ) : p.activeTab === "artist" ? (
            <ArtistView currentArtistData={p.currentArtistData} isArtistLoading={p.isArtistLoading} reduceMotion={p.reduceMotion} playlists={p.playlists} likedSongs={p.likedSongs} setActiveTab={p.setActiveTab} addToQueueAndPlay={p.addToQueueAndPlay} addSongToPlaylist={p.addSongToPlaylist} toggleLike={p.toggleLike} loadAlbumView={p.loadAlbumView} />
          ) : p.activeTab === "album" ? (
            <AlbumView currentAlbumData={p.currentAlbumData} isAlbumLoading={p.isAlbumLoading} reduceMotion={p.reduceMotion} playlists={p.playlists} likedSongs={p.likedSongs} formatTime={p.formatTime} setActiveTab={p.setActiveTab} addToQueueAndPlay={p.addToQueueAndPlay} addSongToPlaylist={p.addSongToPlaylist} toggleLike={p.toggleLike} loadArtistView={p.loadArtistView} />
          ) : ["player", "lyrics", "queue", "library"].includes(p.activeTab) ? (
            <div className="flex flex-1 flex-col items-center px-4 py-8 md:px-8 md:py-12 relative min-h-full">
              {p.loadError && <div className="absolute top-4 bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-xl z-50">{p.loadError}</div>}
              {p.currentSong ? (
                <ClassicPlayerView {...p} VolumeIcon={VolumeIcon} />
              ) : (
                <div className="flex flex-col items-center px-4 text-center animate-in fade-in zoom-in-95 duration-700 ease-out m-auto">
                  <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-[3rem] bg-muted/50 shadow-inner">
                    <Music2 className="h-24 w-24 text-muted-foreground/40" />
                  </div>
                  <h2 className="mb-4 text-4xl font-black tracking-tight text-foreground">Start Listening</h2>
                  <p className="max-w-md text-lg font-medium text-muted-foreground/80">Search for songs or check the Explore tab to find music.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="hidden w-80 flex-col border-l border-border/40 bg-card/40 backdrop-blur-2xl lg:flex xl:w-[420px] overflow-hidden min-h-0 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-20 transition-all duration-500">
          <div className="flex p-3 gap-2 bg-muted/20 border-b border-border/40 flex-wrap transition-colors duration-300">
            <div className="flex w-full overflow-x-auto no-scrollbar gap-2 px-2 snap-x">
              {["player", "explore", "queue", "lyrics", "library"].map((tab) => (
                <button key={tab} onClick={() => p.setActiveTab(tab as any)} className={cn("flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-95 shrink-0 snap-center outline-none", p.activeTab === tab ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                  {tab === "player" && <PlayIcon className="text-[16px]" />}
                  {tab === "explore" && <TrendingUp className="h-4 w-4 text-current" />}
                  {tab === "queue" && <ListMusic className="h-4 w-4 text-current" />}
                  {tab === "lyrics" && <Mic2 className="h-4 w-4 text-current" />}
                  {tab === "library" && <Library className="h-4 w-4 text-current" />}
                  <span className="capitalize hidden xl:inline tracking-wide">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={cn("flex-1 min-h-0 overscroll-contain transition-all duration-500", ["lyrics", "queue", "library"].includes(p.activeTab) ? "overflow-hidden flex flex-col" : "overflow-y-auto")}>
            {p.activeTab === "queue" ? (
              <QueueView queue={p.queue} currentIndex={p.currentIndex} compactQueue={p.compactQueue} playlists={p.playlists} setCurrentIndex={p.setCurrentIndex} removeFromQueue={p.removeFromQueue} addSongToPlaylist={p.addSongToPlaylist} />
            ) : p.activeTab === "lyrics" ? (
              <LyricsView lyrics={p.lyrics} currentSong={p.currentSong} currentLyricIndex={p.currentLyricIndex} lyricsGlass={p.lyricsGlass} lyricsAlignment={p.lyricsAlignment} getLyricAlignWrapperClass={p.getLyricAlignWrapperClass} getLyricTextClass={p.getLyricTextClass} getLyricOriginClass={p.getLyricOriginClass} containerRef={p.lyricsContainerRef} seekTo={(t) => p.handleSeek([t])} />
            ) : p.activeTab === "library" ? (
              <LibraryView playlists={p.playlists} savedSongs={p.savedSongs} compactQueue={p.compactQueue} reduceMotion={p.reduceMotion} setShowPlaylistDialog={p.setShowPlaylistDialog} loadPlaylistView={p.loadPlaylistView} playFromLibrary={p.playFromLibrary} toggleLike={p.toggleLike} addSongToPlaylist={p.addSongToPlaylist} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Music2 className="h-16 w-16 text-muted-foreground/40 mb-6" />
                <p className="font-extrabold text-xl text-foreground capitalize">{p.activeTab} is active</p>
                <p className="text-sm font-medium text-muted-foreground mt-2">Check the main viewport on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Bottom Player on Mobile */}
      {p.currentSong && !p.isMobilePlayerExpanded && (
        <div className="fixed bottom-3 left-3 right-3 z-[150] transition-all duration-500 ease-out lg:hidden">
          <div onClick={() => p.setIsMobilePlayerExpanded(true)} className="flex items-center gap-2 rounded-[2rem] bg-card/95 p-2 backdrop-blur-xl border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all cursor-pointer active:scale-[0.98]">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[1.2rem] shadow-sm ml-1">
              <img src={p.currentSong.thumbnail || "/placeholder.svg"} className={cn("aspect-square w-full h-full object-cover transition-transform duration-700 ease-out", p.isPlaying ? "scale-110" : "scale-100")} />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center px-1">
              <p className="truncate text-sm md:text-base font-extrabold leading-tight transition-colors text-foreground">{p.currentSong.title}</p>
              <p className="truncate text-xs font-semibold text-muted-foreground mt-0.5 transition-colors">{p.currentSong.artist}</p>
            </div>
            <Button onClick={(e) => { e.stopPropagation(); p.toggleLike(p.currentSong) }} variant="ghost" size="icon" className={cn("h-10 w-10 shrink-0 p-0 rounded-full flex items-center justify-center", p.likedSongs.has(p.currentSong.videoId) && "text-[var(--google-red)]")}>
              <Heart className={cn("h-5 w-5", p.likedSongs.has(p.currentSong.videoId) ? "fill-current scale-110 text-current" : "text-current")} />
            </Button>
            <Button size="icon" onClick={(e) => { e.stopPropagation(); p.togglePlay() }} disabled={p.isLoading} className={cn("h-12 w-12 shrink-0 p-0 items-center justify-center rounded-2xl shadow-md", p.isPlaying ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
              {p.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-current" /> : p.isPlaying ? <PauseIcon className="text-[24px]" /> : <PlayIcon className="text-[24px] translate-x-[2px]" />}
            </Button>
            <Button size="icon" onClick={(e) => { e.stopPropagation(); p.setQueue([]); p.setCurrentIndex(0); }} variant="ghost" className="h-10 w-10 shrink-0 p-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive mr-1">
              <X className="h-5 w-5 text-current" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog Modals */}
      <ColorPaletteDialog showColorPalette={p.showColorPalette} setShowColorPalette={p.setShowColorPalette} colorTheme={p.colorTheme} setColorTheme={p.setColorTheme} activeTheme={p.activeTheme} ALL_THEMES={p.ALL_THEMES} setShowCustomThemeDialog={p.setShowCustomThemeDialog} setShowImportThemeDialog={p.setShowImportThemeDialog} />
      <CustomThemeDialog showCustomThemeDialog={p.showCustomThemeDialog} setShowCustomThemeDialog={p.setShowCustomThemeDialog} tempPrimaryColor={p.tempPrimaryColor} setTempPrimaryColor={p.setTempPrimaryColor} tempSecondaryColor={p.tempSecondaryColor} setTempSecondaryColor={p.setTempSecondaryColor} handleSaveCustomTheme={p.handleSaveCustomTheme} />
      <ImportThemeDialog showImportThemeDialog={p.showImportThemeDialog} setShowImportThemeDialog={p.setShowImportThemeDialog} importThemeString={p.importThemeString} setImportThemeString={p.setImportThemeString} handleImportTheme={p.handleImportTheme} />
      <PlayerSettingsDialog {...p} />
      <AuthDialog showAuthDialog={p.showAuthDialog} setShowAuthDialog={p.setShowAuthDialog} email={p.email} setEmail={p.setEmail} password={p.password} setPassword={p.setPassword} isSignUp={p.isSignUp} setIsSignUp={p.setIsSignUp} authError={p.authError} setAuthError={p.setAuthError} handleEmailAuth={p.handleEmailAuth} handleGoogleSignIn={p.handleGoogleSignIn} />
      <AccountSettingsDialog showAccountSettings={p.showAccountSettings} setShowAccountSettings={p.setShowAccountSettings} user={p.user} displayNameInput={p.displayNameInput} setDisplayNameInput={p.setDisplayNameInput} handleUpdateProfile={p.handleUpdateProfile} />
      <PlaylistDialog showPlaylistDialog={p.showPlaylistDialog} setShowPlaylistDialog={p.setShowPlaylistDialog} newPlaylistName={p.newPlaylistName} setNewPlaylistName={p.setNewPlaylistName} handleCreatePlaylist={p.handleCreatePlaylist} />
      <AboutDialog showAboutDialog={p.showAboutDialog} setShowAboutDialog={p.setShowAboutDialog} />
      <CreditsDialog showCreditsDialog={p.showCreditsDialog} setShowCreditsDialog={p.setShowCreditsDialog} />

      <Toaster />
    </div>
  )
}
