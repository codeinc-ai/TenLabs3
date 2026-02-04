import Link from "next/link";
import { ArrowLeft, Settings, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ voiceId: string }>;
}

/**
 * Voice Edit Page
 *
 * Placeholder page for editing voice settings.
 * Will be functional once voice cloning is implemented.
 */
export default async function VoiceEditPage({ params }: PageProps) {
  const { voiceId } = await params;

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
            <h1 className="text-3xl font-bold tracking-tight">Edit Voice</h1>
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Coming Soon
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Customize voice settings and parameters
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-6">
            <Settings className="h-16 w-16 text-primary" />
          </div>
          <h2 className="mt-8 text-2xl font-semibold">Voice Editing</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Voice editing capabilities will be available once you create custom
            voices using our voice cloning feature.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Voice ID: <code className="bg-muted px-2 py-1 rounded">{voiceId}</code>
          </p>

          <div className="mt-8 flex gap-4">
            <Button asChild>
              <Link href="/voices/my-voices/new">
                Create Custom Voice
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
