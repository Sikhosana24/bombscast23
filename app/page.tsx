"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { ThemeToggle } from "components/theme-toggle"
import { fetchAllShows, type PreviewShow, getGenreNames, genres } from "lib/api"
import { Loader2 } from "lucide-react"
import { Input } from "components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { RecommendedShowsCarousel } from "components/recommended-shows-carousel"

type SortOption = "title-asc" | "title-desc" | "updated-newest" | "updated-oldest"

export default function HomePage() {
  const [allShows, setAllShows] = useState<PreviewShow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<SortOption>("updated-newest")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const getShows = async () => {
      try {
        const data = await fetchAllShows()
        setAllShows(data)
      } catch (err) {
        setError("Failed to fetch shows. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getShows()
  }, [])

  const filteredAndSortedShows = useMemo(() => {
    let filtered = allShows

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (show) =>
          show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          show.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      const genreId = Number.parseInt(selectedGenre)
      filtered = filtered.filter((show) => show.genres.includes(genreId))
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortOrder === "title-asc") {
        return a.title.localeCompare(b.title)
      } else if (sortOrder === "title-desc") {
        return b.title.localeCompare(a.title)
      } else if (sortOrder === "updated-newest") {
        return new Date(b.updated).getTime() - new Date(a.updated).getTime()
      } else if (sortOrder === "updated-oldest") {
        return new Date(a.updated).getTime() - new Date(b.updated).getTime()
      }
      return 0
    })

    return filtered
  }, [allShows, searchTerm, sortOrder, selectedGenre])

  // Pagination logic
  const totalItems = filteredAndSortedShows.length
  const itemsPerPage = Math.ceil(totalItems / 5) || 1 // Ensure at least 5 pages or 1 item per page minimum
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedShows.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="sr-only">Loading shows...</span>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8 relative">
        {/* Left-aligned Favourites button */}
        <div className="absolute left-0">
          <Link href="/favourites">
            <Button variant="outline">Favourites</Button>
          </Link>
        </div>

        {/* Centered Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/bombscasts-logo-microphone.png"
              alt="Bombs Cast Logo"
              width={180} // Adjust width as needed for centering and visibility
              height={60} // Adjust height as needed
              className="h-auto object-contain"
              priority // Load logo early
            />
          </Link>
        </div>

        {/* Right-aligned Theme Toggle */}
        <div className="absolute right-0">
          <ThemeToggle />
        </div>
      </header>

      <RecommendedShowsCarousel shows={allShows} />

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">All Shows</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search shows..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search change
            }}
            className="flex-1"
          />
          <Select value={sortOrder} onValueChange={(value) => {
            setSortOrder(value as SortOption)
            setCurrentPage(1) // Reset to first page on sort change
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated-newest">Newest Update</SelectItem>
              <SelectItem value="updated-oldest">Oldest Update</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedGenre} onValueChange={(value) => {
            setSelectedGenre(value)
            setCurrentPage(1) // Reset to first page on genre change
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre.id} value={genre.id.toString()}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredAndSortedShows.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No shows found matching your criteria.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentItems.map((show) => (
                <Link key={show.id} href={`/show/${show.id}`}>
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <Image
                        src={show.image || "/placeholder.svg?height=400&width=400&query=podcast-cover"}
                        alt={show.title}
                        width={400}
                        height={400}
                        className="rounded-t-lg object-cover aspect-square"
                      />
                    </CardHeader>
                    <CardContent className="p-4 flex-1">
                      <CardTitle className="text-lg mb-1">{show.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">{show.description}</CardDescription>
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
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
