import Link from "next/link";
import type { Metadata } from "next";

import { Frame } from "@/components/docs/Frame";
import { Step, Steps } from "@/components/docs/Steps";
import { Success } from "@/components/docs/Success";

export const metadata: Metadata = {
  title: "Sound effects (product guide)",
  description:
    "How to create high-quality sound effects from text with ElevenLabs.",
};

export default function SoundEffectsProductGuidePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="max-w-3xl">
        <p className="text-sm text-muted-foreground">Sound effects</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Sound effects (product guide)
        </h1>
        <p className="mt-3 text-muted-foreground">
          How to create high-quality sound effects from text with ElevenLabs.
        </p>
      </header>

      <div className="mt-8">
        <div className="overflow-hidden rounded-xl border bg-muted/20">
          <iframe
            width="100%"
            height={400}
            src="https://www.youtube.com/embed/iyHypKlscV0"
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="mt-4 text-muted-foreground">
          <strong>Sound effects</strong> enhance the realism and immersion of your
          audio projects. With ElevenLabs, you can generate sound effects from
          text and integrate them into your voiceovers and projects.
        </p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Guide</h2>

        <div className="mt-6">
          <Steps>
            <Step title="Navigate to Sound Effects">
              Head over to{" "}
              <a
                href="https://elevenlabs.io/app/sound-effects"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sound Effects
              </a>
              . You can find it under <strong>Playground</strong> in the
              sidebar.
            </Step>

            <Step title="Describe the sound effect">
              In the text box, type a description of the sound effect you want
              (e.g., “person walking on grass”).
            </Step>

            <Step title="Adjust settings">
              <div className="mt-4">
                <Frame background="subtle">
                  {/* TODO: Replace with real screenshot asset. */}
                  <img
                    alt="Sound effects settings"
                    src="/docs/assets/f180093a-afc0-4703-8bfc-e564af59d6a2.png"
                    className="h-auto w-full rounded-lg border bg-background"
                    loading="lazy"
                  />
                </Frame>
              </div>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>
                  Set the duration for the sound, or choose auto to let the AI
                  decide. The maximum length is 30 seconds.
                </li>
                <li>
                  Turn <strong>Looping</strong> on to create a seamless loop. The
                  ending will blend into the beginning without a noticeable gap.
                </li>
                <li>
                  Adjust the prompt influence setting to control how closely the
                  output should match the prompt. By default, this is set to
                  30%.
                </li>
              </ul>
            </Step>

            <Step title="Generate sound">
              Click the arrow to generate. Four sound effects will be created
              each time.
            </Step>

            <Step title="Review and regenerate">
              Go to your <strong>History</strong> tab to access the generated
              sound effects. Click the <strong>download</strong> icon and choose
              MP3 (44.1kHz) or WAV (48kHz). You can also click the{" "}
              <strong>star</strong> icon to save to your favorites, so you can
              access it again from your <strong>Favorites</strong> tab. If
              needed, adjust the prompt or settings and regenerate.
            </Step>
          </Steps>
        </div>

        <div className="mt-10">
          <Success>
            <strong>Exercise</strong>: Create a sound effect using the following
            prompt: Old-school funky brass stabs from a vinyl sample, stem, 88
            bpm in F# minor.
          </Success>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Explore the library</h2>

        <div className="mt-4">
          <Frame background="subtle">
            {/* TODO: Replace with real screenshot asset. */}
            <img
              alt="Sound effects explore"
              src="/docs/assets/d4f09368-2bc2-42b1-8493-82bc77277112.png"
              className="h-auto w-full rounded-lg border bg-background"
              loading="lazy"
            />
          </Frame>
        </div>

        <p className="mt-4 text-muted-foreground">
          Browse community-made sound effects in the <strong>Explore</strong> tab.
        </p>

        <p className="mt-4 text-muted-foreground">
          For more on prompting and how sound effects work, visit our{" "}
          <Link
            href="/docs/overview/capabilities/sound-effects"
            className="text-foreground underline underline-offset-4"
          >
            overview page
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
