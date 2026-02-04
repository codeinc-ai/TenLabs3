import { currentUser } from "@clerk/nextjs/server";
import { getBillingOverview } from "@/lib/services/billingService";
import { BillingClient } from "./BillingClient";

/**
 * Billing Page
 *
 * Server component that fetches billing data
 * and renders the billing client.
 */
export default async function BillingPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch billing overview
  const billingData = clerkId ? await getBillingOverview(clerkId) : null;

  return (
    <BillingClient
      initialData={billingData}
      userEmail={user?.emailAddresses[0]?.emailAddress}
    />
  );
}
