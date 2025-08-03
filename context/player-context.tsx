"use client"

import type React from "react"
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import type { Episode, Show } from "lib/api"

// Define type for listening history entry
export type ListeningHistoryEntry = {
  episodeId: string
  showId: string
  progress: number // Current playback time in seconds
  duration: number // Total duration in seconds
  finished: boolean
  lastPlayedAt: string // ISO string date
}

type PlayerState = {
  currentEpisode: Episode | null
  currentShow: Show | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
}

type PlayerActions = {
  playEpisode: (episode: Episode, show: Show, initialTime?: number) => void
  pause: () => void
  resume: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  getEpisodeProgress: (episodeId: string) => ListeningHistoryEntry | undefined
  resetListeningHistory: () => void
}

const PlayerContext = createContext<(PlayerState & PlayerActions) | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null) // Use useRef for the audio element
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentEpisode: null,
    currentShow: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7, // Default volume
    isLoading: false,
  })
  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryEntry[]>([])
  const isLoadedRef = useRef(false) // To ensure localStorage is loaded once

  // Load listening history from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoadedRef.current) {
      const storedHistory = localStorage.getItem("podcastListeningHistory")
      if (storedHistory) {
        setListeningHistory(JSON.parse(storedHistory))
      }
      isLoadedRef.current = true
    }
  }, [])

  // Save listening history to localStorage whenever it changes
  useEffect(() => {
    if (isLoadedRef.current && typeof window !== "undefined") {
      localStorage.setItem("podcastListeningHistory", JSON.stringify(listeningHistory))
    }
  }, [listeningHistory])

  // Initialize audio element and set volume
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = playerState.volume
    }
  }, [playerState.volume])

  // Event listeners for audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (playerState.currentEpisode) {
        const newTime = audio.currentTime
        const newDuration = audio.duration
        setPlayerState((prev) => ({
          ...prev,
          currentTime: newTime,
          duration: newDuration,
        }))

        // Update listening history
        setListeningHistory((prevHistory) => {
          const existingIndex = prevHistory.findIndex((entry) => entry.episodeId === playerState.currentEpisode?.id)
          const finished = newTime >= newDuration - 1 // Mark as finished if within 1 second of end

          const newEntry: ListeningHistoryEntry = {
            episodeId: playerState.currentEpisode.id,
            showId: playerState.currentShow?.id || "",
            progress: newTime,
            duration: newDuration,
            finished: finished,
            lastPlayedAt: new Date().toISOString(),
          }

          if (existingIndex > -1) {
            const updatedHistory = [...prevHistory]
            updatedHistory[existingIndex] = newEntry
            return updatedHistory
          } else {
            return [...prevHistory, newEntry]
          }
        })
      }
    }

    const handleLoadedMetadata = () => {
      if (audio) {
        setPlayerState((prev) => ({
          ...prev,
          duration: audio.duration,
          isLoading: false,
        }))
      }
    }

    const handleEnded = () => {
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }))
      // currentPlayingEpisodeId = null; // No longer needed with useRef
    }

    const handlePlay = () => {
      setPlayerState((prev) => ({ ...prev, isPlaying: true, isLoading: false }))
    }

    const handlePause = () => {
      setPlayerState((prev) => ({ ...prev, isPlaying: false }))
    }

    const handleWaiting = () => {
      setPlayerState((prev) => ({ ...prev, isLoading: true }))
    }

    const handleCanPlay = () => {
      setPlayerState((prev) => ({ ...prev, isLoading: false }))
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("canplay", handleCanPlay)

    // Confirmation prompt on page reload/close
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (playerState.isPlaying) {
        event.preventDefault()
        event.returnValue = "" // Required for Chrome
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", handleTimeUpdate)
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("play", handlePlay)
        audio.removeEventListener("pause", handlePause)
        audio.removeEventListener("waiting", handleWaiting)
        audio.removeEventListener("canplay", handleCanPlay)
      }
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [playerState.isPlaying, playerState.currentEpisode, playerState.currentShow])

  const playEpisode = useCallback(
    (episode: Episode, show: Show, initialTime = 0) => {
      const audio = audioRef.current
      if (!audio) return

      // Check if a new episode is selected or if current episode is paused
      if (playerState.currentEpisode?.id !== episode.id || !playerState.isPlaying) {
        audio.src = episode.file
        setPlayerState((prev) => ({
          ...prev,
          currentEpisode: episode,
          currentShow: show,
          currentTime: initialTime, // Set initial time
          duration: 0, // Reset duration until loaded
          isLoading: true,
        }))
        audio.currentTime = initialTime // Set current time before playing
      }

      audio
        .play()
        .then(() => {
          setPlayerState((prev) => ({ ...prev, isPlaying: true, isLoading: false }))
        })
        .catch((error) => {
          console.error("Error playing audio:", error)
          setPlayerState((prev) => ({ ...prev, isPlaying: false, isLoading: false }))
        })
    },
    [playerState.currentEpisode, playerState.isPlaying],
  )

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      setPlayerState((prev) => ({ ...prev, isPlaying: false }))
    }
  }, [])

  const resume = useCallback(() => {
    const audio = audioRef.current
    if (audio && playerState.currentEpisode) {
      audio
        .play()
        .then(() => {
          setPlayerState((prev) => ({ ...prev, isPlaying: true, isLoading: false }))
        })
        .catch((error) => {
          console.error("Error resuming audio:", error)
          setPlayerState((prev) => ({ ...prev, isPlaying: false, isLoading: false }))
        })
    }
  }, [playerState.currentEpisode])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = time
      setPlayerState((prev) => ({ ...prev, currentTime: time }))
    }
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = newVolume
    }
    setPlayerState((prev) => ({ ...prev, volume: newVolume }))
  }, [])

  const getEpisodeProgress = useCallback(
    (episodeId: string): ListeningHistoryEntry | undefined => {
      return listeningHistory.find((entry) => entry.episodeId === episodeId)
    },
    [listeningHistory],
  )

  const resetListeningHistory = useCallback(() => {
    setListeningHistory([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("podcastListeningHistory")
    }
  }, [])

  const value = {
    ...playerState,
    playEpisode,
    pause,
    resume,
    seek,
    setVolume,
    getEpisodeProgress,
    resetListeningHistory,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}
