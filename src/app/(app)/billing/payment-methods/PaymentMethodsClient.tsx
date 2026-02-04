"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { PaymentMethod } from "@/lib/services/billingService";

interface PaymentMethodsClientProps {
  initialData: PaymentMethod[];
}

/**
 * Payment Methods Client Component
 *
 * Displays and manages user payment methods.
 */
export function PaymentMethodsClient({ initialData }: PaymentMethodsClientProps) {
  const [paymentMethods] = useState<PaymentMethod[]>(initialData);

  const getCardBrandIcon = (brand: string) => {
    // In production, you'd use actual card brand icons
    const brandColors: Record<string, string> = {
      visa: "text-blue-600",
      mastercard: "text-red-500",
      amex: "text-blue-400",
      discover: "text-orange-500",
    };
    return (
      <CreditCard className={`h-8 w-8 ${brandColors[brand.toLowerCase()] || "text-gray-500"}`} />
    );
  };

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;
  };

  const handleAddPaymentMethod = () => {
    // In production, this would open Stripe's payment element
    alert("In production, this would open Stripe's secure payment form.");
  };

  const handleRemovePaymentMethod = (id: string) => {
    // In production, this would call the API to remove the payment method
    console.log("Removing payment method:", id);
    alert("In production, this would remove the payment method.");
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/billing">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Billing
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground mt-1">
              Manage your payment methods for subscriptions
            </p>
          </div>
          <Button onClick={handleAddPaymentMethod}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Payment Methods List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saved Cards
          </CardTitle>
          <CardDescription>
            Your saved payment methods for automatic billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No payment methods</h3>
              <p className="text-muted-foreground mt-1">
                Add a payment method to subscribe to a paid plan.
              </p>
              <Button className="mt-4" onClick={handleAddPaymentMethod}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getCardBrandIcon(method.brand)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {method.brand}
                        </span>
                        <span className="text-muted-foreground">
                          •••• {method.last4}
                        </span>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {formatExpiry(method.expMonth, method.expYear)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the card ending in {method.last4} from your
                            account. You can add it back later if needed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemovePaymentMethod(method.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="font-medium">Secure payments</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your payment information is securely stored by Stripe. We never
                have access to your full card details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
