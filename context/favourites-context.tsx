"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Episode, Show } from "lib/api"

export type FavouritedEpisode = {
  episode: Episode
  show: {
    id: string
    title: string
    image: string
  }
  seasonNumber: number // Correctly store the season number
  favouritedAt: string // ISO string date
}

type FavouritesContextType = {
  favourites: FavouritedEpisode[]
  addFavourite: (episode: Episode, show: Show, seasonNumber: number) => void // Added seasonNumber
  removeFavourite: (episodeId: string) => void
  isFavourited: (episodeId: string) => boolean
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined)

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<FavouritedEpisode[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favourites from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFavourites = localStorage.getItem("podcastFavourites")
      if (storedFavourites) {
        setFavourites(JSON.parse(storedFavourites))
      }
      setIsLoaded(true)
    }
  }, [])

  // Save favourites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("podcastFavourites", JSON.stringify(favourites))
    }
  }, [favourites, isLoaded])

  const addFavourite = useCallback((episode: Episode, show: Show, seasonNumber: number) => {
    // Receive seasonNumber
    setFavourites((prevFavourites) => {
      if (prevFavourites.some((fav) => fav.episode.id === episode.id)) {
        return prevFavourites // Already favourited
      }
      const newFavourite: FavouritedEpisode = {
        episode,
        show: {
          id: show.id,
          title: show.title,
          image: show.image,
        },
        seasonNumber: seasonNumber, // Use the correct season number
        favouritedAt: new Date().toISOString(),
      }
      return [...prevFavourites, newFavourite]
    })
  }, [])

  const removeFavourite = useCallback((episodeId: string) => {
    setFavourites((prevFavourites) => prevFavourites.filter((fav) => fav.episode.id !== episodeId))
  }, [])

  const isFavourited = useCallback(
    (episodeId: string) => {
      return favourites.some((fav) => fav.episode.id === episodeId)
    },
    [favourites],
  )

  const value = {
    favourites,
    addFavourite,
    removeFavourite,
    isFavourited,
  }

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>
}

export function useFavourites() {
  const context = useContext(FavouritesContext)
  if (context === undefined) {
    throw new Error("useFavourites must be used within a FavouritesProvider")
  }
  return context
}
