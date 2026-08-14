"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Loader2, Heart, UserCircle2, Disc3, ListMusic, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import { Song, Playlist } from "@/types/player"

const Play = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    play_arrow
  </span>
)
const Pause = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    pause
  </span>
)
const SkipBack = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    skip_previous
  </span>
)
const SkipForward = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    skip_next
  </span>
)
const Shuffle = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    shuffle
  </span>
)
const Repeat = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    repeat
  </span>
)
const Repeat1 = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    repeat_one
  </span>
)
const ShareIcon = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    ios_share
  </span>
)
const MoreIcon = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    more_horiz
  </span>
)

export function PlayerMenuOptions({
  song,
  playlists,
  loadArtistView,
  setSearchQuery,
  setSearchFocused,
  setIsMobilePlayerExpanded,
  addSongToPlaylist,
}: {
  song: Song
  playlists: Playlist[]
  loadArtistView: (id: string) => void
  setSearchQuery: (q: string) => void
  setSearchFocused: (v: boolean) => void
  setIsMobilePlayerExpanded: (v: boolean) => void
  addSongToPlaylist: (plId: string, s: Song) => void
}) {
  return (
    <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] shadow-xl z-[400] border-border/50 p-2">
      <DropdownMenuItem onSelect={() => { if (song.artistId) { loadArtistView(song.artistId); setIsMobilePlayerExpanded(false); } }} className="rounded-xl py-3 cursor-pointer text-foreground font-medium transition-all active:scale-[0.98]">
        <UserCircle2 className="mr-3 h-5 w-5 text-muted-foreground" /> Go to Artist
      </DropdownMenuItem>
      {song.album && (
        <DropdownMenuItem onSelect={() => { setSearchQuery(song.album); setSearchFocused(true); setIsMobilePlayerExpanded(false); }} className="rounded-xl py-3 cursor-pointer text-foreground font-medium transition-all active:scale-[0.98]">
          <Disc3 className="mr-3 h-5 w-5 text-muted-foreground" /> Search Album
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator className="my-2" />
      <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
      {playlists.map((pl) => (
        <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 text-foreground transition-all active:scale-[0.98]"><ListMusic className="mr-3 h-4 w-4 text-primary" /> {pl.name}</DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  )
}

export function ClassicPlayerView({
  currentSong,
  thumbnailRadius,
  isPlaying,
  isLoading,
  likedSongs,
  playlists,
  showPlaybackSpeed,
  playbackRate,
  currentTime,
  duration,
  showTimeRemaining,
  shuffle,
  repeatMode,
  volume,
  isMuted,
  VolumeIcon,
  setPlaybackRate,
  handleShare,
  loadArtistView,
  setIsMobilePlayerExpanded,
  toggleLike,
  setSearchQuery,
  setSearchFocused,
  addSongToPlaylist,
  handleSeek,
  formatTime,
  setShuffle,
  playPrevious,
  togglePlay,
  playNext,
  setRepeatMode,
  toggleMute,
  handleVolumeChange,
}: any) {
  return (
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
          <Button variant="ghost" size="icon" onClick={() => handleShare(currentSong)} className="h-12 w-12 rounded-full"><ShareIcon className="text-[24px]" /></Button>
        </div>
        <div className="flex-1 min-w-0 text-center px-4">
          <h2 className="text-2xl font-extrabold truncate text-foreground mb-1">{currentSong.title}</h2>
          <button onClick={() => { if (currentSong.artistId) { loadArtistView(currentSong.artistId); setIsMobilePlayerExpanded(false); } }} className="max-w-full text-base font-semibold text-muted-foreground/80 hover:text-primary hover:underline transition-colors outline-none focus:outline-none truncate">{currentSong.artist}</button>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => toggleLike(currentSong)} className="h-12 w-12 p-0 rounded-full text-foreground hover:bg-primary/10 outline-none focus:outline-none">
            <Heart className={cn("h-6 w-6 transition-all", likedSongs.has(currentSong.videoId) ? "fill-[var(--primary)] text-[var(--primary)] scale-110" : "text-current")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full"><MoreIcon className="text-[24px]" /></Button>
            </DropdownMenuTrigger>
            <PlayerMenuOptions song={currentSong} playlists={playlists} loadArtistView={loadArtistView} setSearchQuery={setSearchQuery} setSearchFocused={setSearchFocused} setIsMobilePlayerExpanded={setIsMobilePlayerExpanded} addSongToPlaylist={addSongToPlaylist} />
          </DropdownMenu>
        </div>
      </div>

      {showPlaybackSpeed && (
        <div className="flex w-full items-center justify-between px-4 mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Gauge className="w-4 h-4" /> Speed</span>
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

      <div className="flex items-center gap-3 w-full px-2 mt-auto pb-8">
        <div className="flex flex-1 items-center gap-3 rounded-[2rem] bg-muted/60 backdrop-blur-sm px-5 py-4 transition-all duration-300 hover:bg-muted/80">
          <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 flex-shrink-0 rounded-full p-0 transition-transform duration-300 hover:scale-110 active:scale-90 flex items-center justify-center text-foreground outline-none focus:outline-none"><VolumeIcon className="text-[20px] text-current" /></Button>
          <Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1 cursor-grab active:cursor-grabbing [&_[data-slot=range]]:bg-foreground [&_[data-slot=thumb]]:h-5 [&_[data-slot=thumb]]:w-5 [&_[data-slot=track]]:h-2 [&_[data-slot=track]]:bg-foreground/10" />
          <span className="w-8 flex-shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">{isMuted ? 0 : volume}%</span>
        </div>
      </div>
    </div>
  )
}
