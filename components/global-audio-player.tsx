"use client"

import { usePlayer } from "context/player-context"
import { Button } from "components/ui/button"
import { Slider } from "components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function GlobalAudioPlayer() {
  const {
    currentEpisode,
    currentShow,
    isPlaying,
    currentTime,
    duration,
    volume,
    playEpisode,
    pause,
    resume,
    seek,
    setVolume,
  } = usePlayer()

  if (!currentEpisode || !currentShow) {
    return null // Don't render if no episode is loaded
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      resume()
    }
  }

  const handleSeek = (value: number[]) => {
    seek(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-4 flex flex-col md:flex-row items-center gap-4">
      <div className="flex items-center gap-3 w-full md:w-1/3">
        <Image
          src={currentShow.image || "/placeholder.svg?height=64&width=64&query=podcast-cover"}
          alt={currentShow.title}
          width={64}
          height={64}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col min-w-0">
          <Link href={`/show/${currentShow.id}`} className="font-semibold text-sm truncate hover:underline">
            {currentShow.title}
          </Link>
          <span className="text-muted-foreground text-xs truncate">{currentEpisode.title}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full md:w-1/3">
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-muted-foreground tabular-nums">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-primary/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
            aria-label="Playback progress"
          />
          <span className="text-xs text-muted-foreground tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-1/3 justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
          aria-label={volume === 0 ? "Unmute" : "Mute"}
        >
          {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-24 [&>span:first-child]:h-1 [&>span:first-child]:bg-primary/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
          aria-label="Volume control"
        />
      </div>
    </div>
  )
}
