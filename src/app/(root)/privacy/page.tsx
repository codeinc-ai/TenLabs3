import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — TenLabs",
  description:
    "How TenLabs collects, uses, and protects your personal data and audio content.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="February 4, 2026"
      intro="Your privacy matters to us. This Privacy Policy explains what information we collect, how we use it, and the choices you have when you use TenLabs.ai."
      sections={[
        {
          heading: "Information We Collect",
          body: [
            "We collect information you provide directly and data generated through your use of the platform.",
            [
              "Account details such as your name, email address, and profile photo.",
              "Content you create, including text prompts, uploaded audio, and generated output.",
              "Usage data such as features used, credits consumed, and device or browser information.",
              "Payment information, processed securely by our third-party payment provider.",
            ],
          ],
        },
        {
          heading: "How We Use Your Information",
          body: [
            "We use the information we collect to operate, maintain, and improve TenLabs.",
            [
              "To provide and personalize the service and your account experience.",
              "To process transactions and manage your subscription.",
              "To monitor usage, prevent abuse, and ensure platform security.",
              "To communicate with you about updates, features, and support.",
            ],
          ],
        },
        {
          heading: "Audio & Voice Data",
          body: [
            "Audio you upload or generate is processed to deliver the requested output. We do not use your private voice samples to train public models without your explicit consent.",
            "You can delete your generations at any time, and we remove associated audio files from active storage according to our retention schedule.",
          ],
        },
        {
          heading: "How We Share Information",
          body: [
            "We do not sell your personal data. We share information only with trusted service providers who help us run the platform — such as cloud hosting, authentication, and payment processing — under strict confidentiality obligations.",
            "We may disclose information when required by law or to protect the rights, safety, and security of TenLabs and its users.",
          ],
        },
        {
          heading: "Data Retention",
          body: [
            "We retain your information for as long as your account is active or as needed to provide the service. When you delete content or close your account, we remove or anonymize your data within a reasonable period, except where retention is required for legal or security reasons.",
          ],
        },
        {
          heading: "Your Rights & Choices",
          body: [
            "Depending on your location, you may have rights to access, correct, export, or delete your personal data.",
            [
              "Access and update your profile from your account settings.",
              "Request a copy or deletion of your data by contacting us.",
              "Opt out of non-essential marketing communications at any time.",
            ],
          ],
        },
        {
          heading: "Security",
          body: [
            "We implement industry-standard technical and organizational measures to protect your data, including encryption in transit and access controls. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
          ],
        },
        {
          heading: "Children's Privacy",
          body: [
            "TenLabs is not directed to children under 13, and we do not knowingly collect personal information from them. If you believe a child has provided us with personal data, please contact us so we can remove it.",
          ],
        },
        {
          heading: "Changes to This Policy",
          body: [
            "We may update this Privacy Policy periodically. We will notify you of significant changes and indicate the date of the latest revision at the top of this page.",
          ],
        },
      ]}
    />
  );
}
