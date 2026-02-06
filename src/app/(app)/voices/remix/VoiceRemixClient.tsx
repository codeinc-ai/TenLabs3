"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Check,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AudioPlayerProvider,
  AudioPlayerButton,
  AudioPlayerProgress,
  AudioPlayerTime,
} from "@/components/ui/audio-player";
import Aurora from "@/components/Aurora";

interface VoicePreview {
  generatedVoiceId: string;
  audioBase64: string;
  mediaType: string;
}

export function VoiceRemixClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const voiceId = searchParams.get("voiceId");
  const voiceName = searchParams.get("voiceName");

  const [step, setStep] = useState<"remix" | "preview" | "save">("remix");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [sampleText, setSampleText] = useState(
    "Hello! This is a sample of my remixed voice."
  );
  const [name, setName] = useState("");
  const [previews, setPreviews] = useState<VoicePreview[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (voiceName) {
      setName(`${voiceName} (Remixed)`);
    }
  }, [voiceName]);

  const handleGeneratePreviews = async () => {
    if (!voiceId) {
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
          voiceId,
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

  const handleSelectPreview = (generatedVoiceId: string) => {
    setSelectedPreview(generatedVoiceId);
  };

  const handleSaveVoice = async () => {
    if (!selectedPreview) {
      setError("Please select a voice preview");
      return;
    }
    if (!name.trim()) {
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
          voiceName: name.trim(),
          voiceDescription: voiceDescription.trim(),
          generatedVoiceId: selectedPreview,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save remixed voice");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/voices/my-voices");
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

  const stepLabels = ["Remix", "Preview", "Save"];
  const stepKeys: Array<"remix" | "preview" | "save"> = ["remix", "preview", "save"];
  const currentStepIndex = stepKeys.indexOf(step);

  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      <div
        className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <Aurora
          colorStops={["#78350f", "#d97706", "#fbbf24"]}
          amplitude={3}
          blend={0.7}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/voices"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Voices
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-amber-500" />
            Remix a Voice
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {step === "remix" && (voiceName ? `Modify "${voiceName}" with new characteristics.` : "Modify a voice with new characteristics.")}
            {step === "preview" && "Listen to the remixed voices and select your favorite."}
            {step === "save" && "Give your remixed voice a name to save it."}
          </p>
        </div>

        {!voiceId ? (
          <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col items-center py-8 text-center">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-4 mb-4">
                <Info className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white">No Source Voice Selected</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Please select a voice to remix from the voices page. You can remix any voice you&apos;ve created (cloned, designed, or previously remixed).
              </p>
              <Button
                onClick={() => router.push("/voices")}
                className="mt-6 bg-amber-600 hover:bg-amber-700"
              >
                Go to Voices
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      i <= currentStepIndex
                        ? "bg-amber-600 text-white"
                        : "bg-gray-200 dark:bg-[#222] text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      i <= currentStepIndex
                        ? "text-black dark:text-white font-medium"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                  {i < stepLabels.length - 1 && (
                    <div
                      className={`w-8 h-px ${
                        i < currentStepIndex ? "bg-amber-600" : "bg-gray-200 dark:bg-[#333]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
              {success ? (
                <div className="flex flex-col items-center py-8">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-4">
                    <CheckCircle2 className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">Voice Remixed!</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Your remixed voice &quot;{name}&quot; is ready to use.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {step === "remix" && (
                    <>
                      <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <span className="text-lg">🎭</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-black dark:text-white">Source Voice</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{voiceName}</p>
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                    <AudioPlayerProvider>
                      <div className="space-y-3">
                        <Label>Select a Remix ({previews.length} options)</Label>
                        {previews.map((preview, index) => (
                          <div
                            key={preview.generatedVoiceId}
                            onClick={() => handleSelectPreview(preview.generatedVoiceId)}
                            className={`
                              flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer
                              transition-all hover:border-amber-300 dark:hover:border-amber-700
                              ${selectedPreview === preview.generatedVoiceId
                                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                                : "border-gray-200 dark:border-[#333]"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  w-10 h-10 rounded-full flex items-center justify-center
                                  ${selectedPreview === preview.generatedVoiceId
                                    ? "bg-amber-500 text-white"
                                    : "bg-gray-100 dark:bg-[#222]"
                                  }
                                `}
                              >
                                {selectedPreview === preview.generatedVoiceId ? (
                                  <Check className="h-5 w-5" />
                                ) : (
                                  <span className="font-medium text-black dark:text-white">{index + 1}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-black dark:text-white">Remix Option {index + 1}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Click to select this remix
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <AudioPlayerButton
                                item={{
                                  id: preview.generatedVoiceId,
                                  src: `data:${preview.mediaType};base64,${preview.audioBase64}`,
                                }}
                              />
                              <AudioPlayerProgress className="w-20" />
                              <AudioPlayerTime />
                            </div>
                          </div>
                        ))}
                      </div>
                    </AudioPlayerProvider>
                  )}

                  {step === "save" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="remix-name">Voice Name *</Label>
                        <Input
                          id="remix-name"
                          placeholder="e.g., Boston Sarah"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-4">
                        <p className="text-sm font-medium text-black dark:text-white">Remix Summary</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Based on: {voiceName}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          Changes: {voiceDescription}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    {step !== "remix" && (
                      <Button variant="outline" onClick={handleBack} disabled={loading || saving}>
                        Back
                      </Button>
                    )}
                    {step === "remix" && (
                      <>
                        <Button variant="outline" onClick={() => router.push("/voices")} disabled={loading}>
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
                        disabled={saving || !name.trim()}
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
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
