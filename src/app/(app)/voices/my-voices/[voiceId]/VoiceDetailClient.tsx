"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import {
  Play,
  Pause,
  Trash2,
  Star,
  StarOff,
  Loader2,
  ArrowLeft,
  AlertCircle,
  User,
  Sparkles,
  TrendingUp,
  Globe,
  Tag,
} from "lucide-react";

import type { VoiceItem } from "@/lib/services/voiceService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormattedNumber } from "@/components/dashboard/formatted-number";

interface VoiceDetailClientProps {
  voice: VoiceItem;
}

export function VoiceDetailClient({ voice: initialVoice }: VoiceDetailClientProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  // State
  const [voice, setVoice] = useState<VoiceItem>(initialVoice);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Play preview
  const handlePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = voice.previewUrl || "";
        audioRef.current.play().catch(() => {
          setTimeout(() => setIsPlaying(false), 1000);
        });
      }
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    setError(null);

    try {
      const res = await fetch(`/api/voices/my-voices/${voice.voiceId}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to update");

      const result = await res.json();
      setVoice((prev) => ({ ...prev, isFavorite: result.isFavorite }));
    } catch (err) {
      setError("Failed to update favorite");
      Sentry.captureException(err);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Remove voice
  const handleRemove = async () => {
    setIsRemoving(true);
    setError(null);

    try {
      const res = await fetch(`/api/voices/my-voices/${voice.voiceId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove");

      router.push("/voices/my-voices");
    } catch (err) {
      setError("Failed to remove voice");
      Sentry.captureException(err);
      setIsRemoving(false);
    }
  };

  // Use voice in TTS
  const handleUseVoice = () => {
    router.push(`/tts?voice=${voice.voiceId}`);
  };

  // Get gender display
  const getGenderDisplay = (gender?: string) => {
    switch (gender) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "neutral":
        return "Neutral";
      default:
        return "Unknown";
    }
  };

  // Get age display
  const getAgeDisplay = (age?: string) => {
    switch (age) {
      case "young":
        return "Young Adult";
      case "middle":
        return "Adult";
      case "old":
        return "Senior";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/voices/my-voices">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{voice.name}</h1>
            {voice.isFavorite && (
              <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
            )}
            {voice.isFeatured && (
              <Badge className="bg-yellow-500 text-yellow-950">Featured</Badge>
            )}
          </div>
          {voice.description && (
            <p className="mt-2 text-muted-foreground">{voice.description}</p>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Voice Card */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-2xl">
                <User className="h-12 w-12 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{getGenderDisplay(voice.gender)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age Group</p>
                    <p className="font-medium">{getAgeDisplay(voice.age)}</p>
                  </div>
                  {voice.language && (
                    <div>
                      <p className="text-sm text-muted-foreground">Language</p>
                      <p className="font-medium flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {voice.language}
                      </p>
                    </div>
                  )}
                  {voice.accent && (
                    <div>
                      <p className="text-sm text-muted-foreground">Accent</p>
                      <p className="font-medium">{voice.accent}</p>
                    </div>
                  )}
                </div>

                {voice.category && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Category</p>
                    <Badge variant="secondary" className="text-sm">
                      <Tag className="mr-1 h-3 w-3" />
                      {voice.category}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Controls */}
            <div className="mt-6 flex items-center gap-4">
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="lg"
                onClick={handlePlay}
                className="flex-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Stop Preview
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Play Preview
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Actions */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    <FormattedNumber value={voice.usageCount} />
                  </p>
                  <p className="text-xs text-muted-foreground">Total Uses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg" onClick={handleUseVoice}>
                <Sparkles className="mr-2 h-5 w-5" />
                Use This Voice
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : voice.isFavorite ? (
                  <StarOff className="mr-2 h-4 w-4" />
                ) : (
                  <Star className="mr-2 h-4 w-4" />
                )}
                {voice.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </Button>

              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from My Voices
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Voice</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{voice.name}&quot; from your
              saved voices? You can always add it back later from the voice
              library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
