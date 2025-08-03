export const BASE_URL = "https://podcast-api.netlify.app"

export async function fetchAllShows() {
  const response = await fetch(`${BASE_URL}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function fetchShowById(id: string) {
  const response = await fetch(`${BASE_URL}/id/${id}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function fetchGenreById(id: string) {
  const response = await fetch(`${BASE_URL}/genre/${id}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Define types for API responses
export type Episode = {
  id: string
  title: string
  description: string
  episode: number
  file: string // URL to the audio file
}

export type Season = {
  season: number
  title: string
  image: string
  episodes: Episode[]
}

export type Show = {
  id: string
  title: string
  description: string
  image: string
  seasons: Season[]
  genres: number[] // Array of genre IDs
  updated: string
}

export type PreviewShow = {
  id: string
  title: string
  description: string
  image: string
  seasons: number
  genres: number[]
  updated: string
}

export type Genre = {
  id: number
  name: string
}

// Static genre mapping (as the API returns IDs)
export const genres: Genre[] = [
  { id: 1, name: "Personal Growth" },
  { id: 2, name: "True Crime and Investigative Journalism" },
  { id: 3, name: "History" },
  { id: 4, name: "Comedy" },
  { id: 5, name: "Entertainment" },
  { id: 6, name: "Business" },
  { id: 7, name: "Fiction" },
  { id: 8, name: "News" },
  { id: 9, name: "Kids and Family" },
  { id: 10, name: "Health and Fitness" },
  { id: 11, name: "Arts" },
  { id: 12, name: "Science" },
  { id: 13, name: "Technology" },
  { id: 14, name: "Sports" },
  { id: 15, name: "Spirituality" },
  { id: 16, name: "Documentary" },
  { id: 17, name: "Education" },
  { id: 18, name: "Music" },
  { id: 19, name: "Philosophy" },
  { id: 20, name: "Travel" },
]

export const getGenreNames = (genreIds: number[]): string[] => {
  return genreIds.map((id) => genres.find((genre) => genre.id === id)?.name || "Unknown Genre")
}
