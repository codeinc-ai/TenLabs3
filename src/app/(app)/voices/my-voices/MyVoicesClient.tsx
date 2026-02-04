"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import {
  Search,
  Play,
  Pause,
  Trash2,
  Star,
  StarOff,
  Loader2,
  Mic2,
  ArrowLeft,
  AlertCircle,
  User,
  Sparkles,
  Grid3X3,
  List,
  MoreVertical,
  Wand2,
  ChevronDown,
} from "lucide-react";

import type { VoiceItem } from "@/lib/services/voiceService";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InstantCloneDialog } from "@/components/voices/InstantCloneDialog";
import { VoiceDesignDialog } from "@/components/voices/VoiceDesignDialog";
import { VoiceRemixDialog } from "@/components/voices/VoiceRemixDialog";

interface MyVoicesClientProps {
  initialVoices: VoiceItem[];
}

type ViewMode = "grid" | "list";

export function MyVoicesClient({ initialVoices }: MyVoicesClientProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Data state
  const [voices, setVoices] = useState<VoiceItem[]>(initialVoices);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Audio state
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Action states
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voiceToDelete, setVoiceToDelete] = useState<VoiceItem | null>(null);

  // Remix dialog state
  const [remixDialogOpen, setRemixDialogOpen] = useState(false);
  const [voiceToRemix, setVoiceToRemix] = useState<VoiceItem | null>(null);

  // Filter voices by search
  const filteredVoices = voices.filter((voice) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      voice.name.toLowerCase().includes(searchLower) ||
      voice.category?.toLowerCase().includes(searchLower) ||
      voice.description?.toLowerCase().includes(searchLower)
    );
  });

  // Separate favorites from regular
  const favoriteVoices = filteredVoices.filter((v) => v.isFavorite);
  const regularVoices = filteredVoices.filter((v) => !v.isFavorite);

  // Play preview
  const handlePlay = (voice: VoiceItem) => {
    if (playingId === voice.voiceId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      setPlayingId(voice.voiceId);
      if (audioRef.current) {
        audioRef.current.src = voice.previewUrl || "";
        audioRef.current.play().catch(() => {
          setTimeout(() => setPlayingId(null), 1000);
        });
      }
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (voice: VoiceItem) => {
    setTogglingFavoriteId(voice.voiceId);
    setError(null);

    try {
      const res = await fetch(`/api/voices/my-voices/${voice.voiceId}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to update");

      const result = await res.json();
      setVoices((prev) =>
        prev.map((v) =>
          v.voiceId === voice.voiceId
            ? { ...v, isFavorite: result.isFavorite }
            : v
        )
      );
    } catch (err) {
      setError("Failed to update favorite");
      Sentry.captureException(err);
    } finally {
      setTogglingFavoriteId(null);
    }
  };

  // Remove voice
  const handleRemove = async () => {
    if (!voiceToDelete) return;

    setRemovingId(voiceToDelete.voiceId);
    setError(null);

    try {
      const res = await fetch(`/api/voices/my-voices/${voiceToDelete.voiceId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove");

      setVoices((prev) =>
        prev.filter((v) => v.voiceId !== voiceToDelete.voiceId)
      );
      setDeleteDialogOpen(false);
      setVoiceToDelete(null);
    } catch (err) {
      setError("Failed to remove voice");
      Sentry.captureException(err);
    } finally {
      setRemovingId(null);
    }
  };

  // Use voice in TTS
  const handleUseVoice = (voice: VoiceItem) => {
    router.push(`/tts?voice=${voice.voiceId}`);
  };

  // Open delete dialog
  const openDeleteDialog = (voice: VoiceItem) => {
    setVoiceToDelete(voice);
    setDeleteDialogOpen(true);
  };

  // Check if voice can be remixed (only user-created voices)
  const canRemixVoice = (voice: VoiceItem) => {
    const remixableCategories = ["Cloned", "Designed", "Remixed", "Custom"];
    return remixableCategories.includes(voice.category || "");
  };

  // Open remix dialog
  const openRemixDialog = (voice: VoiceItem) => {
    setVoiceToRemix(voice);
    setRemixDialogOpen(true);
  };

  // Handle remix success
  const handleRemixSuccess = (newVoice: { voiceId: string; name: string }) => {
    // Refresh the page to show the new voice
    router.refresh();
  };

  // Get gender icon
  const getGenderIcon = (gender?: string) => {
    switch (gender) {
      case "male":
        return "♂";
      case "female":
        return "♀";
      default:
        return "◎";
    }
  };

  // Get age label
  const getAgeLabel = (age?: string) => {
    switch (age) {
      case "young":
        return "Young";
      case "middle":
        return "Adult";
      case "old":
        return "Senior";
      default:
        return "";
    }
  };

  // Voice card component
  const VoiceCard = ({ voice }: { voice: VoiceItem }) => (
    <Card
      className={`group relative overflow-hidden transition-shadow hover:shadow-md ${
        voice.isFavorite ? "ring-1 ring-yellow-500/50" : ""
      }`}
    >
      <CardContent className="p-5">
        {/* Actions Menu */}
        <div className="absolute right-3 top-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleToggleFavorite(voice)}>
                {voice.isFavorite ? (
                  <>
                    <StarOff className="mr-2 h-4 w-4" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Add to Favorites
                  </>
                )}
              </DropdownMenuItem>
              {canRemixVoice(voice) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openRemixDialog(voice)}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Remix Voice
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => openDeleteDialog(voice)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Voice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Favorite Badge */}
        {voice.isFavorite && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-yellow-500 text-yellow-950">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Favorite
            </Badge>
          </div>
        )}

        {/* Voice Avatar & Name */}
        <div className="flex items-start gap-4 mt-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-2xl">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{voice.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{getGenderIcon(voice.gender)}</span>
              <span>{getAgeLabel(voice.age)}</span>
              {voice.accent && (
                <>
                  <span>•</span>
                  <span>{voice.accent}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category */}
        {voice.category && (
          <div className="mt-4">
            <Badge variant="secondary" className="text-xs">
              {voice.category}
            </Badge>
          </div>
        )}

        {/* Description */}
        {voice.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {voice.description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {/* Preview Button */}
          <Button
            variant={playingId === voice.voiceId ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => handlePlay(voice)}
          >
            {playingId === voice.voiceId ? (
              <>
                <Pause className="mr-1 h-4 w-4" />
                Playing...
              </>
            ) : (
              <>
                <Play className="mr-1 h-4 w-4" />
                Preview
              </>
            )}
          </Button>

          {/* Favorite Button */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => handleToggleFavorite(voice)}
            disabled={togglingFavoriteId === voice.voiceId}
          >
            {togglingFavoriteId === voice.voiceId ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : voice.isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Use Voice Button */}
        <Button
          className="mt-3 w-full"
          size="sm"
          onClick={() => handleUseVoice(voice)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Use This Voice
        </Button>
      </CardContent>
    </Card>
  );

  // Voice list item component
  const VoiceListItem = ({ voice }: { voice: VoiceItem }) => (
    <Card
      className={`transition-shadow hover:shadow-md ${
        voice.isFavorite ? "ring-1 ring-yellow-500/50" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
            <User className="h-6 w-6 text-primary" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{voice.name}</h3>
              {voice.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{getGenderIcon(voice.gender)}</span>
              <span>{getAgeLabel(voice.age)}</span>
              {voice.category && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {voice.category}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={playingId === voice.voiceId ? "default" : "outline"}
              size="sm"
              onClick={() => handlePlay(voice)}
            >
              {playingId === voice.voiceId ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm" onClick={() => handleUseVoice(voice)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Use
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleToggleFavorite(voice)}>
                  {voice.isFavorite ? (
                    <>
                      <StarOff className="mr-2 h-4 w-4" />
                      Remove from Favorites
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Add to Favorites
                    </>
                  )}
                </DropdownMenuItem>
                {canRemixVoice(voice) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openRemixDialog(voice)}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Remix Voice
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => openDeleteDialog(voice)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Voice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
      />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/voices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Voices</h1>
            <p className="mt-1 text-muted-foreground">
              {voices.length} {voices.length === 1 ? "voice" : "voices"} saved
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/voices">
            <Mic2 className="mr-2 h-4 w-4" />
            Browse Voices
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

      {/* Search & View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your voices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as ViewMode)}
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Empty State */}
      {voices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Mic2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No saved voices</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Browse the voice library and save your favorite voices for quick
              access.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/voices">
                <Mic2 className="mr-2 h-4 w-4" />
                Browse Voice Library
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredVoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No voices found</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try adjusting your search terms.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setSearch("")}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Favorites Section */}
          {favoriteVoices.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                Favorites ({favoriteVoices.length})
              </h2>
              {viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {favoriteVoices.map((voice) => (
                    <VoiceCard key={voice.voiceId} voice={voice} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {favoriteVoices.map((voice) => (
                    <VoiceListItem key={voice.voiceId} voice={voice} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Regular Voices Section */}
          {regularVoices.length > 0 && (
            <div>
              {favoriteVoices.length > 0 && (
                <h2 className="text-lg font-semibold mb-4">
                  All Voices ({regularVoices.length})
                </h2>
              )}
              {viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {regularVoices.map((voice) => (
                    <VoiceCard key={voice.voiceId} voice={voice} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {regularVoices.map((voice) => (
                    <VoiceListItem key={voice.voiceId} voice={voice} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Voice</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{voiceToDelete?.name}&quot;
              from your saved voices? You can always add it back later from the
              voice library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setVoiceToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removingId === voiceToDelete?.voiceId}
            >
              {removingId === voiceToDelete?.voiceId ? (
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

      {/* Voice Remix Dialog */}
      <VoiceRemixDialog
        open={remixDialogOpen}
        onOpenChange={(open) => {
          setRemixDialogOpen(open);
          if (!open) setVoiceToRemix(null);
        }}
        sourceVoice={
          voiceToRemix
            ? { voiceId: voiceToRemix.voiceId, name: voiceToRemix.name }
            : null
        }
        onSuccess={handleRemixSuccess}
      />
    </div>
  );
}
