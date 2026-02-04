"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { ChevronLeft, ChevronRight, FileAudio, Loader2, Trash2 } from "lucide-react";

import type { PaginatedTranscriptions, TranscriptionListItem } from "@/lib/services/transcriptionService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HistoryClientProps {
  initialData: PaginatedTranscriptions;
}

export function HistoryClient({ initialData }: HistoryClientProps) {
  const { user } = useUser();
  const userId = user?.id;

  const audioRef = useRef<HTMLAudioElement>(null);

  const [data, setData] = useState<PaginatedTranscriptions>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(page), limit: String(data.limit) });
      const res = await fetch(`/api/stt?${params}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as PaginatedTranscriptions;
      setData(json);
      setPlayingId(null);
    } catch (err) {
      setError("Failed to load transcription history");
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  }, [data.limit]);

  const togglePlay = (item: TranscriptionListItem) => {
    if (!audioRef.current) return;

    if (playingId === item.id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    setPlayingId(item.id);
    audioRef.current.src = item.audioUrl;
    audioRef.current.play().catch(() => {
      setError("Failed to play audio");
      setPlayingId(null);
    });
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/stt/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Delete failed (${res.status})`);
      }

      // refresh current page
      await fetchPage(data.page);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      Sentry.withScope((scope) => {
        scope.setTag("feature", "stt");
        scope.setTag("service", "history-client");
        if (userId) scope.setUser({ id: userId });
        scope.setContext("stt", { transcriptionId: id });
        Sentry.captureException(e);
      });
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transcription History</h1>
          <p className="mt-2 text-muted-foreground">Your recent speech-to-text results</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/stt">New transcription</Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Transcriptions
            <Badge variant="secondary" className="ml-2">
              {data.total}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && data.transcriptions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data.transcriptions.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No transcriptions yet.
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {data.transcriptions.map((t) => (
                <div key={t.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{t.originalFileName}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {t.textPreview || "(no text)"}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{t.language}</Badge>
                      <span>{Math.round(t.duration)}s</span>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant={playingId === t.id ? "default" : "outline"}
                      onClick={() => togglePlay(t)}
                      disabled={loading}
                    >
                      {playingId === t.id ? "Pause" : "Play"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(t.id)}
                      disabled={loading}
                      aria-label="Delete transcription"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
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
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPage(data.page + 1)}
                  disabled={data.page >= data.totalPages || loading}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
