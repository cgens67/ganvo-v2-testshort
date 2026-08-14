"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  ArrowLeft,
  PaintBucket,
  CloudDownload,
  Check,
  Palette,
  LayoutTemplate,
  Moon,
  Activity,
  Wind,
  Droplets,
  EyeOff,
  Rows3,
  Music2,
  CornerUpRight,
  Maximize2,
  Timer,
  Gauge,
  Speaker,
  ListFilter,
  SlidersHorizontal,
  Scissors,
  GitMerge,
  CircleStop,
  Mic2,
  ArrowDownUp,
  AlignLeft,
  MicVocal,
  Type,
  History,
  Ghost,
  Wifi,
  Trash2,
  ChevronRight,
  UserCircle2,
  ListPlus,
  Heart,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ColorTheme } from "@/types/player"

const PlayIcon = ({ className }: { className?: string }) => (
  <span className={cn("material-symbols-rounded block flex-shrink-0", className)} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 40", lineHeight: 1 }}>
    play_arrow
  </span>
)

const SettingsRow = ({ icon: Icon, title, desc, onClick, children }: { icon: any; title: string; desc: string; onClick?: () => void; children?: React.ReactNode }) => (
  <div onClick={onClick} className="flex items-center justify-between p-3 sm:p-4 bg-transparent rounded-[1.5rem] cursor-pointer hover:bg-muted/50 transition-colors gap-3 min-w-0">
    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
      <div className="p-2 sm:p-2.5 bg-muted/80 rounded-xl text-foreground shrink-0"><Icon className="w-5 h-5 text-current" /></div>
      <div className="flex flex-col flex-1 min-w-0 pr-2">
        <span className="font-bold text-sm sm:text-base text-foreground truncate">{title}</span>
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground leading-tight mt-0.5 line-clamp-2 sm:line-clamp-1">{desc}</span>
      </div>
    </div>
    {children}
  </div>
)

export function ColorPaletteDialog({
  showColorPalette,
  setShowColorPalette,
  colorTheme,
  setColorTheme,
  activeTheme,
  ALL_THEMES,
  setShowCustomThemeDialog,
  setShowImportThemeDialog,
}: {
  showColorPalette: boolean
  setShowColorPalette: (v: boolean) => void
  colorTheme: string
  setColorTheme: (v: string) => void
  activeTheme: ColorTheme
  ALL_THEMES: ColorTheme[]
  setShowCustomThemeDialog: (v: boolean) => void
  setShowImportThemeDialog: (v: boolean) => void
}) {
  return (
    <Dialog open={showColorPalette} onOpenChange={setShowColorPalette}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-0 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[500] max-h-[85svh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-4 p-4 sm:p-6 border-b bg-card/40 backdrop-blur-md shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setShowColorPalette(false)} className="rounded-full text-foreground outline-none focus:outline-none"><ArrowLeft className="w-6 h-6 text-current" /></Button>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Color Palette</h2>
        </div>
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto overscroll-contain no-scrollbar pb-10">
          <div className="w-full h-52 sm:h-60 rounded-[2rem] relative shadow-xl mb-8 flex flex-col justify-between p-6 sm:p-8 transition-colors duration-500 overflow-hidden shrink-0" style={{ backgroundColor: colorTheme === "default" ? "#0f172a" : activeTheme.secondary }}>
            <div className="flex justify-between items-start z-10 relative w-full">
              <div className="space-y-3 w-1/2">
                <div className="w-12 h-10 rounded-xl bg-white/20 backdrop-blur-md shadow-sm" />
                <div className="flex items-center">
                  <div className="w-3/4 h-2 rounded-l-full bg-white transition-colors duration-500" style={{ backgroundColor: colorTheme === "default" ? "#38bdf8" : activeTheme.primary }} />
                  <div className="w-1/4 h-2 rounded-r-full bg-white/20" />
                </div>
              </div>
              <div className="w-14 h-14 shrink-0 rounded-[1.25rem] flex items-center justify-center shadow-lg bg-white transition-colors duration-500" style={{ backgroundColor: colorTheme === "default" ? "#38bdf8" : activeTheme.primary }}>
                <PlayIcon className="text-[28px] text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 px-4 py-2 rounded-tl-2xl font-bold text-xs transition-colors duration-500 shadow-xl bg-white text-white uppercase tracking-widest" style={{ backgroundColor: colorTheme === "default" ? "#38bdf8" : activeTheme.primary }}>
              {activeTheme.name || "Default"}
            </div>
          </div>

          <div className="relative w-full mb-8">
            <div className="flex overflow-x-auto gap-3 py-2 no-scrollbar snap-x z-10">
              {ALL_THEMES.map((theme) => (
                <div key={theme.id} onClick={() => { setColorTheme(theme.id); localStorage.setItem("ganvo_color_theme", theme.id); }} className={cn("relative shrink-0 w-20 h-20 rounded-[1.5rem] flex items-center justify-center cursor-pointer transition-all active:scale-95 snap-center", colorTheme === theme.id ? "border-[3px] scale-105" : "border-2 border-transparent opacity-80 hover:opacity-100 bg-muted/30")} style={{ borderColor: colorTheme === theme.id ? theme.primary || "#94a3b8" : undefined }}>
                  <div className="w-14 h-14 rounded-full overflow-hidden flex transform -rotate-45 shadow-sm">
                    <div className="w-1/2 h-full" style={{ backgroundColor: theme.primary || "#94a3b8" }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: theme.secondary || "#64748b" }} />
                  </div>
                  {colorTheme === theme.id && (
                    <div className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                      <Check className="text-[14px]" style={{ color: theme.primary || "#0f172a" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => setShowCustomThemeDialog(true)} className="rounded-[1.25rem] w-full h-12 sm:h-14 font-bold text-sm sm:text-base bg-primary text-primary-foreground shadow-lg hover:scale-[1.02] active:scale-95 transition-all"><PaintBucket className="mr-2.5 w-5 h-5" /> Create Custom Theme</Button>
            <Button onClick={() => setShowImportThemeDialog(true)} variant="secondary" className="rounded-[1.25rem] w-full h-12 sm:h-14 font-bold text-sm sm:text-base shadow-sm hover:scale-[1.02] active:scale-95 transition-all"><CloudDownload className="mr-2.5 w-5 h-5" /> Import Theme JSON</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CustomThemeDialog({ showCustomThemeDialog, setShowCustomThemeDialog, tempPrimaryColor, setTempPrimaryColor, tempSecondaryColor, setTempSecondaryColor, handleSaveCustomTheme }: any) {
  return (
    <Dialog open={showCustomThemeDialog} onOpenChange={setShowCustomThemeDialog}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-6 sm:p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[550] max-h-[85svh] overflow-y-auto">
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
  )
}

export function ImportThemeDialog({ showImportThemeDialog, setShowImportThemeDialog, importThemeString, setImportThemeString, handleImportTheme }: any) {
  return (
    <Dialog open={showImportThemeDialog} onOpenChange={setShowImportThemeDialog}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-6 sm:p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[550] max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-foreground">Import Theme</DialogTitle>
          <DialogDescription className="font-medium text-base">Paste a theme JSON object.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleImportTheme} className="space-y-6 mt-4">
          <Textarea value={importThemeString} onChange={(e) => setImportThemeString(e.target.value)} placeholder={`{\n  "primary": "#ff0000",\n  "secondary": "#990000"\n}`} className="min-h-[150px] rounded-[1.5rem] font-mono text-sm bg-muted/50 border-transparent text-foreground resize-none p-4" />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setShowImportThemeDialog(false)} className="rounded-[1.5rem] h-12 font-bold px-6">Cancel</Button>
            <Button type="submit" disabled={!importThemeString.trim()} className="rounded-[1.5rem] h-12 font-bold px-8 bg-primary text-primary-foreground shadow-lg hover:scale-105 disabled:opacity-50">Apply</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PlayerSettingsDialog({
  showPlayerSettings,
  setShowPlayerSettings,
  activeTheme,
  setShowColorPalette,
  dynamicTheme,
  setDynamicTheme,
  isDark,
  setIsDark,
  reduceMotion,
  setReduceMotion,
  disableAnimations,
  setDisableAnimations,
  disableBlur,
  setDisableBlur,
  hideCreatorsPicks,
  setHideCreatorsPicks,
  compactQueue,
  setCompactQueue,
  playerStyle,
  setPlayerStyle,
  playerBgStyle,
  setPlayerBgStyle,
  thumbnailRadius,
  setThumbnailRadius,
  autoSwitchToPlayer,
  setAutoSwitchToPlayer,
  showTimeRemaining,
  setShowTimeRemaining,
  showPlaybackSpeed,
  setShowPlaybackSpeed,
  audioQuality,
  setAudioQuality,
  autoPlaySimilar,
  setAutoPlaySimilar,
  normalizeVolume,
  setNormalizeVolume,
  skipSilence,
  setSkipSilence,
  crossfade,
  setCrossfade,
  stopAfterCurrent,
  setStopAfterCurrent,
  autoOpenLyrics,
  setAutoOpenLyrics,
  autoScrollLyrics,
  setAutoScrollLyrics,
  lyricsAlignment,
  setLyricsAlignment,
  lyricsGlass,
  setLyricsGlass,
  lyricsProvider,
  setLyricsProvider,
  lyricsSize,
  setLyricsSize,
  saveSearchHistory,
  setSaveSearchHistory,
  privateSession,
  setPrivateSession,
  dataSaver,
  setDataSaver,
}: any) {
  return (
    <Dialog open={showPlayerSettings} onOpenChange={setShowPlayerSettings}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-0 border-0 shadow-2xl animate-in zoom-in-95 duration-500 outline-none overflow-hidden bg-background !z-[400] max-h-[85svh] flex flex-col">
        <div className="flex items-center gap-4 p-4 sm:p-6 border-b bg-card/50 backdrop-blur-sm shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setShowPlayerSettings(false)} className="rounded-full text-foreground outline-none"><ArrowLeft className="w-6 h-6 text-current" /></Button>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Settings</h2>
        </div>
        <div className="p-2 overflow-y-auto overscroll-contain flex-1 no-scrollbar pb-10">
          <div className="px-3 md:px-5 py-4 space-y-1">
            <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-3 uppercase tracking-widest ml-4 mt-2">Appearance</h3>
            <SettingsRow icon={Palette} title="Theme colors" desc={activeTheme.name || "Default"} onClick={() => setShowColorPalette(true)}>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </SettingsRow>
            <SettingsRow icon={LayoutTemplate} title="Dynamic theme" desc="Extracts colors from the active album cover.">
              <Switch checked={dynamicTheme} onCheckedChange={setDynamicTheme} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Moon} title="Dark mode" desc="Toggle application theme." onClick={() => setIsDark(!isDark)}>
              <Switch checked={isDark} onCheckedChange={setIsDark} className="shrink-0 pointer-events-none" />
            </SettingsRow>
            <SettingsRow icon={Activity} title="Reduce motion" desc="Disables player scale animations.">
              <Switch checked={reduceMotion} onCheckedChange={(val) => { setReduceMotion(val); localStorage.setItem("ganvo_reduce_motion", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Wind} title="Disable all animations" desc="Removes all transitions and motion.">
              <Switch checked={disableAnimations} onCheckedChange={(val) => { setDisableAnimations(val); localStorage.setItem("ganvo_disable_animations", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Droplets} title="Disable blur effects" desc="Removes backdrop blurs for performance.">
              <Switch checked={disableBlur} onCheckedChange={(val) => { setDisableBlur(val); localStorage.setItem("ganvo_disable_blur", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={EyeOff} title="Hide Creator's Picks" desc="Remove top picks from the Explore tab.">
              <Switch checked={hideCreatorsPicks} onCheckedChange={(val) => { setHideCreatorsPicks(val); localStorage.setItem("ganvo_hide_picks", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Rows3} title="Compact queue layout" desc="Shrink queue items to show more per page.">
              <Switch checked={compactQueue} onCheckedChange={(val) => { setCompactQueue(val); localStorage.setItem("ganvo_compact_queue", val.toString()) }} className="shrink-0" />
            </SettingsRow>
          </div>

          <div className="px-3 md:px-5 py-4 space-y-1">
            <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-3 uppercase tracking-widest ml-4 mt-2">Player View</h3>
            <SettingsRow icon={Music2} title="Player style" desc="Main screen design.">
              <Select value={playerStyle} onValueChange={(v: any) => { setPlayerStyle(v); localStorage.setItem("ganvo_player_style", v); }}>
                <SelectTrigger className="w-[110px] md:w-[130px] rounded-xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 shrink-0 outline-none"><SelectValue placeholder="Style" /></SelectTrigger>
                <SelectContent className="rounded-2xl z-[500]"><SelectItem value="Classic">Classic</SelectItem><SelectItem value="Open">Open</SelectItem><SelectItem value="Modern">Modern</SelectItem><SelectItem value="Minimal">Minimal</SelectItem><SelectItem value="Cinematic">Cinematic</SelectItem><SelectItem value="Expressive">Expressive</SelectItem><SelectItem value="Immersive">Immersive</SelectItem></SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow icon={LayoutTemplate} title="Background style" desc="How the background renders.">
              <Select disabled={!dynamicTheme} value={playerBgStyle} onValueChange={(v: any) => setPlayerBgStyle(v)}>
                <SelectTrigger className="w-[110px] md:w-[130px] rounded-xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 shrink-0 outline-none"><SelectValue placeholder="Style" /></SelectTrigger>
                <SelectContent className="rounded-2xl z-[500]"><SelectItem value="Theme">Theme</SelectItem><SelectItem value="Gradient">Gradient</SelectItem><SelectItem value="Blur">Blur</SelectItem></SelectContent>
              </Select>
            </SettingsRow>

            <div className="flex flex-col p-3 md:p-4 mt-1 bg-transparent rounded-2xl transition-colors">
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="p-2 sm:p-2.5 bg-muted/80 rounded-xl text-foreground shrink-0"><CornerUpRight className="w-5 h-5 text-current" /></div>
                  <span className="font-bold text-sm sm:text-base text-foreground truncate">Thumbnail corner radius</span>
                </div>
                <span className="text-xs font-bold bg-muted px-2.5 py-1.5 rounded-full text-foreground shrink-0">{thumbnailRadius}px</span>
              </div>
              <Slider value={[thumbnailRadius]} min={0} max={64} step={2} onValueChange={(val) => setThumbnailRadius(val[0])} className="[&_[data-slot=range]]:bg-primary [&_[data-slot=thumb]]:h-5 [&_[data-slot=thumb]]:w-5 [&_[data-slot=track]]:h-1.5" />
            </div>

            <SettingsRow icon={Maximize2} title="Auto-switch to player" desc="Jump to Player tab when selecting a song.">
              <Switch checked={autoSwitchToPlayer} onCheckedChange={(val) => { setAutoSwitchToPlayer(val); localStorage.setItem("ganvo_auto_switch_player", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Timer} title="Show time remaining" desc="Display countdown instead of duration.">
              <Switch checked={showTimeRemaining} onCheckedChange={(val) => { setShowTimeRemaining(val); localStorage.setItem("ganvo_show_time_remaining", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Gauge} title="Show playback speed" desc="Display speed control on the player.">
              <Switch checked={showPlaybackSpeed} onCheckedChange={(val) => { setShowPlaybackSpeed(val); localStorage.setItem("ganvo_show_playback_speed", val.toString()) }} className="shrink-0" />
            </SettingsRow>
          </div>

          <div className="px-3 md:px-5 py-4 space-y-1">
            <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-3 uppercase tracking-widest ml-4 mt-2">Audio & Playback</h3>
            <SettingsRow icon={Speaker} title="Audio quality" desc="Streaming quality preset.">
              <Select value={audioQuality} onValueChange={(v: any) => { setAudioQuality(v); localStorage.setItem("ganvo_audio_quality", v) }}>
                <SelectTrigger className="w-[100px] md:w-[130px] rounded-xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 shrink-0 outline-none"><SelectValue placeholder="Quality" /></SelectTrigger>
                <SelectContent className="rounded-2xl z-[500]"><SelectItem value="High">High</SelectItem><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow icon={ListFilter} title="Auto-play similar songs" desc="Keep the music going when queue ends.">
              <Switch checked={autoPlaySimilar} onCheckedChange={(val) => { setAutoPlaySimilar(val); localStorage.setItem("ganvo_autoplay_similar", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={SlidersHorizontal} title="Normalize volume" desc="Balance audio levels across tracks.">
              <Switch checked={normalizeVolume} onCheckedChange={(val) => { setNormalizeVolume(val); localStorage.setItem("ganvo_normalize_volume", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Scissors} title="Skip silence" desc="Remove quiet gaps at start/end of songs.">
              <Switch checked={skipSilence} onCheckedChange={(val) => { setSkipSilence(val); localStorage.setItem("ganvo_skip_silence", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={GitMerge} title="Crossfade tracks" desc="Smoothly blend into the next song.">
              <Switch checked={crossfade} onCheckedChange={(val) => { setCrossfade(val); localStorage.setItem("ganvo_crossfade", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={CircleStop} title="Stop after current" desc="Pause playback when this song finishes.">
              <Switch checked={stopAfterCurrent} onCheckedChange={(val) => { setStopAfterCurrent(val); localStorage.setItem("ganvo_stop_after_current", val.toString()) }} className="shrink-0" />
            </SettingsRow>
          </div>

          <div className="px-3 md:px-5 py-4 space-y-1">
            <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-3 uppercase tracking-widest ml-4 mt-2">Lyrics</h3>
            <SettingsRow icon={Mic2} title="Auto-open lyrics" desc="Switch to lyrics when playing a song.">
              <Switch checked={autoOpenLyrics} onCheckedChange={(val) => { setAutoOpenLyrics(val); localStorage.setItem("ganvo_auto_open_lyrics", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={ArrowDownUp} title="Auto-scroll lyrics" desc="Keep active lyric in the center.">
              <Switch checked={autoScrollLyrics} onCheckedChange={(val) => { setAutoScrollLyrics(val); localStorage.setItem("ganvo_auto_scroll_lyrics", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={AlignLeft} title="Text alignment" desc="Align lyrics text to the edges.">
              <Select value={lyricsAlignment} onValueChange={(v: any) => { setLyricsAlignment(v); localStorage.setItem("ganvo_lyrics_alignment", v) }}>
                <SelectTrigger className="w-[100px] md:w-[130px] rounded-xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 shrink-0 outline-none"><SelectValue placeholder="Align" /></SelectTrigger>
                <SelectContent className="rounded-2xl z-[500]"><SelectItem value="Left">Left</SelectItem><SelectItem value="Center">Center</SelectItem><SelectItem value="Right">Right</SelectItem></SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow icon={LayoutTemplate} title="Glass backdrop" desc="Darkened glass effect behind lyrics.">
              <Switch checked={lyricsGlass} onCheckedChange={(val) => { setLyricsGlass(val); localStorage.setItem("ganvo_lyrics_glass", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={MicVocal} title="Data provider" desc="Source used for synced lyrics.">
              <Select value={lyricsProvider} onValueChange={(v: any) => { setLyricsProvider(v); localStorage.setItem("ganvo_lyrics_provider", v) }}>
                <SelectTrigger className="w-[100px] md:w-[130px] rounded-xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 shrink-0 outline-none"><SelectValue placeholder="Provider" /></SelectTrigger>
                <SelectContent className="rounded-2xl z-[500]"><SelectItem value="lrclib">LRCLib</SelectItem><SelectItem value="kugou">KuGou</SelectItem></SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow icon={Type} title="Text size" desc="Adjust synced lyrics font size.">
              <Select value={lyricsSize} onValueChange={(v: any) => setLyricsSize(v)}>
                <SelectTrigger className="w-[110px] md:w-[140px] rounded-xl font-bold bg-muted border-none text-foreground text-xs md:text-sm h-9 shrink-0 outline-none"><SelectValue placeholder="Size" /></SelectTrigger>
                <SelectContent className="rounded-2xl z-[500]"><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Large">Large</SelectItem><SelectItem value="Extra Large">Extra Large</SelectItem></SelectContent>
              </Select>
            </SettingsRow>
          </div>

          <div className="px-3 md:px-5 py-4 space-y-1">
            <h3 className="text-[11px] md:text-xs font-extrabold text-primary mb-3 uppercase tracking-widest ml-4 mt-2">Data & Privacy</h3>
            <SettingsRow icon={History} title="Save search history" desc="Remember your previous searches.">
              <Switch checked={saveSearchHistory} onCheckedChange={(val) => { setSaveSearchHistory(val); localStorage.setItem("ganvo_save_history", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Ghost} title="Private session" desc="Temporarily pause history tracking.">
              <Switch checked={privateSession} onCheckedChange={(val) => { setPrivateSession(val); localStorage.setItem("ganvo_private_session", val.toString()) }} className="shrink-0" />
            </SettingsRow>
            <SettingsRow icon={Wifi} title="Data saver mode" desc="Reduce network usage when streaming.">
              <Switch checked={dataSaver} onCheckedChange={(val) => { setDataSaver(val); localStorage.setItem("ganvo_data_saver", val.toString()) }} className="shrink-0" />
            </SettingsRow>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-transparent rounded-[1.5rem] cursor-pointer hover:bg-destructive/10 transition-colors text-destructive gap-3 mt-4" onClick={() => { if (window.confirm("Clear all app preferences and search history? Your cloud playlists will not be deleted.")) { localStorage.clear(); window.location.reload(); } }}>
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="p-2 sm:p-2.5 bg-destructive/10 rounded-xl text-current shrink-0"><Trash2 className="w-5 h-5 text-current" /></div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-sm sm:text-base text-current truncate">Clear all local data</span>
                  <span className="text-[11px] sm:text-xs font-medium opacity-80 mt-0.5">Resets settings and search history.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AuthDialog({ showAuthDialog, setShowAuthDialog, email, setEmail, password, setPassword, isSignUp, setIsSignUp, authError, setAuthError, handleEmailAuth, handleGoogleSignIn }: any) {
  return (
    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-6 sm:p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[400] max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <div className="mb-4 sm:mb-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary"><UserCircle2 className="h-10 w-10 text-current" /></div></div>
          <DialogTitle className="text-2xl sm:text-3xl font-black text-center text-foreground">Account Sync</DialogTitle>
          <DialogDescription className="font-medium text-center mt-2 text-sm sm:text-base">Sign in to save your playlists and liked songs to the cloud.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEmailAuth} className="space-y-4 sm:space-y-5 mt-2 sm:mt-4">
          <div className="space-y-3 sm:space-y-4">
            <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-14 rounded-2xl bg-muted/50 border-transparent font-bold px-5 text-base sm:text-lg text-foreground outline-none" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-14 rounded-2xl bg-muted/50 border-transparent font-bold px-5 text-base sm:text-lg text-foreground outline-none" />
          </div>
          {authError && <p className="text-sm font-bold text-destructive text-center p-3 bg-destructive/10 rounded-xl">{authError}</p>}
          <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-base sm:text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] text-primary-foreground outline-none">{isSignUp ? "Create Account" : "Sign In"}</Button>
          <div className="flex items-center gap-3 my-4 sm:my-6"><div className="flex-1 h-px bg-border"></div><span className="text-xs sm:text-sm font-extrabold text-muted-foreground uppercase tracking-widest">OR</span><div className="flex-1 h-px bg-border"></div></div>
          <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full h-14 rounded-2xl font-bold text-base sm:text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 sm:gap-4 text-foreground outline-none border-2">Continue with Google</Button>
          <p className="text-sm sm:text-base text-center font-bold text-primary mt-4 sm:mt-6 cursor-pointer hover:underline" onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}>{isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}</p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AccountSettingsDialog({ showAccountSettings, setShowAccountSettings, user, displayNameInput, setDisplayNameInput, handleUpdateProfile }: any) {
  return (
    <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-6 sm:p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[400] max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-black flex items-center gap-3 sm:gap-4 text-foreground"><UserCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /> Account Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateProfile} className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
          <div className="space-y-2 sm:space-y-3">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-widest ml-2 text-muted-foreground">Display Name</label>
            <Input value={displayNameInput} onChange={(e) => setDisplayNameInput(e.target.value)} placeholder="Your Name" className="h-14 rounded-2xl bg-muted/50 border-transparent font-bold px-5 text-lg sm:text-xl text-foreground outline-none" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-widest ml-2 text-muted-foreground">Email Address</label>
            <Input value={user?.email || ""} disabled className="h-14 rounded-2xl bg-muted/30 border-transparent font-semibold px-5 text-base sm:text-lg text-muted-foreground opacity-70 outline-none" />
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-base sm:text-lg shadow-xl transition-transform active:scale-[0.98] text-primary-foreground outline-none mt-2 sm:mt-4">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PlaylistDialog({ showPlaylistDialog, setShowPlaylistDialog, newPlaylistName, setNewPlaylistName, handleCreatePlaylist }: any) {
  return (
    <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-6 sm:p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[400] max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-black flex items-center gap-3 sm:gap-4 text-foreground"><ListPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /> New Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreatePlaylist} className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
          <div className="space-y-2 sm:space-y-3">
            <Input value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Playlist Name" autoFocus required className="h-14 rounded-2xl bg-muted/50 border-transparent font-bold px-5 text-lg sm:text-xl text-foreground outline-none" />
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-base sm:text-lg shadow-xl transition-transform active:scale-[0.98] text-primary-foreground outline-none">Create Playlist</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AboutDialog({ showAboutDialog, setShowAboutDialog }: any) {
  return (
    <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-6 sm:p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[400] max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <div className="mb-4 sm:mb-6 flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[1.5rem] sm:rounded-[2rem] bg-primary shadow-xl"><Music2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground fill-current" /></div>
            <div>
              <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Ganvo Music</DialogTitle>
              <DialogDescription className="font-bold mt-1 text-sm sm:text-base">Version 2.0.0 (InnerTube Engine)</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-5 text-sm sm:text-base font-medium text-muted-foreground leading-relaxed mt-2">
          <p>A modern audio player powered directly by native InnerTube, featuring clean YouTube Music studio tracks, synchronized lyrics, and fluid Material 3 animations.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CreditsDialog({ showCreditsDialog, setShowCreditsDialog }: any) {
  return (
    <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
      <DialogContent className="rounded-[2rem] sm:max-w-md p-6 sm:p-8 border-0 shadow-2xl animate-in zoom-in-95 bg-background !z-[400] max-h-[85svh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-3 sm:gap-4 text-2xl sm:text-3xl font-black tracking-tight text-foreground"><Heart className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--google-red)] fill-[var(--google-red)]" />Credits</DialogTitle></DialogHeader>
        <div className="space-y-4 sm:space-y-5 mt-4 sm:mt-6">
          <div className="rounded-2xl bg-muted/50 p-5 sm:p-6 border border-border/50">
            <h4 className="mb-2 sm:mb-3 font-extrabold text-base sm:text-lg text-foreground uppercase tracking-wider">Engine</h4>
            <p className="text-sm font-semibold text-muted-foreground">InnerTube WEB_REMIX API Client</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
