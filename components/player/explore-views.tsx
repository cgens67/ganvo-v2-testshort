"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Loader2, TrendingUp, Star, UserCircle2, Disc3, Music2, SkipBack, MicVocal, ListPlus, ListMusic, Heart, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { Song, Playlist } from "@/types/player"

const PlayIcon = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    play_arrow
  </span>
)

export function ExploreView({
  exploreData,
  isExploreLoading,
  exploreError,
  hideCreatorsPicks,
  reduceMotion,
  playlists,
  addToQueueAndPlay,
  addSongToPlaylist,
  loadArtistView,
  loadAlbumView,
}: {
  exploreData: any
  isExploreLoading: boolean
  exploreError: boolean
  hideCreatorsPicks: boolean
  reduceMotion: boolean
  playlists: Playlist[]
  addToQueueAndPlay: (song: Song) => void
  addSongToPlaylist: (plId: string, song: Song) => void
  loadArtistView: (artistId: string) => void
  loadAlbumView: (albumId: string) => void
}) {
  if (isExploreLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-bold text-lg text-muted-foreground">Discovering Music...</p>
      </div>
    )
  }

  if (exploreError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <TrendingUp className="h-20 w-20 text-muted-foreground/40 mb-6" />
        <p className="font-black text-3xl mb-2 text-foreground">Explore Unavailable</p>
        <p className="text-base font-medium text-muted-foreground max-w-[350px]">Servers are temporarily busy. Use the search bar to find music.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-foreground">Explore</h2>
      <p className="text-muted-foreground font-semibold mb-12 text-lg">Discover top global artists, studio songs, and music videos.</p>

      <div className="space-y-14">
        {!hideCreatorsPicks && exploreData?.creatorsPicks?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <Star className="h-6 w-6 text-primary" /> Creator's Top Picks
            </h3>
            <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x no-scrollbar pb-6 scroll-smooth items-center">
              {exploreData.creatorsPicks.map((song: Song, idx: number) => (
                <div key={idx} onClick={() => addToQueueAndPlay(song)} className="group flex flex-col gap-3 w-40 sm:w-48 shrink-0 cursor-pointer snap-start transition-all">
                  <div className={cn("overflow-hidden rounded-[2rem] shadow-lg aspect-square relative", !reduceMotion && "transition-transform duration-500 group-hover:scale-105 group-active:scale-95")}>
                    <img src={song.thumbnail} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <PlayIcon className="text-[48px] text-white" />
                    </div>
                  </div>
                  <div className="px-2 min-w-0">
                    <p className="font-extrabold text-base truncate text-foreground group-hover:text-primary transition-colors">{song.title}</p>
                    <p className="text-sm font-semibold text-muted-foreground mt-0.5 truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {exploreData?.artists?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <UserCircle2 className="h-6 w-6 text-primary" /> Top Artists
            </h3>
            <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x no-scrollbar pb-6 scroll-smooth items-center">
              {exploreData.artists.map((artist: any, idx: number) => (
                <div key={artist.artistId || idx} onClick={() => loadArtistView(artist.artistId)} className="group flex flex-col items-center gap-4 cursor-pointer snap-start w-36 sm:w-44 shrink-0 transition-all">
                  <div className={cn("relative w-full aspect-square rounded-full overflow-hidden shadow-xl", !reduceMotion && "transition-transform duration-700 group-hover:scale-105 group-active:scale-95")}>
                    <img src={artist.thumbnail || "/placeholder.svg"} alt={artist.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-center w-full px-2 min-w-0">
                    <p className="font-extrabold text-base truncate transition-colors group-hover:text-primary text-foreground">{artist.name}</p>
                    <p className="text-xs text-muted-foreground font-semibold mt-1 tracking-wider uppercase truncate">{artist.subscribers}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {exploreData?.songs?.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
              <TrendingUp className="h-6 w-6 text-primary" /> Top Songs (Audio Tracks)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {exploreData.songs.slice(0, 9).map((song: Song, idx: number) => (
                <div key={idx} className="group flex items-center gap-3 sm:gap-4 p-3 rounded-[1.5rem] hover:bg-muted/80 transition-colors duration-300 ease-out bg-card shadow-sm border border-border/40 min-w-0">
                  <img src={song.thumbnail} className={cn("aspect-square h-14 w-14 sm:h-16 sm:w-16 rounded-[1rem] object-cover shadow-sm shrink-0", !reduceMotion && "transition-transform duration-500 group-hover:scale-105")} />
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-sm sm:text-base truncate text-foreground leading-tight">{song.title}</p>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground truncate mt-1">{song.artist}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:outline-none shrink-0"><ListPlus className="h-5 w-5 text-current" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                      <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                      {playlists.map((pl) => (
                        <DropdownMenuItem key={pl.id} onClick={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-95 text-foreground"><ListMusic className="h-4 w-4 mr-3 text-primary" />{pl.name}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(song)} className="rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 text-foreground h-11 w-11 sm:h-12 sm:w-12 bg-secondary hover:bg-secondary/80 outline-none focus:outline-none flex items-center justify-center p-0 shadow-md shrink-0">
                    <PlayIcon className="text-[22px] sm:text-[24px] translate-x-[1px]" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {exploreData?.videos && exploreData.videos.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
              <Video className="h-6 w-6 text-primary" /> Trending Music Videos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {exploreData.videos.slice(0, 6).map((song: Song, idx: number) => (
                <div key={idx} onClick={() => addToQueueAndPlay(song)} className="group flex flex-col gap-3 p-3 rounded-[1.5rem] hover:bg-muted/80 transition-colors duration-300 ease-out bg-card shadow-sm border border-border/40 cursor-pointer min-w-0">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden relative shadow-sm">
                    <img src={song.thumbnail} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayIcon className="text-[40px] text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 px-1">
                    <p className="font-bold text-sm sm:text-base truncate text-foreground leading-tight">{song.title}</p>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground truncate mt-1">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {exploreData?.albums?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <Disc3 className="h-6 w-6 text-primary" /> Top Albums
            </h3>
            <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x no-scrollbar pb-6 scroll-smooth items-center">
              {exploreData.albums.map((album: any, idx: number) => (
                <div key={idx} onClick={() => loadAlbumView(album.albumId)} className="flex flex-col gap-3 w-40 sm:w-48 shrink-0 group cursor-pointer snap-start transition-all">
                  <div className={cn("overflow-hidden rounded-[2rem] shadow-md aspect-square relative", !reduceMotion && "transition-transform duration-500 group-hover:scale-105 group-active:scale-95")}>
                    <img src={album.thumbnail} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-2 min-w-0">
                    <p className="font-extrabold text-base truncate text-foreground group-hover:text-primary transition-colors">{album.title}</p>
                    <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider truncate">{album.artist} • {album.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ArtistView({
  currentArtistData,
  isArtistLoading,
  reduceMotion,
  playlists,
  likedSongs,
  setActiveTab,
  addToQueueAndPlay,
  addSongToPlaylist,
  toggleLike,
  loadAlbumView,
}: {
  currentArtistData: any
  isArtistLoading: boolean
  reduceMotion: boolean
  playlists: Playlist[]
  likedSongs: Set<string>
  setActiveTab: (tab: any) => void
  addToQueueAndPlay: (song: Song) => void
  addSongToPlaylist: (plId: string, song: Song) => void
  toggleLike: (song: Song) => void
  loadAlbumView: (albumId: string) => void
}) {
  if (isArtistLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-bold text-lg text-muted-foreground">Loading Artist Profile...</p>
      </div>
    )
  }

  if (!currentArtistData) {
    return <p className="text-foreground p-10 text-center">Failed to load artist.</p>
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
      <Button variant="ghost" onClick={() => setActiveTab("explore")} className="mb-6 -ml-2 md:-ml-4 gap-2 font-bold text-muted-foreground hover:text-foreground transition-all outline-none focus:outline-none h-12 rounded-full px-4">
        <SkipBack className="h-5 w-5" /> Back to Explore
      </Button>
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-12 p-6 md:p-10 bg-card/50 rounded-[3rem] border shadow-sm backdrop-blur-sm">
          <img src={currentArtistData.thumbnails?.[currentArtistData.thumbnails.length - 1]?.url || "/placeholder.svg"} alt={currentArtistData.name} className="aspect-square w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-2xl shrink-0" />
          <div className="text-center md:text-left flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-sm mb-3 uppercase tracking-[0.2em]"><MicVocal className="h-5 w-5 text-current" /> Artist</div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4 text-foreground truncate">{currentArtistData.name}</h1>
            <p className="text-muted-foreground font-semibold mb-6 text-xl">{currentArtistData.subscribers}</p>
            {currentArtistData.description && <p className="text-base leading-relaxed max-w-3xl text-muted-foreground/90 line-clamp-3 md:line-clamp-none font-medium">{currentArtistData.description}</p>}
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground"><TrendingUp className="h-6 w-6 text-primary" /> Top Songs</h3>
        <div className="space-y-2 mb-14 bg-card p-3 md:p-6 rounded-[2.5rem] border shadow-sm">
          {currentArtistData.topSongs?.map((song: Song, idx: number) => (
            <div key={song.videoId || idx} className="group flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-[1.5rem] hover:bg-muted/80 transition-colors duration-300 ease-out min-w-0">
              <span className="w-6 sm:w-8 text-center font-bold text-xs sm:text-sm text-muted-foreground/50 shrink-0">{idx + 1}</span>
              <img src={song.thumbnail} className={cn("aspect-square h-12 w-12 sm:h-14 sm:w-14 rounded-[1rem] object-cover shadow-sm shrink-0", !reduceMotion && "transition-transform duration-500 group-hover:scale-105")} />
              <div className="flex-1 min-w-0 px-2">
                <p className="font-bold text-sm sm:text-base truncate text-foreground leading-tight">{song.title}</p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mt-0.5">{song.album || song.artist}</p>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:outline-none"><ListPlus className="h-5 w-5 sm:h-6 sm:w-6 text-current" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                    <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                    {playlists.map((pl) => (
                      <DropdownMenuItem key={pl.id} onClick={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-[0.98] text-foreground"><ListMusic className="h-4 w-4 mr-3 text-primary" />{pl.name}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(song)} className="rounded-full font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 shadow-md text-foreground h-10 w-10 sm:h-12 sm:w-12 bg-secondary hover:bg-secondary/80 outline-none focus:outline-none flex items-center justify-center p-0">
                  <PlayIcon className="text-[18px] sm:text-[20px] translate-x-[1px]" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toggleLike(song)} className={cn("text-muted-foreground hover:text-[var(--google-red)] transition-all outline-none focus:outline-none flex items-center justify-center p-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full", likedSongs.has(song.videoId) && "text-[var(--google-red)]")}>
                  <Heart className={cn("h-5 w-5 sm:h-6 sm:w-6", likedSongs.has(song.videoId) && "fill-current text-current")} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {currentArtistData.albums?.length > 0 && (
          <div className="mb-14">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground"><Disc3 className="h-6 w-6 text-primary" /> Albums</h3>
            <div className="flex overflow-x-auto gap-4 sm:gap-6 snap-x no-scrollbar pb-6 scroll-smooth items-center">
              {currentArtistData.albums.map((album: any, idx: number) => (
                <div key={idx} onClick={() => loadAlbumView(album.albumId)} className="flex flex-col gap-3 w-40 sm:w-48 shrink-0 group cursor-pointer snap-start transition-all">
                  <div className={cn("overflow-hidden rounded-[2rem] shadow-lg aspect-square relative", !reduceMotion && "transition-transform duration-500 group-hover:scale-105 group-active:scale-95")}>
                    <img src={album.thumbnail} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-2 min-w-0">
                    <p className="font-extrabold text-base truncate text-foreground group-hover:text-primary transition-colors">{album.title}</p>
                    <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mt-1 truncate">{album.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AlbumView({
  currentAlbumData,
  isAlbumLoading,
  reduceMotion,
  playlists,
  likedSongs,
  formatTime,
  setActiveTab,
  addToQueueAndPlay,
  addSongToPlaylist,
  toggleLike,
  loadArtistView,
}: {
  currentAlbumData: any
  isAlbumLoading: boolean
  reduceMotion: boolean
  playlists: Playlist[]
  likedSongs: Set<string>
  formatTime: (s: number) => string
  setActiveTab: (tab: any) => void
  addToQueueAndPlay: (song: Song) => void
  addSongToPlaylist: (plId: string, song: Song) => void
  toggleLike: (song: Song) => void
  loadArtistView: (artistId: string) => void
}) {
  if (isAlbumLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-bold text-lg text-muted-foreground">Loading Album...</p>
      </div>
    )
  }

  if (!currentAlbumData) {
    return <p className="text-foreground p-10 text-center">Failed to load album.</p>
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
      <Button variant="ghost" onClick={() => setActiveTab("explore")} className="mb-6 -ml-2 md:-ml-4 gap-2 font-bold text-muted-foreground hover:text-foreground transition-all outline-none focus:outline-none h-12 rounded-full px-4">
        <SkipBack className="h-5 w-5" /> Back
      </Button>
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mb-12 p-6 md:p-10 bg-card/20 rounded-[3rem] border border-border/30 shadow-sm">
          <img src={currentAlbumData.thumbnails?.[currentAlbumData.thumbnails.length - 1]?.url || currentAlbumData.songs?.[0]?.thumbnail || "/placeholder.svg"} alt={currentAlbumData.name} className="aspect-square w-56 h-56 md:w-72 md:h-72 rounded-[2.5rem] object-cover shadow-2xl shrink-0" />
          <div className="text-center md:text-left flex-1 flex flex-col justify-end min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-sm mb-3 uppercase tracking-[0.2em]"><Disc3 className="h-5 w-5 text-current" /> Album</div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-4 text-foreground leading-tight truncate">{currentAlbumData.name}</h1>
            <p className="text-muted-foreground font-semibold mb-8 text-lg sm:text-xl cursor-pointer hover:underline hover:text-primary transition-colors truncate" onClick={() => currentAlbumData.songs[0]?.artistId && loadArtistView(currentAlbumData.songs[0].artistId)}>{currentAlbumData.artist} {currentAlbumData.year && `• ${currentAlbumData.year}`}</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Button onClick={() => currentAlbumData.songs?.length > 0 && addToQueueAndPlay(currentAlbumData.songs[0])} disabled={!currentAlbumData.songs?.length} className="rounded-full font-bold text-base sm:text-lg px-8 sm:px-10 h-14 sm:h-16 shadow-xl hover:scale-105 active:scale-95 transition-all bg-primary text-primary-foreground outline-none focus:outline-none flex items-center justify-center gap-3">
                <PlayIcon className="text-[28px]" /> Play Album
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-14 bg-card p-3 md:p-6 rounded-[2.5rem] border shadow-sm">
          {currentAlbumData.songs?.map((song: Song, idx: number) => (
            <div key={song.videoId || idx} className="group flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-[1.5rem] hover:bg-muted/80 transition-colors duration-300 ease-out min-w-0">
              <span className="w-6 sm:w-8 text-center font-bold text-xs sm:text-sm text-muted-foreground/50 shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0 px-2">
                <p className="font-bold text-sm sm:text-base truncate text-foreground leading-tight">{song.title}</p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mt-0.5">{song.artist}</p>
              </div>
              {song.duration > 0 && (
                <span className="text-xs sm:text-sm font-bold tabular-nums text-muted-foreground/50 mr-2 shrink-0">{formatTime(song.duration)}</span>
              )}

              <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:outline-none"><ListPlus className="h-5 w-5 sm:h-6 sm:w-6 text-current" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                    <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                    {playlists.map((pl) => (
                      <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-[0.98] text-foreground"><ListMusic className="mr-3 h-4 w-4 text-primary" />{pl.name}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="secondary" size="icon" onClick={() => addToQueueAndPlay(song)} className="rounded-full font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 shadow-md text-foreground h-10 w-10 sm:h-12 sm:w-12 bg-secondary hover:bg-secondary/80 outline-none focus:outline-none flex items-center justify-center p-0">
                  <PlayIcon className="text-[18px] sm:text-[20px] translate-x-[1px]" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toggleLike(song)} className={cn("text-muted-foreground hover:text-[var(--google-red)] transition-all outline-none focus:outline-none flex items-center justify-center p-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full", likedSongs.has(song.videoId) && "text-[var(--google-red)]")}>
                  <Heart className={cn("h-5 w-5 sm:h-6 sm:w-6", likedSongs.has(song.videoId) && "fill-current text-current")} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
