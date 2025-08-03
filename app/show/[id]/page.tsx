"use client"

import { useState, useEffect, use } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "components/ui/button"
import { Card, CardContent, CardTitle } from "components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "components/ui/accordion"
import { fetchShowById, type Show, getGenreNames, type Episode } from "lib/api"
import { usePlayer } from "context/player-context"
import { useFavourites } from "context/favourites-context"
import { ArrowLeft, Play, Pause, Heart, CheckCircle } from "lucide-react"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Progress } from "components/ui/progress"

export default function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const { id } = unwrappedParams
  const [show, setShow] = useState<Show | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { playEpisode, currentEpisode, isPlaying, getEpisodeProgress } = usePlayer()
  const { favourites, addFavourite, removeFavourite } = useFavourites()

  useEffect(() => {
    const getShow = async () => {
      try {
        const data = await fetchShowById(id)
        setShow(data)
      } catch (err) {
        setError("Failed to fetch show details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getShow()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="sr-only">Loading show details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (!show) {
    notFound() // If show is null after loading, it means it wasn't found
  }

  const isEpisodeFavourited = (episodeId: string) => {
    return favourites.some((fav) => fav.episode.id === episodeId)
  }

  // Modified to accept seasonNumber
  const handleFavouriteToggle = (episode: Episode, seasonNumber: number) => {
    if (isEpisodeFavourited(episode.id)) {
      removeFavourite(episode.id)
    } else {
      addFavourite(episode, show, seasonNumber) // Pass the correct seasonNumber
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shows
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <Image
            src={show.image || "/placeholder.svg?height=300&width=300&query=podcast-cover"}
            alt={show.title}
            width={300}
            height={300}
            className="rounded-lg object-cover aspect-square"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{show.title}</h1>
          <p className="text-muted-foreground mb-4">{show.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {getGenreNames(show.genres || []).map((genre, index) => (
              <span key={index} className="text-sm bg-muted px-3 py-1 rounded-full">
                {genre}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Last updated: {format(new Date(show.updated), "PPP")}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Seasons ({show.seasons.length})</h2>
        <Accordion type="single" collapsible className="w-full">
          {show.seasons.map((season) => (
            <AccordionItem key={season.season} value={`season-${season.season}`}>
              <AccordionTrigger>
                <div className="flex items-center gap-4">
                  <Image
                    src={season.image || "/placeholder.svg?height=64&width=64&query=season-cover"}
                    alt={`Season ${season.season}`}
                    width={64}
                    height={64}
                    className="rounded-md object-cover"
                  />
                  <span>
                    Season {season.season}: {season.title} ({season.episodes.length} episodes)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 p-4">
                  {season.episodes.map((episode) => {
                    const progressData = getEpisodeProgress(episode.id)
                    const progressPercentage =
                      progressData && progressData.duration > 0
                        ? (progressData.progress / progressData.duration) * 100
                        : 0
                    const isFinished = progressData?.finished

                    return (
                      <Card key={episode.id} className="flex items-center p-4 relative">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Episode {episode.episode}: {episode.title}
                          </CardTitle>
                          <CardContent className="p-0 text-sm text-muted-foreground line-clamp-2">
                            {episode.description}
                          </CardContent>
                          {progressData && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              {isFinished ? (
                                <span className="flex items-center text-green-500">
                                  <CheckCircle className="h-4 w-4 mr-1" /> Finished
                                </span>
                              ) : (
                                <>
                                  <Progress value={progressPercentage} className="h-2 w-24" />
                                  <span>{Math.round(progressPercentage)}% listened</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFavouriteToggle(episode, season.season)} // Pass season.season
                            aria-label={isEpisodeFavourited(episode.id) ? "Unfavourite" : "Favourite"}
                          >
                            <Heart
                              className={
                                isEpisodeFavourited(episode.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                              }
                            />
                          </Button>
                          <Button
                            onClick={() => playEpisode(episode, show, progressData?.progress || 0)}
                            variant={currentEpisode?.id === episode.id && isPlaying ? "secondary" : "default"}
                          >
                            {currentEpisode?.id === episode.id && isPlaying ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" /> Playing
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" /> Play
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
