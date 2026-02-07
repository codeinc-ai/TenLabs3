"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { usePrevious } from "@/hooks/use-previous"
import { useScribe } from "@/hooks/use-scribe"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShimmeringText } from "@/components/ui/shimmering-text"

import { LanguageSelector } from "./components/language-selector"

interface RecordingState {
  error: string
  latenciesMs: number[]
}

type ConnectionState = "idle" | "connecting" | "connected" | "disconnecting"

const TranscriptCharacter = React.memo(
  ({ char, delay }: { char: string; delay: number }) => {
    return (
      <motion.span
        initial={{ filter: `blur(3.5px)`, opacity: 0 }}
        animate={{ filter: `none`, opacity: 1 }}
        transition={{ duration: 0.5, delay }}
        style={{ willChange: delay > 0 ? "filter, opacity" : "auto" }}
      >
        {char}
      </motion.span>
    )
  }
)
TranscriptCharacter.displayName = "TranscriptCharacter"

const BackgroundAura = React.memo(
  ({ status, isConnected }: { status: string; isConnected: boolean }) => {
    const isActive = status === "connecting" || isConnected

    return (
      <div
        className={cn(
          "pointer-events-none fixed inset-0 overflow-hidden transition-opacity duration-300 ease-out",
          isActive ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: "130%",
            height: "20vh",
            background:
              "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(34, 211, 238, 0.5) 0%, rgba(168, 85, 247, 0.4) 35%, rgba(251, 146, 60, 0.5) 70%, transparent 100%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 animate-pulse",
            isConnected ? "opacity-100" : "opacity-80"
          )}
          style={{
            width: "100%",
            height: "18vh",
            background:
              "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(134, 239, 172, 0.5) 0%, rgba(192, 132, 252, 0.4) 50%, transparent 100%)",
            filter: "blur(60px)",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: "25vw",
            height: "30vh",
            background:
              "radial-gradient(circle at 0% 100%, rgba(34, 211, 238, 0.5) 0%, rgba(134, 239, 172, 0.3) 30%, transparent 60%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute bottom-0 -left-8"
          style={{
            width: "20vw",
            height: "45vh",
            background:
              "radial-gradient(ellipse 50% 100% at 10% 100%, rgba(34, 211, 238, 0.4) 0%, rgba(134, 239, 172, 0.25) 25%, transparent 60%)",
            filter: "blur(60px)",
            animation: "pulseGlow 5s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute right-0 bottom-0"
          style={{
            width: "25vw",
            height: "30vh",
            background:
              "radial-gradient(circle at 100% 100%, rgba(251, 146, 60, 0.5) 0%, rgba(251, 146, 60, 0.3) 30%, transparent 60%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute -right-8 bottom-0"
          style={{
            width: "20vw",
            height: "45vh",
            background:
              "radial-gradient(ellipse 50% 100% at 90% 100%, rgba(251, 146, 60, 0.4) 0%, rgba(192, 132, 252, 0.25) 25%, transparent 60%)",
            filter: "blur(60px)",
            animation: "pulseGlow 5s ease-in-out infinite alternate-reverse",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: "100%",
            height: "15vh",
            background:
              "linear-gradient(90deg, rgba(34, 211, 238, 0.3) 0%, rgba(168, 85, 247, 0.3) 30%, rgba(251, 146, 60, 0.3) 60%, rgba(134, 239, 172, 0.3) 100%)",
            filter: "blur(30px)",
            animation: "shimmer 8s linear infinite",
          }}
        />
      </div>
    )
  }
)
BackgroundAura.displayName = "BackgroundAura"

const BottomControls = React.memo(
  ({
    isConnected,
    hasError,
    isMac,
    onStop,
  }: {
    isConnected: boolean
    hasError: boolean
    isMac: boolean
    onStop: () => void
  }) => {
    return (
      <AnimatePresence mode="popLayout">
        {isConnected && !hasError && (
          <motion.div
            key="bottom-controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.1 },
            }}
            exit={{
              opacity: 0,
              y: 10,
              transition: { duration: 0.1 },
            }}
            className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2"
          >
            <button
              onClick={onStop}
              className="bg-foreground text-background border-foreground/10 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-lg transition-opacity hover:opacity-90"
            >
              Stop
              <kbd className="border-background/20 bg-background/10 inline-flex h-5 items-center rounded border px-1.5 font-mono text-xs">
                {isMac ? "⌘K" : "Ctrl+K"}
              </kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
  (prev, next) => {
    if (prev.isConnected !== next.isConnected) return false
    if (prev.hasError !== next.hasError) return false
    if (prev.isMac !== next.isMac) return false
    return true
  }
)
BottomControls.displayName = "BottomControls"

async function getScribeToken(): Promise<{ token?: string; error?: string }> {
  try {
    const res = await fetch("/api/stt/token")
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { error: data.error || `Failed to get token (${res.status})` }
    }
    if (!data.token) {
      return { error: "Invalid token response" }
    }
    return { token: data.token }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to get transcription token",
    }
  }
}

interface RealtimeSTTProps {
  userPlan?: "free" | "pro"
  onActiveChange?: (active: boolean) => void
}

export function RealtimeSTT({ userPlan: _userPlan = "free", onActiveChange }: RealtimeSTTProps) {
  const [recording, setRecording] = useState<RecordingState>({
    error: "",
    latenciesMs: [],
  })
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [connectionState, setConnectionStateState] =
    useState<ConnectionState>("idle")
  const [localTranscript, setLocalTranscript] = useState("")

  const [isMac, setIsMac] = useState(true)
  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent))
  }, [])

  const segmentStartMsRef = useRef<number | null>(null)
  const lastTranscriptRef = useRef<string>("")
  const finalTranscriptsRef = useRef<string[]>([])

  const startSoundRef = useRef<HTMLAudioElement | null>(null)
  const endSoundRef = useRef<HTMLAudioElement | null>(null)
  const errorSoundRef = useRef<HTMLAudioElement | null>(null)

  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastOperationTimeRef = useRef(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectionStateRef = useRef<ConnectionState>("idle")

  const updateConnectionState = useCallback(
    (next: ConnectionState) => {
      connectionStateRef.current = next
      setConnectionStateState(next)
    },
    []
  )

  const clearSessionRefs = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = null
    }
    segmentStartMsRef.current = null
    lastTranscriptRef.current = ""
    finalTranscriptsRef.current = []
  }, [])

  const onPartialTranscript = useCallback((data: { text?: string }) => {
    if (connectionStateRef.current !== "connected") return

    const currentText = data.text || ""
    if (currentText === lastTranscriptRef.current) return

    lastTranscriptRef.current = currentText

    const fullText = finalTranscriptsRef.current.join(" ")
    const combined = fullText ? `${fullText} ${currentText}` : currentText
    setLocalTranscript(combined)

    if (currentText.length > 0 && segmentStartMsRef.current != null) {
      const latency = performance.now() - segmentStartMsRef.current
      setRecording((prev) => ({
        ...prev,
        latenciesMs: [...prev.latenciesMs.slice(-29), latency],
      }))
      segmentStartMsRef.current = null
    }
  }, [])

  const onFinalTranscript = useCallback((data: { text?: string }) => {
    if (connectionStateRef.current !== "connected") return

    lastTranscriptRef.current = ""

    if (data.text && data.text.length > 0) {
      finalTranscriptsRef.current = [...finalTranscriptsRef.current, data.text]
      setLocalTranscript(finalTranscriptsRef.current.join(" "))

      if (segmentStartMsRef.current != null) {
        const latency = performance.now() - segmentStartMsRef.current
        setRecording((prev) => ({
          ...prev,
          latenciesMs: [...prev.latenciesMs.slice(-29), latency],
        }))
      }
    }
    segmentStartMsRef.current = null
  }, [])

  const onError = useCallback((error: Error | Event) => {
    console.error("[Scribe] Error:", error)

    if (connectionStateRef.current !== "connected") {
      return
    }

    const errorMessage =
      error instanceof Error ? error.message : "Transcription error"

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
    }

    errorTimeoutRef.current = setTimeout(() => {
      if (connectionStateRef.current !== "connected") return

      setRecording((prev) => ({
        ...prev,
        error: errorMessage,
      }))
      errorSoundRef.current?.play().catch(() => {})
    }, 500)
  }, [])

  const scribeConfig = useMemo(
    () => ({
      modelId: "scribe_v2_realtime" as const,
      onPartialTranscript,
      onCommittedTranscript: onFinalTranscript,
      onError,
    }),
    [onPartialTranscript, onFinalTranscript, onError]
  )

  const scribe = useScribe(scribeConfig)

  useEffect(() => {
    if (connectionState !== "connected") {
      setLocalTranscript("")
    }
  }, [connectionState])

  // Notify parent about active state (connecting or connected)
  useEffect(() => {
    const isActive = connectionState === "connecting" || connectionState === "connected"
    onActiveChange?.(isActive)
  }, [connectionState, onActiveChange])

  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (connectionState !== "connected") return

    timerIntervalRef.current = setInterval(() => {
      if (segmentStartMsRef.current === null) {
        segmentStartMsRef.current = performance.now()
      }
    }, 100)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [connectionState])

  const handleToggleRecording = useCallback(async () => {
    const now = Date.now()
    const timeSinceLastOp = now - lastOperationTimeRef.current

    if (connectionState === "connected" || connectionState === "connecting") {
      updateConnectionState("idle")
      setLocalTranscript("")
      setRecording({ error: "", latenciesMs: [] })
      clearSessionRefs()

      try {
        scribe.disconnect()
        scribe.clearTranscripts()
      } catch {
        // Ignore
      }

      if (endSoundRef.current) {
        endSoundRef.current.currentTime = 0
        endSoundRef.current.play().catch(() => {})
      }

      lastOperationTimeRef.current = now
      return
    }

    if (timeSinceLastOp < 200) {
      return
    }
    lastOperationTimeRef.current = now

    if (connectionState !== "idle") {
      return
    }

    updateConnectionState("connecting")
    setLocalTranscript("")
    setRecording({ error: "", latenciesMs: [] })
    clearSessionRefs()

    try {
      // Request microphone permission before connecting
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())

      const result = await getScribeToken()

      if (connectionStateRef.current === "idle") {
        return
      }

      if (result.error || !result.token) {
        throw new Error(result.error || "Failed to get token")
      }

      await scribe.connect({
        token: result.token,
        modelId: "scribe_v2_realtime",
        languageCode: selectedLanguage || undefined,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        vadSilenceThresholdSecs: 0.5,
        minSpeechDurationMs: 100,
        minSilenceDurationMs: 300,
      })

      if (connectionStateRef.current !== "connecting") {
        try {
          scribe.disconnect()
        } catch {
          // Ignore
        }
        return
      }

      updateConnectionState("connected")

      if (startSoundRef.current) {
        startSoundRef.current.currentTime = 0
        startSoundRef.current.play().catch(() => {})
      }
    } catch (error) {
      console.error("[Scribe] Connection error:", error)
      updateConnectionState("idle")
      setRecording((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Connection failed",
      }))
    }
  }, [
    clearSessionRefs,
    connectionState,
    scribe,
    selectedLanguage,
    updateConnectionState,
  ])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "k" &&
        (e.metaKey || e.ctrlKey) &&
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA"].includes(e.target.tagName)
      ) {
        e.preventDefault()
        handleToggleRecording()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleToggleRecording])

  useEffect(() => {
    const sounds = [
      {
        ref: startSoundRef,
        url: "https://ui.elevenlabs.io/sounds/transcriber-start.mp3",
      },
      {
        ref: endSoundRef,
        url: "https://ui.elevenlabs.io/sounds/transcriber-end.mp3",
      },
      {
        ref: errorSoundRef,
        url: "https://ui.elevenlabs.io/sounds/transcriber-error.mp3",
      },
    ]

    sounds.forEach(({ ref, url }) => {
      const audio = new Audio(url)
      audio.volume = 0.6
      audio.preload = "auto"
      audio.load()
      ref.current = audio
    })
  }, [])

  const displayText = recording.error || localTranscript
  const hasContent = Boolean(displayText) && connectionState === "connected"
  const isPartial = Boolean(lastTranscriptRef.current)

  return (
    <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center">
      <BackgroundAura
        status={connectionState === "connecting" ? "connecting" : scribe.status}
        isConnected={connectionState === "connected"}
      />

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden px-8 py-12">
        <div className="relative flex min-h-[350px] w-full flex-1 items-center justify-center overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-250",
              hasContent ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {hasContent && (
              <TranscriberTranscript
                transcript={displayText}
                error={recording.error}
                isPartial={isPartial}
                isConnected={connectionState === "connected"}
              />
            )}
          </div>

          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-250",
              !hasContent ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div
              className={cn(
                "absolute transition-opacity duration-250",
                connectionState === "connecting"
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              )}
            >
              <ShimmeringText
                text="Connecting..."
                className="text-2xl font-light tracking-wide whitespace-nowrap"
              />
            </div>
            <div
              className={cn(
                "absolute transition-opacity duration-250",
                connectionState === "connected" && !hasContent
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              )}
            >
              <ShimmeringText
                text="Say something aloud..."
                className="text-3xl font-light tracking-wide whitespace-nowrap"
              />
            </div>
          </div>

          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-250",
              connectionState === "idle"
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            )}
          >
            <div className="flex w-full max-w-sm flex-col gap-4 px-8">
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Realtime Speech to Text
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Transcribe your voice in real-time with high accuracy
                  </p>
                </div>

                <div className="w-full space-y-2">
                  <label className="text-foreground/70 text-sm font-medium">
                    Language
                  </label>
                  <LanguageSelector
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                    disabled={connectionState !== "idle"}
                  />
                </div>

                <Button
                  onClick={handleToggleRecording}
                  disabled={false}
                  size="lg"
                  className="bg-foreground/95 hover:bg-foreground/90 w-full justify-center gap-3"
                >
                  <span>Start Transcribing</span>
                  <kbd className="border-background/20 bg-background/10 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-xs sm:inline-flex">
                    {isMac ? "⌘K" : "Ctrl+K"}
                  </kbd>
                </Button>

                <Badge variant="outline" asChild>
                  <Link
                    href="https://elevenlabs.io/speech-to-text"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/60 hover:text-foreground/80 transition-colors"
                  >
                    Powered by ElevenLabs Speech to Text
                  </Link>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <BottomControls
          isConnected={connectionState === "connected"}
          hasError={Boolean(recording.error)}
          isMac={isMac}
          onStop={handleToggleRecording}
        />
      </div>
    </div>
  )
}

const TranscriberTranscript = React.memo(
  ({
    transcript,
    error,
    isPartial,
    isConnected,
  }: {
    transcript: string
    error: string
    isPartial?: boolean
    isConnected: boolean
  }) => {
    const characters = useMemo(() => transcript.split(""), [transcript])
    const previousNumChars = useDebounce(
      usePrevious(characters.length) ?? 0,
      100
    )
    const scrollRef = useRef<HTMLDivElement>(null)
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
      if (isConnected && scrollRef.current) {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
        scrollTimeoutRef.current = setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        }, 50)
      }
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }, [transcript, isConnected])

    return (
      <div className="absolute inset-0 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div
            className={cn(
              "min-h-[50%] w-full px-12 py-8",
              isConnected && "absolute bottom-16"
            )}
          >
            <div
              className={cn(
                "text-foreground/90 w-full text-xl leading-relaxed font-light",
                error && "text-red-500",
                isPartial && !error && "text-foreground/60"
              )}
            >
              {characters.map((char, index) => {
                const delay =
                  index >= previousNumChars
                    ? (index - previousNumChars + 1) * 0.012
                    : 0
                return (
                  <TranscriptCharacter key={index} char={char} delay={delay} />
                )
              })}
            </div>
          </div>
        </div>
        {transcript && !error && !isPartial && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 opacity-0 transition-opacity hover:opacity-60"
            onClick={() => {
              navigator.clipboard.writeText(transcript)
            }}
            aria-label="Copy transcript"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }
)
TranscriberTranscript.displayName = "TranscriberTranscript"
