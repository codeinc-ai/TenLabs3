"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/lib/services/billingService";

interface InvoicesClientProps {
  initialData: {
    invoices: Invoice[];
    total: number;
  };
}

/**
 * Invoices Client Component
 *
 * Displays paginated list of invoices with download links.
 */
export function InvoicesClient({ initialData }: InvoicesClientProps) {
  const [invoices] = useState<Invoice[]>(initialData.invoices);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    const variants: Record<Invoice["status"], "default" | "secondary" | "destructive"> = {
      paid: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
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
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground mt-1">
          View and download your billing history
        </p>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            {initialData.total} invoice{initialData.total !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No invoices yet</h3>
              <p className="text-muted-foreground mt-1">
                Your invoices will appear here once you subscribe to a paid plan.
              </p>
              <Link href="/billing">
                <Button className="mt-4">View Plans</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {formatDate(invoice.date)}
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.pdfUrl && invoice.amount > 0 && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
