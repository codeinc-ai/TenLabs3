import { currentUser } from "@clerk/nextjs/server";

import { getUserForTTS } from "@/lib/services/ttsPageService";
import { AccountClient } from "./AccountClient";

/**
 * My Account Page
 *
 * Server component that resolves the authenticated user's plan, then hands off
 * to the client component which renders live Clerk profile data and supports
 * inline editing.
 */
export default async function AccountPage() {
  const user = await currentUser();
  const data = user?.id ? await getUserForTTS(user.id) : null;

  return <AccountClient plan={data?.plan ?? "free"} />;
}
