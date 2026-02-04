"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import {
  Search,
  Grid3X3,
  List,
  Play,
  Pause,
  Download,
  Trash2,
  Star,
  StarOff,
  MoreHorizontal,
  Loader2,
  Library,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Music,
  Clock,
  ExternalLink,
} from "lucide-react";

import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";
import type { LibraryResponse, LibraryItem } from "@/lib/services/libraryService";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormattedDate } from "@/components/dashboard/formatted-date";
import { FormattedNumber } from "@/components/dashboard/formatted-number";

interface LibraryClientProps {
  initialData: LibraryResponse;
}

type ViewMode = "grid" | "list";
type SortBy = "newest" | "oldest" | "longest" | "shortest";

export function LibraryClient({ initialData }: LibraryClientProps) {
  const { user } = useUser();
  const userId = user?.id;
  const audioRef = useRef<HTMLAudioElement>(null);

  // Data state
  const [data, setData] = useState<LibraryResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [voiceFilter, setVoiceFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Audio player state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch library with filters
  const fetchLibrary = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy,
      });

      if (search) params.set("search", search);
      if (voiceFilter) params.set("voiceId", voiceFilter);
      if (showFavorites) params.set("favorites", "true");

      const res = await fetch(`/api/library?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const result = await res.json();
      setData(result);
      setSelectedIds(new Set());
    } catch (err) {
      setError("Failed to load library");
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  }, [search, voiceFilter, sortBy, showFavorites]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLibrary(1);
  };

  // Toggle favorite
  const handleToggleFavorite = async (item: LibraryItem) => {
    try {
      const res = await fetch(`/api/library/${item.id}/favorite`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to update");

      const result = await res.json();

      // Update local state
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id ? { ...i, isFavorite: result.isFavorite } : i
        ),
        stats: {
          ...prev.stats,
          totalFavorites: result.isFavorite
            ? prev.stats.totalFavorites + 1
            : prev.stats.totalFavorites - 1,
        },
      }));
    } catch (err) {
      setError("Failed to update favorite");
      Sentry.captureException(err);
    }
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedIds.size === data.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.items.map((i) => i.id)));
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      // Refresh library
      await fetchLibrary(data.page);
      setShowDeleteDialog(false);
    } catch (err) {
      setError("Failed to delete items");
      Sentry.captureException(err);
    } finally {
      setDeleting(false);
    }
  };

  // Play audio
  const handlePlay = (item: LibraryItem) => {
    if (playingId === item.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      setPlayingId(item.id);
      setCurrentTime(0);
      setDuration(0);

      if (audioRef.current) {
        audioRef.current.src = item.audioUrl;
        audioRef.current.play();
      }

      if (userId) {
        capturePosthogBrowserEvent("audio_played", {
          feature: "tts",
          userId,
          generationId: item.id,
        });
      }
    }
  };

  // Download
  const handleDownload = (item: LibraryItem) => {
    const link = document.createElement("a");
    link.href = item.audioUrl;
    link.download = `audio-${item.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
      />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audio Library</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and organize your generated audio files
          </p>
        </div>
        <Button asChild>
          <Link href="/tts">
            <Plus className="mr-2 h-4 w-4" />
            New Generation
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                <FormattedNumber value={data.stats.totalItems} />
              </p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                <FormattedNumber value={data.stats.totalFavorites} />
              </p>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-muted p-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                <FormattedNumber value={data.stats.voices.length} />
              </p>
              <p className="text-sm text-muted-foreground">Voices Used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters & Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search audio files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Voice Filter */}
              <Select
                value={voiceFilter || "all"}
                onValueChange={(v) => {
                  const newValue = v === "all" ? "" : v;
                  setVoiceFilter(newValue);
                  fetchLibrary(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Voices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Voices</SelectItem>
                  {data.stats.voices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortBy); fetchLibrary(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="longest">Longest</SelectItem>
                  <SelectItem value="shortest">Shortest</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v as ViewMode)}
                className="border rounded-md"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4">
            <Tabs
              value={showFavorites ? "favorites" : "all"}
              onValueChange={(v) => { setShowFavorites(v === "favorites"); fetchLibrary(1); }}
            >
              <TabsList>
                <TabsTrigger value="all">
                  All Files ({data.stats.totalItems})
                </TabsTrigger>
                <TabsTrigger value="favorites">
                  <Star className="mr-1 h-3 w-3" />
                  Favorites ({data.stats.totalFavorites})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="mt-4 flex items-center gap-4 rounded-lg bg-muted/50 p-3">
              <Checkbox
                checked={selectedIds.size === data.items.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">
                {selectedIds.size} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Library Content */}
      {loading && data.items.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data.items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Library className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">
              {showFavorites ? "No favorites yet" : "No audio files yet"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {showFavorites
                ? "Star your favorite generations to see them here"
                : "Your generated audio files will appear here. Start by creating your first text-to-speech generation."}
            </p>
            {!showFavorites && (
              <Button className="mt-6" asChild>
                <Link href="/tts">Generate Speech</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden">
              {/* Selection Checkbox */}
              <div className="absolute left-3 top-3 z-10">
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => handleToggleSelect(item.id)}
                  className="bg-background"
                />
              </div>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 z-10 h-8 w-8"
                onClick={() => handleToggleFavorite(item)}
              >
                {item.isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>

              <CardContent className="p-4">
                {/* Play Button */}
                <div className="flex justify-center py-6">
                  <Button
                    size="icon"
                    variant={playingId === item.id ? "default" : "outline"}
                    className="h-14 w-14 rounded-full"
                    onClick={() => handlePlay(item)}
                  >
                    {playingId === item.id ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </Button>
                </div>

                {/* Progress (when playing) */}
                {playingId === item.id && (
                  <div className="mb-4">
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
                      className="mb-1"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                  </div>
                )}

                {/* Text Preview */}
                <p className="line-clamp-2 text-sm">
                  {item.text.length > 80 ? item.text.slice(0, 80) + "..." : item.text}
                </p>

                {/* Metadata */}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline">{item.voiceId}</Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <FormattedDate date={item.createdAt} />
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(item)}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tts/${item.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFavorite(item)}>
                        {item.isFavorite ? (
                          <>
                            <StarOff className="mr-2 h-4 w-4" />
                            Remove Favorite
                          </>
                        ) : (
                          <>
                            <Star className="mr-2 h-4 w-4" />
                            Add to Favorites
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedIds(new Set([item.id]));
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30"
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => handleToggleSelect(item.id)}
                  />

                  {/* Play Button */}
                  <Button
                    size="icon"
                    variant={playingId === item.id ? "default" : "outline"}
                    className="h-10 w-10 shrink-0"
                    onClick={() => handlePlay(item)}
                  >
                    {playingId === item.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {item.text.length > 100 ? item.text.slice(0, 100) + "..." : item.text}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline">{item.voiceId}</Badge>
                      <span>
                        <FormattedDate date={item.createdAt} />
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleFavorite(item)}
                    >
                      {item.isFavorite ? (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/tts/${item.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedIds(new Set([item.id]));
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages} ({data.total} items)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLibrary(data.page - 1)}
              disabled={data.page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLibrary(data.page + 1)}
              disabled={data.page >= data.totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected audio file{selectedIds.size > 1 ? "s" : ""} and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
