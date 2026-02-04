"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import {
  Play,
  Pause,
  Download,
  Trash2,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Volume2,
  RefreshCw,
  Clock,
  FileAudio,
} from "lucide-react";

import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";
import type { GenerationDetail } from "@/lib/services/generationService";

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
import { FormattedNumber } from "@/components/dashboard/formatted-number";

interface GenerationDetailClientProps {
  generation: GenerationDetail;
}

/**
 * Generation Detail Client Component
 *
 * Displays detailed view of a single generation with:
 * - Full text display
 * - Audio player
 * - Metadata
 * - Actions (download, delete, regenerate)
 */
export function GenerationDetailClient({ generation }: GenerationDetailClientProps) {
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      if (userId) {
        capturePosthogBrowserEvent("audio_played", {
          feature: "tts",
          userId,
          generationId: generation.id,
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleDownload = () => {
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

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generation.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy text");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/generations/${generation.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      router.push("/tts/history");
    } catch (err) {
      setError("Failed to delete generation");
      Sentry.captureException(err);
      setDeleting(false);
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
        src={generation.audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => setError("Failed to load audio")}
      />

      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tts/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generation Details</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage this audio generation
          </p>
        </div>
        <Badge variant="outline">{generation.voiceId}</Badge>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Audio Player Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Player
          </CardTitle>
          <CardDescription>
            Listen to your generated speech
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Audio Player */}
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
            <Button
              size="icon"
              variant="default"
              className="h-14 w-14 shrink-0 rounded-full"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>

            <div className="flex-1 space-y-2">
              <Slider
                value={[currentTime]}
                onValueChange={handleSeek}
                min={0}
                max={duration || 100}
                step={0.1}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download MP3
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/tts?text=${encodeURIComponent(generation.text)}&voice=${generation.voiceId}`}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive" disabled={deleting}>
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Generation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this audio generation and its file. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Text Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Original Text
              </CardTitle>
              <CardDescription>
                <FormattedNumber value={generation.text.length} /> characters
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyText}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Text
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {generation.text}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Voice</dt>
              <dd className="mt-1">
                <Badge variant="outline">{generation.voiceId}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Characters</dt>
              <dd className="mt-1 text-sm"><FormattedNumber value={generation.text.length} /></dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1 text-sm">
                <FormattedDate date={generation.createdAt} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Generation ID</dt>
              <dd className="mt-1 font-mono text-xs text-muted-foreground">{generation.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
