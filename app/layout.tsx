import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "components/theme-provider"
import { PlayerProvider } from "context/player-context"
import { FavouritesProvider } from "context/favourites-context"
import { GlobalAudioPlayer } from "components/global-audio-player"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Bombs Cast",
  description:
    "Your explosive podcast listening experience with Bombs Cast! Discover, listen, and favourite your top podcasts.",
  applicationName: "Bombs Cast",
  keywords: ["podcast", "audio", "listen", "favourites", "bombs cast", "react", "nextjs"],
  authors: [{ name: "v0" }],
  creator: "v0",
  publisher: "Vercel",

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },

  manifest: "/site.webmanifest",

  openGraph: {
    title: "Bombs Cast",
    description:
      "Your explosive podcast listening experience with Bombs Cast! Discover, listen, and favourite your top podcasts.",
    url: "https://your-bombs-cast-url.com",
    siteName: "Bombs Cast",
    images: [
      {
        url: "/bombscasts-logo-microphone.png",
        width: 800,
        height: 800,
        alt: "Bombs Cast Microphone Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Bombs Cast",
    description:
      "Your explosive podcast listening experience with Bombs Cast! Discover, listen, and favourite your top podcasts.",
    images: ["/bombscasts-logo-microphone.png"],
    creator: "@yourtwitterhandle",
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PlayerProvider>
            <FavouritesProvider>
              {children}
              <GlobalAudioPlayer />
            </FavouritesProvider>
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
