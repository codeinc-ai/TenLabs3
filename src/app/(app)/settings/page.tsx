import { currentUser } from "@clerk/nextjs/server";

import { getUserForTTS } from "@/lib/services/ttsPageService";
import { PLANS } from "@/constants";
import { AccountClient } from "./AccountClient";

/**
 * My Account Page
 *
 * Server component that resolves the authenticated user's plan + usage, then
 * hands off to the client component which renders live Clerk profile data and
 * supports inline editing.
 */
export default async function AccountPage() {
  const user = await currentUser();
  const data = user?.id ? await getUserForTTS(user.id) : null;

  const plan = data?.plan ?? "free";
  const maxCredits = PLANS[plan].maxCredits;

  return (
    <AccountClient
      plan={plan}
      maxCredits={maxCredits}
      charactersUsed={data?.usage.charactersUsed ?? 0}
      generationsUsed={data?.usage.generationsUsed ?? 0}
    />
  );
}
