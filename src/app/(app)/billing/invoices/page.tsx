import { currentUser } from "@clerk/nextjs/server";
import { getInvoices } from "@/lib/services/billingService";
import { InvoicesClient } from "./InvoicesClient";

/**
 * Invoices Page
 *
 * Server component that fetches invoice data
 * and renders the invoices client.
 */
export default async function InvoicesPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch invoices
  const invoicesData = clerkId
    ? await getInvoices(clerkId, { limit: 20 })
    : { invoices: [], total: 0 };

  return <InvoicesClient initialData={invoicesData} />;
}
