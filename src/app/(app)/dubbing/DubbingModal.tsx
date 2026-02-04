"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, ChevronDown, Check } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

import { DUBBING_CONFIG, PLANS } from "@/constants";
import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";

interface DubbingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string;
  userPlan?: "free" | "pro";
  currentUsage?: {
    dubbingsUsed: number;
  };
}

const sourceTypes = ["Upload", "YouTube", "TikTok", "Other URL", "Manual"];

export function DubbingModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userPlan = "free",
  currentUsage,
}: DubbingModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState("Untitled project");
  const [sourceLanguage, setSourceLanguage] = useState<string | null>(null);
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [sourceType, setSourceType] = useState("Upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [numSpeakers, setNumSpeakers] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [disableVoiceCloning, setDisableVoiceCloning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [showSpeakersDropdown, setShowSpeakersDropdown] = useState(false);

  const limits = PLANS[userPlan];
  const usedDubbings = currentUsage?.dubbingsUsed ?? 0;
  const remainingDubbings = limits.maxDubbings - usedDubbings;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
    }
  }, []);

  const handleCreateDub = async () => {
    if (!uploadedFile || targetLanguages.length === 0 || remainingDubbings <= 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("projectName", projectName);
      formData.append("targetLanguages", targetLanguages.join(","));

      if (sourceLanguage) {
        formData.append("sourceLanguage", sourceLanguage);
      }
      if (numSpeakers) {
        formData.append("numSpeakers", String(numSpeakers));
      }
      if (startTime) {
        const [h, m, s] = startTime.split(":").map(Number);
        formData.append("startTime", String(h * 3600 + m * 60 + s));
      }
      if (endTime) {
        const [h, m, s] = endTime.split(":").map(Number);
        formData.append("endTime", String(h * 3600 + m * 60 + s));
      }
      formData.append("watermark", String(!disableVoiceCloning));

      const response = await fetch("/api/dubbing", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create dubbing");
      }

      capturePosthogBrowserEvent("dubbing_completed", {
        feature: "dubbing",
        userId,
        projectId: result.data.projectId,
      });

      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      Sentry.captureException(err);

      capturePosthogBrowserEvent("dubbing_failed", {
        feature: "dubbing",
        userId,
        error: message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fileSizeMB = uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(2) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Dub your content</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* Languages */}
          <div className="grid grid-cols-2 gap-4">
            {/* Source Language */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Source Language<span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-gray-300"
              >
                <span className={sourceLanguage ? "text-gray-900" : "text-gray-500"}>
                  {sourceLanguage ? DUBBING_CONFIG.supportedLanguages.find((l) => l.code === sourceLanguage)?.name : "Detect"}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showSourceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSourceLanguage(null);
                      setShowSourceDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Detect</span>
                    {sourceLanguage === null && <Check size={16} className="text-black" />}
                  </button>
                  {DUBBING_CONFIG.supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSourceLanguage(lang.code);
                        setShowSourceDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>{lang.name}</span>
                      {sourceLanguage === lang.code && <Check size={16} className="text-black" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Target Languages */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Target Languages<span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-gray-300"
              >
                <span className={targetLanguages.length > 0 ? "text-gray-900" : "text-gray-500"}>
                  {targetLanguages.length > 0
                    ? `${targetLanguages.length} selected`
                    : "Select languages"}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showTargetDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {DUBBING_CONFIG.supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        if (targetLanguages.includes(lang.code)) {
                          setTargetLanguages(targetLanguages.filter((l) => l !== lang.code));
                        } else {
                          setTargetLanguages([...targetLanguages, lang.code]);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>{lang.name}</span>
                      {targetLanguages.includes(lang.code) && (
                        <Check size={16} className="text-black" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audio or Video Source */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Audio or video source<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-4">
              {sourceTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSourceType(type)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    sourceType === type
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Upload Area */}
            {sourceType === "Upload" && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={DUBBING_CONFIG.allowedFormats.map((f) => `.${f}`).join(",")}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-colors"
                >
                  <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-900 font-medium mb-1">
                    {uploadedFile ? uploadedFile.name : "Click or drag to upload here"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {uploadedFile
                      ? `${fileSizeMB} MB`
                      : `Audio or video file, up to ${DUBBING_CONFIG.maxFileSizeMB}MB or ${DUBBING_CONFIG.maxDurationMinutes} minutes`}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your video will be dubbed in standard resolution and will include a watermark.
                  Only Creator+ plans can change this.{" "}
                  <button className="text-blue-600 hover:underline">Upgrade your plan</button>
                </p>
              </div>
            )}
          </div>

          {/* Number of Speakers */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Number of speakers
            </label>
            <button
              onClick={() => setShowSpeakersDropdown(!showSpeakersDropdown)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-gray-300"
            >
              <span className={numSpeakers ? "text-gray-900" : "text-gray-500"}>
                {numSpeakers ? `${numSpeakers} speakers` : "Detect"}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            {showSpeakersDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setNumSpeakers(null);
                    setShowSpeakersDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  Detect
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setNumSpeakers(num);
                      setShowSpeakersDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
                  >
                    {num} {num === 1 ? "speaker" : "speakers"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Time range to dub
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="hh:mm:ss"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <input
                type="text"
                placeholder="hh:mm:ss"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          {/* Disable Voice Cloning */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">Disable voice cloning</label>
            <button
              onClick={() => setDisableVoiceCloning(!disableVoiceCloning)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                disableVoiceCloning ? "bg-black" : "bg-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                  disableVoiceCloning ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreateDub}
            disabled={!uploadedFile || targetLanguages.length === 0 || loading || remainingDubbings <= 0}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
              uploadedFile && targetLanguages.length > 0 && !loading && remainingDubbings > 0
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating dub..." : "Create dub"}
          </button>

          <p className="text-center text-xs text-gray-500">
            Balance remaining before this dub: {remainingDubbings}
          </p>
        </div>
      </div>
    </div>
  );
}
