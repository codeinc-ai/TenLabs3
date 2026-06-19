import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — TenLabs",
  description:
    "The terms that govern your use of TenLabs' AI voice and audio platform.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="February 4, 2026"
      intro="These Terms of Service govern your access to and use of TenLabs.ai and all related products, websites, and services. By creating an account or using the platform, you agree to these terms."
      sections={[
        {
          heading: "Acceptance of Terms",
          body: [
            "By accessing or using TenLabs, you confirm that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you are using the platform on behalf of an organization, you represent that you have authority to bind that organization.",
            "If you do not agree with any part of these terms, you may not access or use the service.",
          ],
        },
        {
          heading: "Eligibility & Accounts",
          body: [
            "You must be at least 13 years old (or the minimum age of digital consent in your country) to use TenLabs. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
            [
              "Provide accurate and complete registration information.",
              "Keep your login credentials secure and confidential.",
              "Notify us immediately of any unauthorized use of your account.",
            ],
          ],
        },
        {
          heading: "Use of the Service",
          body: [
            "TenLabs grants you a limited, non-exclusive, non-transferable license to use the platform in accordance with these terms and your subscription plan. You agree to use the service only for lawful purposes.",
            "Generated audio and content are subject to the commercial-use rights described in your plan. Free-tier output may be limited to non-commercial use.",
          ],
        },
        {
          heading: "Voice Cloning & Consent",
          body: [
            "You may only clone, recreate, or synthesize a voice for which you hold the necessary rights or have obtained explicit, verifiable consent from the voice owner. Impersonation, fraud, and deceptive use are strictly prohibited.",
            "You are solely responsible for ensuring you have lawful permission to use any voice samples you upload.",
          ],
        },
        {
          heading: "Subscriptions & Billing",
          body: [
            "Paid plans are billed in advance on a recurring basis. Credits reset at the start of each billing period and do not roll over unless explicitly stated. You can upgrade, downgrade, or cancel your plan at any time from your account settings.",
            "Cancellations take effect at the end of the current billing period, and you will retain access until then. Fees already paid are non-refundable except where required by law.",
          ],
        },
        {
          heading: "Intellectual Property",
          body: [
            "TenLabs and its licensors retain all rights, title, and interest in the platform, including software, models, branding, and underlying technology. Subject to your compliance with these terms, you own the audio outputs you generate to the extent permitted by your plan.",
          ],
        },
        {
          heading: "Termination",
          body: [
            "We may suspend or terminate your access if you violate these terms, misuse the service, or engage in activity that harms TenLabs, other users, or third parties. You may stop using the service and close your account at any time.",
          ],
        },
        {
          heading: "Disclaimers & Liability",
          body: [
            'The service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, TenLabs is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
          ],
        },
        {
          heading: "Changes to These Terms",
          body: [
            "We may update these Terms of Service from time to time. We will notify you of material changes, and your continued use of the platform after such changes constitutes acceptance of the revised terms.",
          ],
        },
      ]}
    />
  );
}
