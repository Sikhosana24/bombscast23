"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { getGenreNames, type PreviewShow } from "lib/api"
import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "components/ui/button"

interface RecommendedShowsCarouselProps {
  shows: PreviewShow[]
}

export function RecommendedShowsCarousel({ shows }: RecommendedShowsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth / 2 // Scroll half the visible width
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Simple recommendation logic: just take the first few shows or a random subset
  const recommended = shows.slice(0, 8) // Display up to 8 recommended shows

  if (recommended.length === 0) {
    return null // Don't render if no shows to recommend
  }

  return (
    <section className="mb-12 relative">
      <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div ref={scrollContainerRef} className="flex overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {recommended.map((show) => (
            <div key={show.id} className="flex-shrink-0 w-64 snap-center mr-4">
              <Link href={`/show/${show.id}`}>
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <Image
                      src={show.image || "/placeholder.svg?height=256&width=256&query=podcast-cover"}
                      alt={show.title}
                      width={256}
                      height={256}
                      className="rounded-t-lg object-cover aspect-square"
                    />
                  </CardHeader>
                  <CardContent className="p-4 flex-1">
                    <CardTitle className="text-base mb-1 line-clamp-2">{show.title}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getGenreNames(show.genres).map((genre, index) => (
                        <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </section>
  )
}
