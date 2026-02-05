"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Mic, FileAudio, Palette, Globe, Bot, Wand2, Volume2, AudioLines, Music, Image, Radio, Headphones, Library, Film, Smartphone, Zap, Shield, Cpu, Languages, Play } from "lucide-react";
import ProductPageLayout from "@/components/landing/ProductPageLayout";

const products: Record<string, {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta?: string;
    image?: string;
  };
  features: { title: string; desc: string; icon?: React.ReactNode }[];
  faq: { q: string; a: string }[];
}> = {
  "tts": {
    hero: {
      eyebrow: "Text to Speech",
      title: "Generate human-like AI voice\nfrom text in seconds",
      subtitle: "Convert text to human-quality speech with our advanced AI models. Choose from 30+ voices across 29 languages, with fine control over tone, pacing, and emotion.",
      primaryCta: "Try TTS for free",
      secondaryCta: "View pricing",
      image: "/images/landing/tts-controls-panel.jpg",
    },
    features: [
      { title: "Studio-quality voices", desc: "Voices trained on professional recordings for broadcast-ready output.", icon: <Mic className="size-4" /> },
      { title: "29 languages", desc: "Native-sounding speech across major world languages.", icon: <Languages className="size-4" /> },
      { title: "Real-time streaming", desc: "Start playback instantly with our streaming API.", icon: <Zap className="size-4" /> },
      { title: "SSML support", desc: "Fine control over pronunciation, pauses, and emphasis.", icon: <Cpu className="size-4" /> },
      { title: "Voice customization", desc: "Adjust stability, similarity, and style for perfect output.", icon: <Wand2 className="size-4" /> },
      { title: "API & SDK", desc: "Integrate TTS into your product with our developer tools.", icon: <Globe className="size-4" /> },
    ],
    faq: [
      { q: "What is Text to Speech?", a: "Text to Speech (TTS) converts written text into natural-sounding spoken audio using AI." },
      { q: "How many voices are available?", a: "We offer 30+ high-quality voices across 29 languages, with new voices added regularly." },
      { q: "Can I use TTS for commercial projects?", a: "Yes, all generated audio can be used commercially according to your plan terms." },
      { q: "What audio formats are supported?", a: "We support MP3, WAV, and OGG formats at various sample rates." },
    ],
  },
  "text-to-speech": {
    hero: {
      eyebrow: "Text to Speech",
      title: "Generate human-like AI voice\nfrom text in seconds",
      subtitle: "Convert text to human-quality speech with our advanced AI models. Choose from 30+ voices across 29 languages, with fine control over tone, pacing, and emotion.",
      primaryCta: "Try TTS for free",
      secondaryCta: "View pricing",
      image: "/images/landing/tts-controls-panel.jpg",
    },
    features: [
      { title: "Studio-quality voices", desc: "Voices trained on professional recordings for broadcast-ready output.", icon: <Mic className="size-4" /> },
      { title: "29 languages", desc: "Native-sounding speech across major world languages.", icon: <Languages className="size-4" /> },
      { title: "Real-time streaming", desc: "Start playback instantly with our streaming API.", icon: <Zap className="size-4" /> },
      { title: "SSML support", desc: "Fine control over pronunciation, pauses, and emphasis.", icon: <Cpu className="size-4" /> },
      { title: "Voice customization", desc: "Adjust stability, similarity, and style for perfect output.", icon: <Wand2 className="size-4" /> },
      { title: "API & SDK", desc: "Integrate TTS into your product with our developer tools.", icon: <Globe className="size-4" /> },
    ],
    faq: [
      { q: "What is Text to Speech?", a: "Text to Speech (TTS) converts written text into natural-sounding spoken audio using AI." },
      { q: "How many voices are available?", a: "We offer 30+ high-quality voices across 29 languages, with new voices added regularly." },
      { q: "Can I use TTS for commercial projects?", a: "Yes, all generated audio can be used commercially according to your plan terms." },
      { q: "What audio formats are supported?", a: "We support MP3, WAV, and OGG formats at various sample rates." },
    ],
  },
  "stt": {
    hero: {
      eyebrow: "Speech to Text",
      title: "Transcribe audio and video\nwith 99% accuracy",
      subtitle: "Convert audio to text with industry-leading accuracy. Automatic speaker diarization, timestamps, and punctuation included.",
      primaryCta: "Try STT for free",
      secondaryCta: "View pricing",
      image: "/images/landing/stt-studio-preview.jpg",
    },
    features: [
      { title: "99% accuracy", desc: "State-of-the-art models trained on diverse audio.", icon: <Zap className="size-4" /> },
      { title: "Speaker detection", desc: "Automatic diarization identifies who said what.", icon: <Mic className="size-4" /> },
      { title: "Timestamps", desc: "Word-level timing for precise alignment.", icon: <Cpu className="size-4" /> },
      { title: "100+ languages", desc: "Transcription support for most spoken languages.", icon: <Languages className="size-4" /> },
      { title: "Real-time mode", desc: "Get transcriptions as audio is being recorded.", icon: <Radio className="size-4" /> },
      { title: "Batch processing", desc: "Process multiple files at once via API.", icon: <Globe className="size-4" /> },
    ],
    faq: [
      { q: "What is Speech to Text?", a: "Speech to Text (STT) converts spoken audio into written text using AI." },
      { q: "How accurate is the transcription?", a: "Our models achieve 99% accuracy on clear audio in supported languages." },
      { q: "Can it handle multiple speakers?", a: "Yes, our speaker diarization identifies and labels different speakers." },
      { q: "What file formats are supported?", a: "We support MP3, WAV, M4A, and most common audio/video formats." },
    ],
  },
  "speech-to-text": {
    hero: {
      eyebrow: "Speech to Text",
      title: "Transcribe audio and video\nwith 99% accuracy",
      subtitle: "Convert audio to text with industry-leading accuracy. Automatic speaker diarization, timestamps, and punctuation included.",
      primaryCta: "Try STT for free",
      secondaryCta: "View pricing",
      image: "/images/landing/stt-studio-preview.jpg",
    },
    features: [
      { title: "99% accuracy", desc: "State-of-the-art models trained on diverse audio.", icon: <Zap className="size-4" /> },
      { title: "Speaker detection", desc: "Automatic diarization identifies who said what.", icon: <Mic className="size-4" /> },
      { title: "Timestamps", desc: "Word-level timing for precise alignment.", icon: <Cpu className="size-4" /> },
      { title: "100+ languages", desc: "Transcription support for most spoken languages.", icon: <Languages className="size-4" /> },
      { title: "Real-time mode", desc: "Get transcriptions as audio is being recorded.", icon: <Radio className="size-4" /> },
      { title: "Batch processing", desc: "Process multiple files at once via API.", icon: <Globe className="size-4" /> },
    ],
    faq: [
      { q: "What is Speech to Text?", a: "Speech to Text (STT) converts spoken audio into written text using AI." },
      { q: "How accurate is the transcription?", a: "Our models achieve 99% accuracy on clear audio in supported languages." },
      { q: "Can it handle multiple speakers?", a: "Yes, our speaker diarization identifies and labels different speakers." },
      { q: "What file formats are supported?", a: "We support MP3, WAV, M4A, and most common audio/video formats." },
    ],
  },
  "realtime-stt": {
    hero: {
      eyebrow: "Realtime Speech to Text",
      title: "Live speech transcription\nwith sub-second latency",
      subtitle: "Transcribe audio in real-time with sub-second latency. Perfect for live captioning, voice interfaces, and interactive applications.",
      primaryCta: "Try Realtime STT",
      secondaryCta: "View pricing",
    },
    features: [
      { title: "Sub-second latency", desc: "See transcriptions as words are spoken.", icon: <Zap className="size-4" /> },
      { title: "Streaming API", desc: "WebSocket connection for continuous transcription.", icon: <Radio className="size-4" /> },
      { title: "Interim results", desc: "Get partial results as speech is being processed.", icon: <Cpu className="size-4" /> },
      { title: "Speaker tracking", desc: "Identify different speakers in real-time.", icon: <Mic className="size-4" /> },
      { title: "50+ languages", desc: "Real-time support for major languages.", icon: <Languages className="size-4" /> },
      { title: "Low resource", desc: "Optimized for mobile and edge devices.", icon: <Smartphone className="size-4" /> },
    ],
    faq: [
      { q: "What's the latency?", a: "Typically under 500ms from speech to text appearance." },
      { q: "How do interim results work?", a: "You receive partial transcriptions that update as more context becomes available." },
      { q: "Can I use this for live captioning?", a: "Yes, it's perfect for live events, meetings, and accessibility features." },
    ],
  },
  "voice-isolator": {
    hero: {
      eyebrow: "Voice Isolator",
      title: "Extract crystal-clear speech\nfrom any audio",
      subtitle: "Remove background noise and isolate voice from any audio. Perfect for cleaning up recordings, podcasts, and video content.",
      primaryCta: "Try Voice Isolator",
      secondaryCta: "View pricing",
      image: "/images/landing/isolator-creative-platform.jpg",
    },
    features: [
      { title: "Noise removal", desc: "Eliminate background noise, music, and ambient sounds.", icon: <Headphones className="size-4" /> },
      { title: "Voice enhancement", desc: "Boost clarity and presence of isolated voice.", icon: <Mic className="size-4" /> },
      { title: "Multi-speaker", desc: "Isolate individual speakers from group recordings.", icon: <Cpu className="size-4" /> },
      { title: "Batch processing", desc: "Process multiple files at once.", icon: <Globe className="size-4" /> },
      { title: "40dB reduction", desc: "Industry-leading noise reduction performance.", icon: <Zap className="size-4" /> },
      { title: "Lossless quality", desc: "Preserve voice quality while removing noise.", icon: <Shield className="size-4" /> },
    ],
    faq: [
      { q: "What can Voice Isolator remove?", a: "Background noise, music, ambient sounds, reverb, and other distractions." },
      { q: "Will it affect voice quality?", a: "No, our AI preserves voice characteristics while removing unwanted audio." },
      { q: "Can I isolate multiple speakers?", a: "Yes, you can separate and isolate individual speakers from group recordings." },
    ],
  },
  "voice-changer": {
    hero: {
      eyebrow: "Voice Changer",
      title: "Transform your voice\ninto any character",
      subtitle: "Change your voice to any character or style while preserving speech content. Real-time and post-processing options available.",
      primaryCta: "Try Voice Changer",
      secondaryCta: "View pricing",
      image: "/images/landing/voice-changer-aurora-bg.png",
    },
    features: [
      { title: "200+ presets", desc: "Choose from hundreds of character voices.", icon: <Library className="size-4" /> },
      { title: "Real-time mode", desc: "Transform voice during live calls or streams.", icon: <Radio className="size-4" /> },
      { title: "Emotion control", desc: "Adjust emotional tone of transformed voice.", icon: <Wand2 className="size-4" /> },
      { title: "Custom targets", desc: "Use your own voice clones as targets.", icon: <Mic className="size-4" /> },
      { title: "Studio quality", desc: "Professional output for commercial use.", icon: <Zap className="size-4" /> },
      { title: "<50ms latency", desc: "Fast enough for real-time conversations.", icon: <Cpu className="size-4" /> },
    ],
    faq: [
      { q: "How does Voice Changer work?", a: "It analyzes your speech and transforms it to match the target voice while preserving words." },
      { q: "Can I use it in real-time?", a: "Yes, with under 50ms latency for live streaming and calls." },
      { q: "Can I create custom voice targets?", a: "Yes, you can use any voice clone as a target for transformation." },
    ],
  },
  "sfx": {
    hero: {
      eyebrow: "Sound Effects",
      title: "Generate any sound\nfrom text descriptions",
      subtitle: "Create custom sound effects from text descriptions. Perfect for game development, video production, and creative projects.",
      primaryCta: "Try Sound Effects",
      secondaryCta: "View pricing",
      image: "/images/landing/sfx-card-collage.png",
    },
    features: [
      { title: "Text-to-SFX", desc: "Describe the sound you want in natural language.", icon: <Volume2 className="size-4" /> },
      { title: "High quality", desc: "44.1kHz stereo output, broadcast ready.", icon: <Zap className="size-4" /> },
      { title: "Variations", desc: "Generate multiple takes of the same sound.", icon: <Wand2 className="size-4" /> },
      { title: "Loopable", desc: "Create seamless looping sounds for ambience.", icon: <Radio className="size-4" /> },
      { title: "Up to 30s", desc: "Generate sounds up to 30 seconds long.", icon: <Cpu className="size-4" /> },
      { title: "Commercial use", desc: "Full rights to use generated sounds.", icon: <Shield className="size-4" /> },
    ],
    faq: [
      { q: "What kinds of sounds can I create?", a: "Anything you can describe: explosions, footsteps, ambient sounds, fantasy effects, and more." },
      { q: "What's the audio quality?", a: "44.1kHz stereo, suitable for professional production." },
      { q: "Can I use the sounds commercially?", a: "Yes, generated sounds can be used in commercial projects." },
    ],
  },
  "music": {
    hero: {
      eyebrow: "Music Generation",
      title: "Turn ideas into songs\nwith AI music creation",
      subtitle: "Generate original music from text descriptions. Create background tracks, jingles, and complete songs with AI.",
      primaryCta: "Try Music Generation",
      secondaryCta: "View pricing",
    },
    features: [
      { title: "50+ genres", desc: "Generate any style from classical to electronic.", icon: <Music className="size-4" /> },
      { title: "Stems output", desc: "Get separate tracks for mixing flexibility.", icon: <AudioLines className="size-4" /> },
      { title: "Custom length", desc: "Generate from 15 seconds to full songs.", icon: <Cpu className="size-4" /> },
      { title: "Lyric integration", desc: "Add vocals with AI-generated lyrics.", icon: <Mic className="size-4" /> },
      { title: "320kbps quality", desc: "High-quality audio output.", icon: <Zap className="size-4" /> },
      { title: "Commercial license", desc: "Full rights to use generated music.", icon: <Shield className="size-4" /> },
    ],
    faq: [
      { q: "What genres are supported?", a: "Over 50 genres including pop, rock, classical, electronic, jazz, and more." },
      { q: "Can I get separate tracks?", a: "Yes, you can export stems for vocals, drums, bass, and other instruments." },
      { q: "What's the maximum song length?", a: "Up to 5 minutes for a single generation." },
    ],
  },
  "image-video": {
    hero: {
      eyebrow: "Image & Video",
      title: "Bring ideas to life\nwith AI visuals",
      subtitle: "Generate images and videos from text descriptions. Create visual content that matches your audio productions.",
      primaryCta: "Try Image & Video",
      secondaryCta: "View pricing",
    },
    features: [
      { title: "Text-to-image", desc: "Generate images from detailed prompts.", icon: <Image className="size-4" /> },
      { title: "Text-to-video", desc: "Create short video clips from descriptions.", icon: <Film className="size-4" /> },
      { title: "Style control", desc: "Choose artistic styles and visual aesthetics.", icon: <Palette className="size-4" /> },
      { title: "Audio sync", desc: "Generate visuals that match your audio.", icon: <AudioLines className="size-4" /> },
      { title: "4K resolution", desc: "High-resolution output for production use.", icon: <Zap className="size-4" /> },
      { title: "100+ styles", desc: "Wide variety of visual styles available.", icon: <Wand2 className="size-4" /> },
    ],
    faq: [
      { q: "What resolution can I generate?", a: "Up to 4K for images and 1080p for videos." },
      { q: "How long can videos be?", a: "Up to 60 seconds per generation." },
      { q: "Can I sync to my audio?", a: "Yes, you can generate visuals that match audio timing and mood." },
    ],
  },
  "voice-design": {
    hero: {
      eyebrow: "Voice Design",
      title: "Generate a custom voice\nfrom text descriptions",
      subtitle: "Create unique AI voices by describing what you want. No recordings needed—just write a prompt like 'warm, friendly female voice with a British accent.'",
      primaryCta: "Try Voice Design",
      secondaryCta: "View pricing",
      image: "/images/landing/voice-design-hero.png",
    },
    features: [
      { title: "Text prompts", desc: "Describe your ideal voice in natural language.", icon: <Palette className="size-4" /> },
      { title: "Instant generation", desc: "Get a unique voice in seconds, not hours.", icon: <Zap className="size-4" /> },
      { title: "Fine-tuning", desc: "Adjust parameters to perfect your voice.", icon: <Wand2 className="size-4" /> },
      { title: "Commercial license", desc: "Full rights to use generated voices.", icon: <Shield className="size-4" /> },
      { title: "Unlimited variations", desc: "Generate as many variations as you need.", icon: <Cpu className="size-4" /> },
      { title: "Save & reuse", desc: "Save voices to your library for later.", icon: <Library className="size-4" /> },
    ],
    faq: [
      { q: "How do I describe a voice?", a: "Use natural language: age, gender, accent, tone, emotion, and any specific characteristics." },
      { q: "How long does generation take?", a: "Typically under 10 seconds to create a new voice." },
      { q: "Can I use designed voices commercially?", a: "Yes, all generated voices can be used in commercial projects." },
    ],
  },
  "voice-cloning": {
    hero: {
      eyebrow: "Voice Cloning",
      title: "Create a replica\nof any voice",
      subtitle: "Clone any voice from audio samples. Preserve the unique characteristics that make a voice recognizable.",
      primaryCta: "Try Voice Cloning",
      secondaryCta: "View pricing",
      image: "/images/landing/voice-cloning-pvc-panel.png",
    },
    features: [
      { title: "High fidelity", desc: "Clones that capture voice identity and nuance.", icon: <Mic className="size-4" /> },
      { title: "5-minute samples", desc: "Quality clones from minimal source audio.", icon: <Zap className="size-4" /> },
      { title: "Emotion control", desc: "Adjust emotional tone and delivery style.", icon: <Wand2 className="size-4" /> },
      { title: "Consent workflow", desc: "Built-in verification for ethical use.", icon: <Shield className="size-4" /> },
      { title: "29 languages", desc: "Clone speaks in any supported language.", icon: <Languages className="size-4" /> },
      { title: "Professional quality", desc: "Broadcast-ready output quality.", icon: <Cpu className="size-4" /> },
    ],
    faq: [
      { q: "How much audio do I need?", a: "As little as 5 minutes of clean audio for a quality clone." },
      { q: "Is consent required?", a: "Yes, we require explicit consent from the voice owner for professional cloning." },
      { q: "Can clones speak other languages?", a: "Yes, cloned voices can speak in any of our 29 supported languages." },
    ],
  },
  "dubbing": {
    hero: {
      eyebrow: "Dubbing",
      title: "Localize audio content\nwhile preserving voice",
      subtitle: "Dub video content into 29 languages while maintaining the original speaker's voice characteristics and style.",
      primaryCta: "Try Dubbing",
      secondaryCta: "View pricing",
      image: "/images/landing/dubbing-hero-ui.png",
    },
    features: [
      { title: "29 languages", desc: "Reach global audiences with native-quality dubbing.", icon: <Languages className="size-4" /> },
      { title: "Lip sync", desc: "Timing adjusted to match mouth movements.", icon: <Film className="size-4" /> },
      { title: "Voice preservation", desc: "Speaker's voice identity maintained across languages.", icon: <Mic className="size-4" /> },
      { title: "Batch processing", desc: "Dub entire series efficiently.", icon: <Cpu className="size-4" /> },
      { title: "Transcript editing", desc: "Review and edit translations before dubbing.", icon: <Wand2 className="size-4" /> },
      { title: "Broadcast quality", desc: "Professional output for distribution.", icon: <Zap className="size-4" /> },
    ],
    faq: [
      { q: "How does voice preservation work?", a: "We analyze the speaker's voice and recreate it in the target language." },
      { q: "Is lip sync included?", a: "Yes, timing is adjusted to match mouth movements where possible." },
      { q: "Can I edit the translation?", a: "Yes, you can review and edit transcripts before generating dubbed audio." },
    ],
  },
  "studio": {
    hero: {
      eyebrow: "Studio",
      title: "The best AI audio models in\none powerful editor",
      subtitle: "Built for video creators, podcasters and audiobook authors — bring your stories to life with expressive AI voiceovers, music and sound effects, and real-world recordings.",
      primaryCta: "Try Studio for free",
      image: "/images/landing/studio-hero-gradient.jpg",
    },
    features: [
      { title: "Timeline editor", desc: "Trim, merge, and edit audio and video with precision.", icon: <Film className="size-4" /> },
      { title: "10,000+ voices", desc: "Access our full voice library in the editor.", icon: <Library className="size-4" /> },
      { title: "AI sound effects", desc: "Generate any sound effect from a prompt.", icon: <Volume2 className="size-4" /> },
      { title: "Music generation", desc: "Create background music that fits your content.", icon: <Music className="size-4" /> },
      { title: "Auto captions", desc: "Generate captions in one click.", icon: <Cpu className="size-4" /> },
      { title: "Collaboration", desc: "Share projects and collect feedback.", icon: <Globe className="size-4" /> },
    ],
    faq: [
      { q: "What is Studio designed for?", a: "Producing long-form audio and narrated videos with a timeline editor and integrated AI audio tools." },
      { q: "Does Studio support video?", a: "Yes — upload MP4 or MOV files and enhance them with AI voiceovers, music, and effects." },
      { q: "Can I collaborate with others?", a: "Yes — share editable links for client or team feedback with time-stamped comments." },
    ],
  },
  "voice-library": {
    hero: {
      eyebrow: "Voice Library",
      title: "Voices for any character\nyou can imagine",
      subtitle: "Browse and use thousands of pre-made voices. Find the perfect voice for your project from our curated collection.",
      primaryCta: "Explore Voice Library",
    },
    features: [
      { title: "3000+ voices", desc: "Curated voices for quality and variety.", icon: <Library className="size-4" /> },
      { title: "Search & filter", desc: "Find voices by age, gender, accent, and style.", icon: <Cpu className="size-4" /> },
      { title: "Preview samples", desc: "Listen before you commit to a voice.", icon: <Play className="size-4" /> },
      { title: "Instant access", desc: "Use any library voice immediately.", icon: <Zap className="size-4" /> },
      { title: "29 languages", desc: "Voices across major world languages.", icon: <Languages className="size-4" /> },
      { title: "New weekly", desc: "Fresh voices added every week.", icon: <Wand2 className="size-4" /> },
    ],
    faq: [
      { q: "How many voices are in the library?", a: "Over 3,000 curated voices across 29 languages." },
      { q: "Can I preview before using?", a: "Yes, every voice has audio samples you can listen to." },
      { q: "Are new voices added regularly?", a: "Yes, we add new voices every week based on user requests and trends." },
    ],
  },
  "productions": {
    hero: {
      eyebrow: "Productions",
      title: "Human-edited content\nat scale",
      subtitle: "Premium audio production with human review and editing. For projects that require the highest quality and attention to detail.",
      primaryCta: "Get started",
      secondaryCta: "Contact sales",
      image: "/images/landing/productions-video-1.jpg",
    },
    features: [
      { title: "Human review", desc: "Every output reviewed by audio professionals.", icon: <Mic className="size-4" /> },
      { title: "Custom direction", desc: "Provide detailed direction for exact results.", icon: <Wand2 className="size-4" /> },
      { title: "Unlimited revisions", desc: "Revisions until you're satisfied.", icon: <Cpu className="size-4" /> },
      { title: "Dedicated support", desc: "Work directly with our production team.", icon: <Shield className="size-4" /> },
      { title: "24-48h turnaround", desc: "Fast delivery for time-sensitive projects.", icon: <Zap className="size-4" /> },
      { title: "Broadcast quality", desc: "Professional output for any distribution.", icon: <Film className="size-4" /> },
    ],
    faq: [
      { q: "What makes Productions different?", a: "Human professionals review and refine every output for maximum quality." },
      { q: "How long does turnaround take?", a: "Typically 24-48 hours depending on project complexity." },
      { q: "Are revisions included?", a: "Yes, unlimited revisions until you're satisfied." },
    ],
  },
  "mobile-app": {
    hero: {
      eyebrow: "Mobile App",
      title: "Lifelike voiceovers\nwherever you go",
      subtitle: "Access TenLabs voice technology from your mobile device. Record, generate, and edit audio anywhere.",
      primaryCta: "Get the app",
      image: "/images/landing/mobile-hero-phone.jpg",
    },
    features: [
      { title: "Voice recording", desc: "High-quality mobile recording for voice cloning.", icon: <Mic className="size-4" /> },
      { title: "TTS generation", desc: "Generate speech directly on your phone.", icon: <AudioLines className="size-4" /> },
      { title: "Project sync", desc: "Access your projects across all devices.", icon: <Globe className="size-4" /> },
      { title: "Offline mode", desc: "Work without internet connection.", icon: <Smartphone className="size-4" /> },
      { title: "iOS & Android", desc: "Available on both major platforms.", icon: <Cpu className="size-4" /> },
      { title: "Real-time sync", desc: "Changes sync instantly to cloud.", icon: <Zap className="size-4" /> },
    ],
    faq: [
      { q: "What can I do in the mobile app?", a: "Record audio, generate speech, edit projects, and sync with your desktop workflow." },
      { q: "Does it work offline?", a: "Yes, basic features work offline with sync when you're back online." },
      { q: "Is it free?", a: "The app is free to download; usage counts against your account credits." },
    ],
  },
  "conversational-ai": {
    hero: {
      eyebrow: "Conversational AI",
      title: "Real-time voice for\nAI agents and assistants",
      subtitle: "Add natural voice to your AI assistants and agents. Sub-100ms latency enables fluid, human-like conversations.",
      primaryCta: "Get started",
      secondaryCta: "View pricing",
    },
    features: [
      { title: "<100ms latency", desc: "Fast enough for natural back-and-forth.", icon: <Zap className="size-4" /> },
      { title: "Bidirectional", desc: "Listen and speak simultaneously.", icon: <Radio className="size-4" /> },
      { title: "Interruption handling", desc: "Graceful handling of user interruptions.", icon: <Cpu className="size-4" /> },
      { title: "Custom voices", desc: "Use any voice from our library or your clones.", icon: <Mic className="size-4" /> },
      { title: "WebSocket API", desc: "Real-time streaming via WebSocket.", icon: <Globe className="size-4" /> },
      { title: "99.9% uptime", desc: "Enterprise-grade reliability.", icon: <Shield className="size-4" /> },
    ],
    faq: [
      { q: "What's the latency?", a: "Sub-100ms time-to-first-audio for natural conversations." },
      { q: "How does interruption handling work?", a: "The API detects when users interrupt and gracefully stops speaking." },
      { q: "Can I use custom voices?", a: "Yes, use any voice from our library or your own voice clones." },
    ],
  },
};

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = products[slug];

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <Link href="/creative-platform" className="mt-4 inline-block text-white/65 hover:text-white">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProductPageLayout
      hero={product.hero}
      features={product.features}
      faq={product.faq}
    />
  );
}
