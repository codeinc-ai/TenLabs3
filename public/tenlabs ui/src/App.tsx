import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TextEditor } from './components/TextEditor';
import { SettingsPanel } from './components/SettingsPanel';
import { HomePage } from './components/HomePage';
import { VoiceChangerPage } from './components/VoiceChangerPage';
import { VoiceChangerSettings } from './components/VoiceChangerSettings';
import { SoundEffectsPage } from './components/SoundEffectsPage';
import { VoiceIsolatorPage } from './components/VoiceIsolatorPage';
import { StudioPage } from './components/StudioPage';
import { DubbingPage } from './components/DubbingPage';
import { SpeechToTextPage } from './components/SpeechToTextPage';
import { AudioNativePage } from './components/AudioNativePage';
import { ProductionsPage } from './components/ProductionsPage';
import { VoicesPage } from './components/VoicesPage';
type Page =
'home' |
'text-to-speech' |
'voice-changer' |
'sound-effects' |
'voice-isolator' |
'studio' |
'dubbing' |
'speech-to-text' |
'audio-native' |
'productions' |
'voices';
export function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {activePage === 'home' && <HomePage />}

      {activePage === 'text-to-speech' &&
      <>
          <TextEditor />
          <SettingsPanel />
        </>
      }

      {activePage === 'voice-changer' &&
      <>
          <VoiceChangerPage />
          <VoiceChangerSettings />
        </>
      }

      {activePage === 'sound-effects' && <SoundEffectsPage />}

      {activePage === 'voice-isolator' && <VoiceIsolatorPage />}

      {activePage === 'studio' && <StudioPage />}

      {activePage === 'dubbing' && <DubbingPage />}

      {activePage === 'speech-to-text' && <SpeechToTextPage />}

      {activePage === 'audio-native' && <AudioNativePage />}

      {activePage === 'productions' && <ProductionsPage />}

      {activePage === 'voices' && <VoicesPage />}
    </div>);

}