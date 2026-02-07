"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, ChevronRight } from "lucide-react";
import { Icon7, Icon8 } from "@/components/icons";
import { MusicPromptBox } from "@/components/music";

/** Simple waveform bars for track preview */
function WaveformBars() {
  const heights = [8, 12, 18, 22, 14, 22, 10, 14, 14, 10];
  return (
    <div className="flex items-end gap-0.5 h-5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] min-h-[3px] rounded-full bg-white/30"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

const TRENDING_TRACKS = [
  {
    id: "1",
    title: "Sultry Glam Intro",
    desc: "Amapiano, Romantic, Energetic",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/p8GNnSOIooPEXxV2xtBcfIxYZYo2/music_explore/3WNLIozlddUNO16ZkyOv/artwork_small_B2gjx7duDLRzFFGQFypV.jpg",
    duration: "55s",
    bpm: "114 BPM",
  },
  {
    id: "2",
    title: "Concrete Ambition",
    desc: "City Lights Pop, Boom Bap, Moody",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/p8GNnSOIooPEXxV2xtBcfIxYZYo2/music_explore/dHBlNA8umTYEIj9BBc6C/artwork_small_h8rbqsfjalFiPmL7ZzXI.jpg",
    duration: "1m 30s",
    bpm: "151 BPM",
  },
  {
    id: "3",
    title: "Quiet Reflection",
    desc: "Classical, Peaceful",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/94TjbJFzfsp4MCX0S5TI/artwork_FEJ57ElGK92xqHzaFfD2.jpg",
    duration: "1m 55s",
    bpm: "123 BPM",
  },
  {
    id: "4",
    title: "Midnight Haze",
    desc: "Peaceful, Dreamy, Lofi Beats",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/Zsk3QUgVCVmeIC8S3mKz/artwork_DfosTgxfMJBhFwrbFwWV.jpg",
    duration: "1m 50s",
    bpm: "84 BPM",
  },
  {
    id: "5",
    title: "Cloud Sync",
    desc: "Utility, Technology Music",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/5MSywEcBVHwXnMLnIj1S/artwork_xmTB8zY2b5hpTu1wGdHy.jpg",
    duration: "2m 0s",
    bpm: "109 BPM",
  },
];

const NEWEST_TRACKS = [
  {
    id: "1",
    title: "Kids Wait Till You Hear This",
    artist: "Liza Minnelli",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/mqWYeG6wJySqcNPd2OkL/artwork_small_bdFcl94yh0R22hfEf2kh.jpg",
    duration: "3m 4s",
    bpm: "129 BPM",
  },
  {
    id: "2",
    title: "Authorship",
    artist: "Art Garfunkel",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/Pq2dWTZmd7OU1JACmxmE/artwork_small_HiTmbqkH7G3Qk2gbhOib.jpg",
    duration: "2m 5s",
    bpm: "129 BPM",
  },
  {
    id: "3",
    title: "TooHot2Handle",
    artist: "Michael Feinstein",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/hiY6v5zcbOb1C3LDZMr7/artwork_small_R4eaA50JiRr3l2c7M3TV.jpg",
    duration: "3m 40s",
    bpm: "126 BPM",
  },
  {
    id: "4",
    title: "Echoes",
    artist: "Chris Lyons",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/ybv2FsomVWTNZIYAkSYW/artwork_small_UnYaCzd0cpMLy8NNUfPT.jpg",
    duration: "2m 57s",
    bpm: "120 BPM",
  },
  {
    id: "5",
    title: "Raw Dogging Boredom",
    artist: "King Willonius",
    image:
      "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/mzArXUOGKNCx8TLcs38E/artwork_small_djIoZFqeqoQ5bYnXiWaW.jpg",
    duration: "2m 36s",
    bpm: "147 BPM",
  },
];

const FILTERS = ["Genre", "Mood", "Theme", "Duration", "BPM", "Vocals"];

export default function MusicPage() {
  const featuredCollections = [
    {
      id: "featured",
      title: "Featured",
      image:
        "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/5MSywEcBVHwXnMLnIj1S/artwork_xmTB8zY2b5hpTu1wGdHy.jpg",
    },
    {
      id: "chill",
      title: "Chill",
      image:
        "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/V6sKWsFmPFHXL4tnh3q5/artwork_7VNMF52m3TA0qxSVrbrF.jpg",
    },
    {
      id: "upbeat",
      title: "Upbeat",
      image:
        "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/94TjbJFzfsp4MCX0S5TI/artwork_FEJ57ElGK92xqHzaFfD2.jpg",
    },
    {
      id: "feelgood",
      title: "Feel-good",
      image:
        "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/94TjbJFzfsp4MCX0S5TI/artwork_FEJ57ElGK92xqHzaFfD2.jpg",
    },
    {
      id: "moody",
      title: "Moody",
      image:
        "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/8U7tDLOtltZmU9tvlTOr/artwork_bTT1pEP8L5aPT7QUeFZs.jpg",
    },
    {
      id: "beats",
      title: "Beats",
      image:
        "https://storage.googleapis.com/eleven-public-cdn/public/music_explore/collections/yi8tQCP8Z78jnlRCDwKl/artwork_R6hukLgSDnAxOf3AExpH.jpg",
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] w-full pt-8 px-5 text-white">
      {/* Header */}
      <header className="flex flex-col w-full max-w-[1152px] mx-auto mb-4 pb-4 border-b border-white/10">
        <div className="w-full pb-4">
          <div className="flex flex-row min-h-9 w-full items-center justify-between">
            <h1 className="text-2xl font-semibold leading-8 tracking-[-0.15px] text-white">
              Music
            </h1>
          </div>
        </div>
        <div className="flex flex-row -mt-2 w-full items-center justify-between">
          <nav className="inline-flex h-11 w-full gap-1.5 overflow-x-auto pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/music"
              className="relative flex items-center justify-center text-sm font-medium text-white border-b-2 border-white/90 pb-2.5 px-0 transition-all"
            >
              <span className="flex items-center rounded-lg border border-[#323235] px-2.5 py-1">
                Explore
              </span>
            </Link>
            <Link
              href="/music/history"
              className="relative flex items-center justify-center text-sm font-medium text-white/50 border-b-2 border-transparent pb-2.5 px-0 transition-all hover:text-white/70"
            >
              <span className="flex items-center rounded-lg border border-transparent px-2.5 py-1">
                History
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 w-full max-w-[1152px] mx-auto pb-8">
        <a
          href="#music-prompt-box"
          aria-label="Skip to prompt box"
          className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-white/10 focus:rounded"
        >
          Skip to prompt box
        </a>

        <div className="flex flex-col gap-6 w-full">
          {/* Featured carousel */}
          <div className="relative">
            <div className="pointer-events-none absolute left-0 right-0 top-0 bottom-0 z-10 flex items-center justify-between px-0">
              <button
                type="button"
                aria-label="Previous page"
                disabled
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f0f10] text-[#494950] opacity-0 cursor-default"
              >
                <Icon7 className="h-[18px] w-[18px] flex-shrink-0 -scale-x-100" />
              </button>
              <button
                type="button"
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f0f10]/90 text-white hover:bg-[#0f0f10] transition-colors"
              >
                <Icon8 className="h-[18px] w-[18px] flex-shrink-0" />
              </button>
            </div>
            <div
              className="flex h-[88px] w-full gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                maskImage:
                  "linear-gradient(90deg, rgb(255,255,255) 0%, rgb(255,255,255) 160px, rgb(255,255,255) calc(100% - 160px), rgba(255,255,255,0) 100%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, rgb(255,255,255) 0%, rgb(255,255,255) 160px, rgb(255,255,255) calc(100% - 160px), rgba(255,255,255,0) 100%)",
              }}
            >
              {featuredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="h-[88px] w-[150px] flex-shrink-0 select-none snap-center overflow-hidden rounded-xl"
                >
                  <div className="relative block h-full w-full cursor-pointer rounded-xl">
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <Image
                        alt={collection.title}
                        src={collection.image}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-full w-full rounded-xl backdrop-blur-sm"
                      style={{
                        maskImage:
                          "linear-gradient(rgba(255,255,255,0) 60%, rgb(255,255,255) 100%)",
                        WebkitMaskImage:
                          "linear-gradient(rgba(255,255,255,0) 60%, rgb(255,255,255) 100%)",
                      }}
                    />
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
                      <p className="text-sm leading-5 text-white drop-shadow-sm">
                        {collection.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex h-10 w-full">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/50 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search for music, genres, or moods"
              aria-label="Search for music, genres, or moods"
              className="w-full h-10 pl-9 pr-3 py-2 bg-[#0f0f10] border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Filter buttons */}
          <div className="relative flex flex-row items-center gap-1.5 overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-[#0f0f10] to-transparent"
              aria-hidden
            />
            {FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                className="flex items-center gap-1 px-1.5 py-1.5 h-6 bg-[#0f0f10] border border-white/10 rounded-lg text-xs font-medium text-white whitespace-nowrap hover:bg-[#1a1a1a] transition-colors"
              >
                <Plus className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Trending & Newest columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trending */}
            <div className="flex flex-col gap-4">
              <Link
                href="/music/explore/trending"
                className="flex items-center gap-1 w-fit text-sm font-medium text-white hover:text-white/80 transition-colors"
              >
                Trending
                <ChevronRight className="h-4 w-4" />
              </Link>
              <div className="flex flex-col">
                {TRENDING_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={track.image}
                        alt={track.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-0.5">
                      <p className="text-sm font-medium text-white truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {track.desc}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <WaveformBars />
                    </div>
                    <div className="flex flex-col items-end justify-between gap-0.5 min-w-[60px]">
                      <p className="text-xs text-white/50 tabular-nums">
                        {track.duration}
                      </p>
                      <p className="text-xs text-white/50 tabular-nums">
                        {track.bpm}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newest */}
            <div className="flex flex-col gap-4">
              <Link
                href="/music/explore/newest"
                className="flex items-center gap-1 w-fit text-sm font-medium text-white hover:text-white/80 transition-colors"
              >
                Newest
                <ChevronRight className="h-4 w-4" />
              </Link>
              <div className="flex flex-col">
                {NEWEST_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={track.image}
                        alt={track.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-0.5">
                      <p className="text-sm font-medium text-white truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {track.artist}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <WaveformBars />
                    </div>
                    <div className="flex flex-col items-end justify-between gap-0.5 min-w-[60px]">
                      <p className="text-xs text-white/50 tabular-nums">
                        {track.duration}
                      </p>
                      <p className="text-xs text-white/50 tabular-nums">
                        {track.bpm}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Genres section */}
          <div className="mt-8">
            <Link
              href="/music/explore/genres"
              className="flex items-center gap-1 w-fit text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              Genres
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Music prompt box - sticky at bottom */}
          <div className="sticky bottom-0 z-10 mt-8 pt-4">
            <MusicPromptBox />
          </div>
        </div>
      </main>
    </div>
  );
}
