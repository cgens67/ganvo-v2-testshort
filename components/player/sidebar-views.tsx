"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ListMusic, ListPlus, Heart, Mic2, Music2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Song, Playlist, LyricsData } from "@/types/player"

export function QueueView({
  queue,
  currentIndex,
  compactQueue,
  playlists,
  setCurrentIndex,
  removeFromQueue,
  addSongToPlaylist,
}: {
  queue: Song[]
  currentIndex: number
  compactQueue: boolean
  playlists: Playlist[]
  setCurrentIndex: (idx: number) => void
  removeFromQueue: (idx: number) => void
  addSongToPlaylist: (plId: string, song: Song) => void
}) {
  return (
    <div className="h-full w-full relative overflow-hidden" style={{ isolation: "isolate", maskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)" }}>
      <div className="h-full w-full p-4 space-y-3 pb-32 animate-in slide-in-from-bottom-8 duration-700 ease-out overflow-y-auto overscroll-contain no-scrollbar">
        {queue.length > 0 ? (
          queue.map((song, index) => (
            <div key={`${song.videoId}-${index}`} className={cn("group flex items-center gap-3 rounded-[1.5rem] transition-all duration-300 hover:bg-muted/80 min-w-0", index === currentIndex ? "bg-primary/10 shadow-sm border border-primary/20 scale-[1.02]" : "border border-transparent", compactQueue ? "p-2" : "p-3")}>
              <button onClick={() => setCurrentIndex(index)} className="flex flex-1 items-center gap-3 sm:gap-4 text-left outline-none min-w-0">
                <div className={cn("relative flex-shrink-0 overflow-hidden rounded-[1rem] shadow-sm", compactQueue ? "h-12 w-12" : "h-14 w-14")}>
                  <img src={song.thumbnail} className="aspect-square h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden pr-2">
                  <p className={cn("truncate font-bold leading-tight", index === currentIndex ? "text-primary" : "text-foreground", compactQueue ? "text-sm" : "text-base")}>{song.title}</p>
                  <p className={cn("truncate font-semibold text-muted-foreground mt-0.5", compactQueue ? "text-[10px]" : "text-xs")}>{song.artist}</p>
                </div>
              </button>

              {playlists.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity outline-none focus:outline-none shrink-0"><ListPlus className="h-5 w-5 text-current" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                    <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                    {playlists.map((pl) => (
                      <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-[0.98] text-foreground"><ListMusic className="mr-3 h-4 w-4 text-primary" />{pl.name}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" onClick={() => removeFromQueue(index)} className="h-10 w-10 rounded-full opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 text-destructive focus:opacity-100 outline-none focus:outline-none p-0 shrink-0"><X className="h-5 w-5 text-current" /></Button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center"><ListMusic className="h-14 w-14 text-muted-foreground/40 mb-6" /><p className="font-black text-2xl mb-2 text-foreground">Queue is empty</p></div>
        )}
      </div>
    </div>
  )
}

export function LyricsView({
  lyrics,
  currentSong,
  currentLyricIndex,
  lyricsGlass,
  lyricsAlignment,
  getLyricAlignWrapperClass,
  getLyricTextClass,
  getLyricOriginClass,
  containerRef,
  seekTo,
}: {
  lyrics: LyricsData | null
  currentSong?: Song
  currentLyricIndex: number
  lyricsGlass: boolean
  lyricsAlignment: string
  getLyricAlignWrapperClass: () => string
  getLyricTextClass: () => string
  getLyricOriginClass: () => string
  containerRef: React.RefObject<HTMLDivElement | null>
  seekTo: (time: number) => void
}) {
  return (
    <div className="h-full w-full relative overflow-hidden" style={{ isolation: "isolate", maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)" }}>
      <div ref={containerRef} className="h-full w-full overflow-y-auto overscroll-contain no-scrollbar scroll-smooth lyrics-scroll-container pb-[50vh]">
        {lyrics?.syncedLyrics ? (
          <div className={cn("flex flex-col gap-6 py-12 mt-4", getLyricAlignWrapperClass(), lyricsGlass && "bg-black/10 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] mx-4 my-4 p-8 shadow-xl border border-white/5")}>
            {lyrics.syncedLyrics.map((line, index) => (
              <p key={index} onClick={() => seekTo(line.time)} className={cn("lyric-line transition-all duration-500 ease-out cursor-pointer rounded-2xl py-3 font-extrabold leading-relaxed text-center max-w-full tracking-wide", getLyricTextClass(), getLyricOriginClass(), index === currentLyricIndex ? "lyric-active-line scale-[1.05] bg-primary/10 text-primary shadow-sm" : index < currentLyricIndex ? "text-muted-foreground/30 scale-95" : "text-muted-foreground/70 hover:bg-muted hover:text-foreground scale-95", lyricsAlignment === "Center" && "px-6")}>
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
  )
}

export function LibraryView({
  playlists,
  savedSongs,
  compactQueue,
  reduceMotion,
  setShowPlaylistDialog,
  loadPlaylistView,
  playFromLibrary,
  toggleLike,
  addSongToPlaylist,
}: {
  playlists: Playlist[]
  savedSongs: Song[]
  compactQueue: boolean
  reduceMotion: boolean
  setShowPlaylistDialog: (val: boolean) => void
  loadPlaylistView: (pl: Playlist) => void
  playFromLibrary: (s: Song) => void
  toggleLike: (s: Song) => void
  addSongToPlaylist: (plId: string, s: Song) => void
}) {
  return (
    <div className="h-full w-full relative overflow-hidden" style={{ isolation: "isolate", maskImage: "linear-gradient(to bottom, black 0%, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 90%, transparent 100%)" }}>
      <div className="h-full w-full p-4 space-y-8 pb-32 animate-in slide-in-from-bottom-8 duration-700 ease-out overflow-y-auto overscroll-contain no-scrollbar">
        <div>
          <div className="mb-5 px-3 flex items-center justify-between">
            <h3 className="font-extrabold text-xl flex items-center gap-3 text-foreground"><ListPlus className="h-6 w-6 text-primary" /> Playlists</h3>
            <Button variant="secondary" size="sm" onClick={() => setShowPlaylistDialog(true)} className="rounded-xl font-bold text-sm h-10 px-4 text-foreground bg-secondary hover:bg-secondary/80 outline-none focus:outline-none">New</Button>
          </div>
          {playlists.length > 0 ? (
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <div key={playlist.id} onClick={() => loadPlaylistView(playlist)} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-muted/40 hover:bg-muted/80 transition-colors cursor-pointer text-foreground min-w-0">
                  <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black shadow-sm shrink-0"><ListMusic className="h-6 w-6 text-current" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base truncate">{playlist.name}</p>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">{playlist.songs.length} songs</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-4 font-medium">No playlists created yet.</p>
          )}
        </div>

        <div>
          <div className="mb-5 px-3 flex items-center justify-between">
            <h3 className="font-extrabold text-xl flex items-center gap-3 text-foreground"><Heart className="h-6 w-6 text-[var(--google-red)] fill-current" /> Liked Songs</h3>
          </div>
          {savedSongs.length > 0 ? (
            <div className="space-y-3">
              {savedSongs.map((song, index) => (
                <div key={`lib-${song.videoId}-${index}`} className="group flex items-center gap-3 rounded-[1.5rem] p-3 transition-all duration-300 hover:bg-muted/80 min-w-0">
                  <button onClick={() => playFromLibrary(song)} className="flex flex-1 items-center gap-3 sm:gap-4 text-left outline-none min-w-0">
                    <img src={song.thumbnail} className={cn("aspect-square rounded-[1rem] object-cover shadow-sm shrink-0", !reduceMotion && "transition-transform duration-500 group-hover:scale-105", compactQueue ? "h-12 w-12" : "h-14 w-14")} />
                    <div className="flex-1 min-w-0 overflow-hidden pr-2">
                      <p className={cn("truncate font-bold leading-tight text-foreground transition-colors", compactQueue ? "text-sm" : "text-base")}>{song.title}</p>
                      <p className={cn("truncate font-semibold text-muted-foreground transition-colors", compactQueue ? "text-xs mt-0.5" : "text-sm mt-1")}>{song.artist}</p>
                    </div>
                  </button>
                  {playlists.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary outline-none focus:outline-none shrink-0"><ListPlus className="h-5 w-5 text-current" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[1.5rem] p-2 z-[300]">
                        <DropdownMenuItem disabled className="font-extrabold text-[10px] tracking-widest uppercase text-muted-foreground/70 px-3 py-1">Add to Playlist</DropdownMenuItem>
                        {playlists.map((pl) => (
                          <DropdownMenuItem key={pl.id} onSelect={() => addSongToPlaylist(pl.id, song)} className="font-semibold cursor-pointer rounded-xl py-3 transition-all active:scale-[0.98] text-foreground"><ListMusic className="mr-3 h-4 w-4 text-primary" />{pl.name}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => toggleLike(song)} className="h-10 w-10 rounded-full text-[var(--google-red)] opacity-100 flex items-center justify-center transition-all duration-300 hover:bg-[var(--google-red)]/10 active:scale-90 outline-none focus:outline-none p-0 shrink-0">
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
  )
}
