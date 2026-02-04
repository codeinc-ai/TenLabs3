import { currentUser } from "@clerk/nextjs/server";
import { getPaymentMethods } from "@/lib/services/billingService";
import { PaymentMethodsClient } from "./PaymentMethodsClient";

/**
 * Payment Methods Page
 *
 * Server component that fetches payment methods
 * and renders the payment methods client.
 */
export default async function PaymentMethodsPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch payment methods
  const paymentMethods = clerkId ? await getPaymentMethods(clerkId) : [];

  return <PaymentMethodsClient initialData={paymentMethods} />;
}
