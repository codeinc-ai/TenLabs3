import { currentUser } from "@clerk/nextjs/server";
import { AudioNativeClient } from "./AudioNativeClient";
import { getUserForTTS } from "@/lib/services/ttsPageService";

export default async function AudioNativePage() {
  const user = await currentUser();
  const clerkId = user?.id;
  const userData = clerkId ? await getUserForTTS(clerkId) : null;

  return <AudioNativeClient userPlan={userData?.plan ?? "free"} />;
}
