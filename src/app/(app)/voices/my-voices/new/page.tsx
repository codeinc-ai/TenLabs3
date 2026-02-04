import Link from "next/link";
import { ArrowLeft, Mic2, Sparkles, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * New Voice Page (Voice Cloning)
 *
 * Placeholder page for upcoming voice cloning feature.
 */
export default function NewVoicePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/voices/my-voices">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Voice</h1>
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Coming Soon
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Clone your voice or create custom voices
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-6">
            <Mic2 className="h-16 w-16 text-primary" />
          </div>
          <h2 className="mt-8 text-2xl font-semibold">Voice Cloning</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            We&apos;re working on an exciting new feature that will let you
            clone your own voice or create custom AI voices from audio samples.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 max-w-2xl">
            <div className="rounded-lg border p-4">
              <Sparkles className="h-8 w-8 text-primary mx-auto" />
              <h3 className="mt-3 font-medium">Instant Cloning</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Clone a voice from just a few seconds of audio
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Mic2 className="h-8 w-8 text-primary mx-auto" />
              <h3 className="mt-3 font-medium">Professional Quality</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Studio-quality voice synthesis technology
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Clock className="h-8 w-8 text-primary mx-auto" />
              <h3 className="mt-3 font-medium">Quick Setup</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload audio and start generating in minutes
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button asChild>
              <Link href="/voices">
                <Mic2 className="mr-2 h-4 w-4" />
                Browse Voice Library
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/voices/my-voices">
                View My Voices
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
