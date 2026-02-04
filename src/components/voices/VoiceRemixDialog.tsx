"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  Check,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoicePreview {
  generatedVoiceId: string;
  audioBase64: string;
  mediaType: string;
}

interface SourceVoice {
  voiceId: string;
  name: string;
}

interface VoiceRemixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceVoice: SourceVoice | null;
  onSuccess?: (voice: { voiceId: string; name: string }) => void;
}

export function VoiceRemixDialog({
  open,
  onOpenChange,
  sourceVoice,
  onSuccess,
}: VoiceRemixDialogProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [step, setStep] = useState<"remix" | "preview" | "save">("remix");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [sampleText, setSampleText] = useState(
    "Hello! This is a sample of my remixed voice."
  );
  const [voiceName, setVoiceName] = useState("");
  const [previews, setPreviews] = useState<VoicePreview[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("remix");
      setVoiceDescription("");
      setSampleText("Hello! This is a sample of my remixed voice.");
      setVoiceName("");
      setPreviews([]);
      setSelectedPreview(null);
      setPlayingId(null);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (sourceVoice) {
      setVoiceName(`${sourceVoice.name} (Remixed)`);
    }
  }, [sourceVoice]);

  const handleGeneratePreviews = async () => {
    if (!sourceVoice) {
      setError("No source voice selected");
      return;
    }
    if (!voiceDescription.trim()) {
      setError("Please describe how you want to modify the voice");
      return;
    }
    if (!sampleText.trim()) {
      setError("Please enter sample text for the voice to speak");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/voices/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          voiceId: sourceVoice.voiceId,
          voiceDescription: voiceDescription.trim(),
          sampleText: sampleText.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate remix previews");
      }

      const data = await res.json();
      setPreviews(data.previews || []);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate previews");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPreview = (preview: VoicePreview) => {
    if (playingId === preview.generatedVoiceId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      setPlayingId(preview.generatedVoiceId);
      if (audioRef.current) {
        audioRef.current.src = `data:${preview.mediaType};base64,${preview.audioBase64}`;
        audioRef.current.play().catch(() => setPlayingId(null));
      }
    }
  };

  const handleSelectPreview = (generatedVoiceId: string) => {
    setSelectedPreview(generatedVoiceId);
  };

  const handleSaveVoice = async () => {
    if (!selectedPreview) {
      setError("Please select a voice preview");
      return;
    }
    if (!voiceName.trim()) {
      setError("Please enter a name for your voice");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/voices/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          voiceName: voiceName.trim(),
          voiceDescription: voiceDescription.trim(),
          generatedVoiceId: selectedPreview,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save remixed voice");
      }

      const data = await res.json();
      setSuccess(true);

      setTimeout(() => {
        onSuccess?.(data);
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save voice");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === "preview") {
      setStep("remix");
      setPreviews([]);
      setSelectedPreview(null);
    } else if (step === "save") {
      setStep("preview");
    }
  };

  const handleContinue = () => {
    if (step === "preview" && selectedPreview) {
      setStep("save");
    }
  };

  if (!sourceVoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <audio
          ref={audioRef}
          onEnded={() => setPlayingId(null)}
          onError={() => setPlayingId(null)}
        />

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-amber-600" />
            Remix Voice
          </DialogTitle>
          <DialogDescription>
            {step === "remix" && `Modify "${sourceVoice.name}" with new characteristics.`}
            {step === "preview" && "Listen to the remixed voices and select your favorite."}
            {step === "save" && "Give your remixed voice a name to save it."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8">
            <div className="rounded-full bg-amber-100 p-4">
              <CheckCircle2 className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Voice Remixed!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your remixed voice &quot;{voiceName}&quot; is ready to use.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === "remix" && (
              <>
                <div className="rounded-lg bg-gray-50 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-lg">🎭</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Source Voice</p>
                    <p className="text-sm text-muted-foreground">{sourceVoice.name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remix-description">Modification Description *</Label>
                  <Textarea
                    id="remix-description"
                    placeholder="e.g., Make the voice higher pitched with a Boston accent, speaking more quickly"
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe the changes you want (pitch, accent, speed, tone, etc.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remix-sample">Sample Text *</Label>
                  <Textarea
                    id="remix-sample"
                    placeholder="Enter text for the voice to speak in the preview..."
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    disabled={loading}
                    rows={2}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    You can only remix voices you created (cloned, designed, or previously remixed voices).
                  </AlertDescription>
                </Alert>
              </>
            )}

            {step === "preview" && (
              <>
                <div className="space-y-3">
                  <Label>Select a Remix ({previews.length} options)</Label>
                  {previews.map((preview, index) => (
                    <div
                      key={preview.generatedVoiceId}
                      onClick={() => handleSelectPreview(preview.generatedVoiceId)}
                      className={`
                        flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer
                        transition-all hover:border-amber-300
                        ${selectedPreview === preview.generatedVoiceId
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${selectedPreview === preview.generatedVoiceId
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100"
                            }
                          `}
                        >
                          {selectedPreview === preview.generatedVoiceId ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span className="font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Remix Option {index + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            Click to select this remix
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(preview);
                        }}
                      >
                        {playingId === preview.generatedVoiceId ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === "save" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="remix-name">Voice Name *</Label>
                  <Input
                    id="remix-name"
                    placeholder="e.g., Boston Sarah"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium">Remix Summary</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Based on: {sourceVoice.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    Changes: {voiceDescription}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2">
            {step !== "remix" && (
              <Button variant="outline" onClick={handleBack} disabled={loading || saving}>
                Back
              </Button>
            )}
            {step === "remix" && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGeneratePreviews}
                  disabled={loading || !voiceDescription.trim() || !sampleText.trim()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Remixes
                    </>
                  )}
                </Button>
              </>
            )}
            {step === "preview" && (
              <Button
                onClick={handleContinue}
                disabled={!selectedPreview}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Continue
              </Button>
            )}
            {step === "save" && (
              <Button
                onClick={handleSaveVoice}
                disabled={saving || !voiceName.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Voice
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
