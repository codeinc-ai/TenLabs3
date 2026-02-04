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
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  Check,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoicePreview {
  generatedVoiceId: string;
  audioBase64: string;
  mediaType: string;
}

interface VoiceDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (voice: { voiceId: string; name: string }) => void;
}

export function VoiceDesignDialog({
  open,
  onOpenChange,
  onSuccess,
}: VoiceDesignDialogProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [step, setStep] = useState<"design" | "preview" | "save">("design");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [sampleText, setSampleText] = useState(
    "Hello! This is a sample of my voice. I can speak clearly and naturally."
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
      setStep("design");
      setVoiceDescription("");
      setSampleText("Hello! This is a sample of my voice. I can speak clearly and naturally.");
      setVoiceName("");
      setPreviews([]);
      setSelectedPreview(null);
      setPlayingId(null);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleGeneratePreviews = async () => {
    if (!voiceDescription.trim()) {
      setError("Please describe the voice you want to create");
      return;
    }
    if (!sampleText.trim()) {
      setError("Please enter sample text for the voice to speak");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/voices/design/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceDescription: voiceDescription.trim(),
          sampleText: sampleText.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate voice previews");
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
      const res = await fetch("/api/voices/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceName: voiceName.trim(),
          voiceDescription: voiceDescription.trim(),
          generatedVoiceId: selectedPreview,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save voice");
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
      setStep("design");
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
            <Sparkles className="h-5 w-5 text-purple-600" />
            Design a Voice
          </DialogTitle>
          <DialogDescription>
            {step === "design" && "Describe the voice you want to create and we'll generate it for you."}
            {step === "preview" && "Listen to the generated voices and select your favorite."}
            {step === "save" && "Give your new voice a name to save it."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8">
            <div className="rounded-full bg-purple-100 p-4">
              <CheckCircle2 className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Voice Created!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your designed voice &quot;{voiceName}&quot; is ready to use.
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

            {step === "design" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="voice-description">Voice Description *</Label>
                  <Textarea
                    id="voice-description"
                    placeholder="e.g., A warm, friendly female voice with a slight British accent. She speaks at a moderate pace with clear enunciation."
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                    disabled={loading}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about gender, age, accent, tone, and speaking style.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample-text">Sample Text *</Label>
                  <Textarea
                    id="sample-text"
                    placeholder="Enter text for the voice to speak in the preview..."
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-700">
                  <p className="font-medium">Voice description examples:</p>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>&quot;A deep, authoritative male voice perfect for documentaries&quot;</li>
                    <li>&quot;A cheerful young woman with an American accent, great for commercials&quot;</li>
                    <li>&quot;A calm, soothing narrator voice for meditation apps&quot;</li>
                  </ul>
                </div>
              </>
            )}

            {step === "preview" && (
              <>
                <div className="space-y-3">
                  <Label>Select a Voice ({previews.length} options)</Label>
                  {previews.map((preview, index) => (
                    <div
                      key={preview.generatedVoiceId}
                      onClick={() => handleSelectPreview(preview.generatedVoiceId)}
                      className={`
                        flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer
                        transition-all hover:border-purple-300
                        ${selectedPreview === preview.generatedVoiceId
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${selectedPreview === preview.generatedVoiceId
                              ? "bg-purple-500 text-white"
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
                          <p className="font-medium">Voice Option {index + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            Click to select this voice
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
                  <Label htmlFor="voice-name">Voice Name *</Label>
                  <Input
                    id="voice-name"
                    placeholder="e.g., Friendly Narrator"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium">Voice Summary</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                    {voiceDescription}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2">
            {step !== "design" && (
              <Button variant="outline" onClick={handleBack} disabled={loading || saving}>
                Back
              </Button>
            )}
            {step === "design" && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGeneratePreviews}
                  disabled={loading || !voiceDescription.trim() || !sampleText.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Previews
                    </>
                  )}
                </Button>
              </>
            )}
            {step === "preview" && (
              <Button
                onClick={handleContinue}
                disabled={!selectedPreview}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue
              </Button>
            )}
            {step === "save" && (
              <Button
                onClick={handleSaveVoice}
                disabled={saving || !voiceName.trim()}
                className="bg-purple-600 hover:bg-purple-700"
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
