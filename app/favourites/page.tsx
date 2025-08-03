"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "components/ui/button"
import { Card, CardTitle, CardDescription } from "components/ui/card"
import { ArrowLeft, Play, Pause, Heart, CheckCircle } from "lucide-react"
import { useFavourites, type FavouritedEpisode } from "context/favourites-context"
import { usePlayer } from "context/player-context"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { Progress } from "components/ui/progress" // Assuming you have shadcn Progress component
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "components/ui/alert-dialog"
import { fetchShowById, type Show } from "lib/api"

type SortOption = "title-asc" | "title-desc" | "date-newest" | "date-oldest"

export default function FavouritesPage() {
  const { favourites, removeFavourite } = useFavourites()
  const { playEpisode, currentEpisode, isPlaying, getEpisodeProgress, resetListeningHistory } = usePlayer()
  const [sortBy, setSortBy] = useState<SortOption>("date-newest")

  const groupedAndSortedFavourites = useMemo(() => {
    const grouped: { [showTitle: string]: FavouritedEpisode[] } = {}

    favourites.forEach((fav) => {
      if (!grouped[fav.show.title]) {
        grouped[fav.show.title] = []
      }
      grouped[fav.show.title].push(fav)
    })

    // Sort episodes within each group
    for (const showTitle in grouped) {
      grouped[showTitle].sort((a, b) => {
        if (sortBy === "title-asc") {
          return a.episode.title.localeCompare(b.episode.title)
        } else if (sortBy === "title-desc") {
          return b.episode.title.localeCompare(a.episode.title)
        } else if (sortBy === "date-newest") {
          return new Date(b.favouritedAt).getTime() - new Date(a.favouritedAt).getTime()
        } else if (sortBy === "date-oldest") {
          return new Date(a.favouritedAt).getTime() - new Date(b.favouritedAt).getTime()
        }
        return 0
      })
    }

    return grouped
  }, [favourites, sortBy])

  const showTitles = Object.keys(groupedAndSortedFavourites).sort() // Sort show titles alphabetically

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shows
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Your Favourites</h1>

      {favourites.length === 0 ? (
        <p className="text-muted-foreground">You haven't favourited any episodes yet.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-newest">Date Added (Newest)</SelectItem>
                  <SelectItem value="date-oldest">Date Added (Oldest)</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset Listening History</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your listening progress for all episodes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetListeningHistory}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-8">
            {showTitles.map((showTitle) => (
              <div key={showTitle}>
                <h2 className="text-2xl font-semibold mb-4">{showTitle}</h2>
                <div className="grid gap-4">
                  {groupedAndSortedFavourites[showTitle].map((fav) => {
                    const progressData = getEpisodeProgress(fav.episode.id)
                    const progressPercentage =
                      progressData && progressData.duration > 0
                        ? (progressData.progress / progressData.duration) * 100
                        : 0
                    const isFinished = progressData?.finished

                    return (
                      <Card key={fav.episode.id} className="flex items-center p-4">
                        <Image
                          src={fav.show.image || "/placeholder.svg?height=64&width=64&query=podcast-cover"}
                          alt={fav.show.title}
                          width={64}
                          height={64}
                          className="rounded-md object-cover mr-4"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg">{fav.episode.title}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            Season {fav.seasonNumber}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            Favourited on: {format(new Date(fav.favouritedAt), "PPP p")}
                          </p>
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
                            onClick={() => removeFavourite(fav.episode.id)}
                            aria-label="Unfavourite"
                          >
                            <Heart className="fill-red-500 text-red-500" />
                          </Button>
                          <Button
                            onClick={async () => {
                              try {
                                const fullShow = await fetchShowById(fav.show.id);
                                playEpisode(fav.episode, fullShow, progressData?.progress || 0);
                              } catch (error) {
                                console.error("Failed to fetch show data:", error);
                                // Fallback to partial show data if fetch fails
                                playEpisode(fav.episode, fav.show as unknown as Show, progressData?.progress || 0);
                              }
                            }}
                            variant={currentEpisode?.id === fav.episode.id && isPlaying ? "secondary" : "default"}
                          >
                            {currentEpisode?.id === fav.episode.id && isPlaying ? (
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
