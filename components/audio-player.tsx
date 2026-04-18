"use client"

import * as React from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, ListMusic } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Track {
  id: number
  title: string
  artist: string
  album: string
  duration: number
  cover: string
}

const sampleTracks: Track[] = [
  { id: 1, title: "Midnight Dreams", artist: "Luna Echo", album: "Starlight Sessions", duration: 234, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
  { id: 2, title: "Electric Pulse", artist: "Neon Waves", album: "Digital Horizons", duration: 198, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
  { id: 3, title: "Ocean Breeze", artist: "Coastal Sounds", album: "Tidal Rhythms", duration: 267, cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop" },
  { id: 4, title: "Urban Nights", artist: "City Lights", album: "Metropolitan", duration: 312, cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop" },
  { id: 5, title: "Forest Walk", artist: "Nature Sounds", album: "Wilderness", duration: 189, cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop" },
  { id: 6, title: "Cosmic Journey", artist: "Space Travelers", album: "Beyond Stars", duration: 276, cover: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop" },
  { id: 7, title: "Jazz Cafe", artist: "Smooth Ensemble", album: "Evening Notes", duration: 243, cover: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop" },
  { id: 8, title: "Summer Vibes", artist: "Beach House", album: "Golden Hour", duration: 228, cover: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop" },
]

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function AudioPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [volume, setVolume] = React.useState([75])
  const [isMuted, setIsMuted] = React.useState(false)
  const [isShuffled, setIsShuffled] = React.useState(false)
  const [repeatMode, setRepeatMode] = React.useState<"off" | "all" | "one">("off")
  const [showPlaylist, setShowPlaylist] = React.useState(true)
  
  const currentTrack = sampleTracks[currentTrackIndex]
  const progressPercent = (currentTime / currentTrack.duration) * 100

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            handleNext()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentTrack.duration])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    if (currentTime > 3) {
      setCurrentTime(0)
    } else {
      setCurrentTrackIndex((prev) => (prev === 0 ? sampleTracks.length - 1 : prev - 1))
      setCurrentTime(0)
    }
  }

  const handleNext = () => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * sampleTracks.length)
      setCurrentTrackIndex(randomIndex)
    } else if (repeatMode === "one") {
      setCurrentTime(0)
    } else {
      setCurrentTrackIndex((prev) => (prev === sampleTracks.length - 1 ? 0 : prev + 1))
    }
    setCurrentTime(0)
  }

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * currentTrack.duration
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    setIsMuted(value[0] === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all"
      if (prev === "all") return "one"
      return "off"
    })
  }

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background lg:flex-row">
      {/* Main Player Area */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
        {/* Album Art */}
        <div className="relative mb-8 aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl">
          <img
            src={currentTrack.cover}
            alt={`${currentTrack.album} cover`}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700",
              isPlaying && "scale-105"
            )}
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>

        {/* Track Info */}
        <div className="mb-6 text-center">
          <h2 className="text-balance text-2xl font-semibold text-foreground lg:text-3xl">
            {currentTrack.title}
          </h2>
          <p className="mt-1 text-muted-foreground">{currentTrack.artist}</p>
          <p className="text-sm text-muted-foreground/70">{currentTrack.album}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 w-full max-w-md">
          <Slider
            value={[progressPercent]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="mb-8 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsShuffled(!isShuffled)}
            className={cn(
              "text-muted-foreground transition-colors hover:text-foreground",
              isShuffled && "text-primary"
            )}
          >
            <Shuffle className="size-5" />
            <span className="sr-only">Shuffle</span>
          </Button>

          <Button
            variant="ghost"
            size="icon-lg"
            onClick={handlePrevious}
            className="text-foreground hover:scale-105 transition-transform"
          >
            <SkipBack className="size-6" />
            <span className="sr-only">Previous track</span>
          </Button>

          <Button
            size="icon-lg"
            onClick={handlePlayPause}
            className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-primary/25"
          >
            {isPlaying ? (
              <Pause className="size-7" />
            ) : (
              <Play className="ml-1 size-7" />
            )}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon-lg"
            onClick={handleNext}
            className="text-foreground hover:scale-105 transition-transform"
          >
            <SkipForward className="size-6" />
            <span className="sr-only">Next track</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={cycleRepeatMode}
            className={cn(
              "relative text-muted-foreground transition-colors hover:text-foreground",
              repeatMode !== "off" && "text-primary"
            )}
          >
            <Repeat className="size-5" />
            {repeatMode === "one" && (
              <span className="absolute -right-0.5 -top-0.5 text-[10px] font-bold text-primary">
                1
              </span>
            )}
            <span className="sr-only">Repeat mode: {repeatMode}</span>
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex w-full max-w-xs items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMute}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {isMuted || volume[0] === 0 ? (
              <VolumeX className="size-5" />
            ) : (
              <Volume2 className="size-5" />
            )}
            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
          <Slider
            value={isMuted ? [0] : volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="cursor-pointer"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={cn(
              "shrink-0 text-muted-foreground transition-colors hover:text-foreground lg:hidden",
              showPlaylist && "text-primary"
            )}
          >
            <ListMusic className="size-5" />
            <span className="sr-only">Toggle playlist</span>
          </Button>
        </div>
      </div>

      {/* Playlist Panel */}
      <div
        className={cn(
          "border-t border-border bg-card transition-all duration-300 lg:w-96 lg:border-l lg:border-t-0",
          showPlaylist ? "h-80 lg:h-auto" : "h-0 overflow-hidden lg:h-auto"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="font-semibold text-foreground">Playlist</h3>
            <span className="text-sm text-muted-foreground">
              {sampleTracks.length} tracks
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {sampleTracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(index)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-secondary/50",
                    currentTrackIndex === index && "bg-secondary"
                  )}
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
                    <img
                      src={track.cover}
                      alt={track.album}
                      className="size-full object-cover"
                      crossOrigin="anonymous"
                    />
                    {currentTrackIndex === index && isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <div className="flex items-end gap-0.5">
                          <span className="h-3 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                          <span className="h-4 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        currentTrackIndex === index
                          ? "text-primary"
                          : "text-foreground group-hover:text-foreground"
                      )}
                    >
                      {track.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {track.artist}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatTime(track.duration)}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
