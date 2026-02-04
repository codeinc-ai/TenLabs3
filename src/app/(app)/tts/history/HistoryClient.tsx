"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import {
  Play,
  Pause,
  Download,
  Trash2,
  History,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  Volume2,
} from "lucide-react";

import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";
import type { PaginatedGenerations, GenerationListItem } from "@/lib/services/generationService";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "@/components/ui/alert-dialog";
import { FormattedDate } from "@/components/dashboard/formatted-date";

interface HistoryClientProps {
  initialData: PaginatedGenerations;
}

/**
 * History Client Component
 *
 * Displays user's TTS generation history with:
 * - List of generations with inline audio player
 * - Delete functionality
 * - Pagination
 */
export function HistoryClient({ initialData }: HistoryClientProps) {
  const { user } = useUser();
  const userId = user?.id;

  const [data, setData] = useState<PaginatedGenerations>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Audio player state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchPage = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generations?page=${page}&limit=${data.limit}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError("Failed to load generations");
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (generationId: string) => {
    setDeletingId(generationId);

    try {
      const res = await fetch(`/api/generations/${generationId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      // Remove from local state
      setData((prev) => ({
        ...prev,
        generations: prev.generations.filter((g) => g.id !== generationId),
        total: prev.total - 1,
      }));

      // Stop playback if this was playing
      if (playingId === generationId) {
        setPlayingId(null);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    } catch (err) {
      setError("Failed to delete generation");
      Sentry.captureException(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePlay = (generation: GenerationListItem) => {
    if (playingId === generation.id) {
      // Pause current
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Play new
      setPlayingId(generation.id);
      setCurrentTime(0);
      setDuration(0);

      if (audioRef.current) {
        audioRef.current.src = generation.audioUrl;
        audioRef.current.play();
      }

      if (userId) {
        capturePosthogBrowserEvent("audio_played", {
          feature: "tts",
          userId,
          generationId: generation.id,
        });
      }
    }
  };

  const handleDownload = (generation: GenerationListItem) => {
    const link = document.createElement("a");
    link.href = generation.audioUrl;
    link.download = `tts-${generation.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (userId) {
      capturePosthogBrowserEvent("audio_downloaded", {
        feature: "tts",
        userId,
        generationId: generation.id,
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlayingId(null)}
        onError={() => {
          setPlayingId(null);
          setError("Failed to play audio");
        }}
      />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generation History</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your past text-to-speech generations
          </p>
        </div>
        <Button asChild>
          <Link href="/tts">
            <Volume2 className="mr-2 h-4 w-4" />
            New Generation
          </Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Your Generations
          </CardTitle>
          <CardDescription>
            {data.total} total generation{data.total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && data.generations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data.generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium">No generations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first text-to-speech generation
              </p>
              <Button className="mt-4" asChild>
                <Link href="/tts">Generate Speech</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.generations.map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                >
                  {/* Play Button */}
                  <Button
                    size="icon"
                    variant={playingId === gen.id ? "default" : "outline"}
                    className="h-10 w-10 shrink-0"
                    onClick={() => handlePlay(gen)}
                  >
                    {playingId === gen.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">
                      {gen.text.length > 150 ? gen.text.slice(0, 150) + "..." : gen.text}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline">{gen.voiceId}</Badge>
                      <span>
                        <FormattedDate date={gen.createdAt} />
                      </span>
                    </div>

                    {/* Inline Player Progress (when playing) */}
                    {playingId === gen.id && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-10">
                          {formatTime(currentTime)}
                        </span>
                        <Slider
                          value={[currentTime]}
                          onValueChange={(v) => {
                            if (audioRef.current) {
                              audioRef.current.currentTime = v[0];
                              setCurrentTime(v[0]);
                            }
                          }}
                          min={0}
                          max={duration || 100}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-10">
                          {formatTime(duration)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDownload(gen)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                      title="View Details"
                    >
                      <Link href={`/tts/${gen.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === gen.id}
                          title="Delete"
                        >
                          {deletingId === gen.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Generation?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this audio generation. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(gen.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPage(data.page - 1)}
                  disabled={data.page <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPage(data.page + 1)}
                  disabled={data.page >= data.totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
