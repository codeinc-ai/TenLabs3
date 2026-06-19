import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — TenLabs",
  description:
    "The rules that keep TenLabs safe, ethical, and trustworthy for everyone.",
};

export default function PolicyPage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      lastUpdated="February 4, 2026"
      intro="This Acceptable Use Policy outlines how TenLabs may and may not be used. It exists to keep the platform safe, ethical, and trustworthy for our entire community. Violations may result in suspension or termination of your account."
      sections={[
        {
          heading: "Our Commitment",
          body: [
            "TenLabs builds powerful AI voice and audio tools. With that power comes responsibility — both ours and yours. This policy sets clear expectations so that creativity never comes at the expense of safety or consent.",
          ],
        },
        {
          heading: "Prohibited Content",
          body: [
            "You may not use TenLabs to create, upload, or distribute content that is illegal, harmful, or deceptive, including:",
            [
              "Content that impersonates a real person without their explicit consent.",
              "Fraud, scams, phishing, or any attempt to deceive or defraud others.",
              "Hate speech, harassment, or content that incites violence or discrimination.",
              "Sexually explicit material involving minors or non-consenting individuals.",
              "Disinformation designed to mislead the public or manipulate elections.",
            ],
          ],
        },
        {
          heading: "Voice & Likeness Consent",
          body: [
            "Recreating a person's voice requires their clear, verifiable permission. You are responsible for securing consent before cloning or synthesizing any voice, and for honoring requests to stop using a voice.",
            "Using someone's voice to defame, harass, or misrepresent them is strictly forbidden.",
          ],
        },
        {
          heading: "Platform Integrity",
          body: [
            "To protect the reliability of the service for everyone, you agree not to:",
            [
              "Attempt to bypass usage limits, rate limits, or access controls.",
              "Reverse engineer, scrape, or disrupt the platform or its infrastructure.",
              "Resell or redistribute API access in violation of your plan.",
              "Upload malware or attempt to compromise other users' accounts.",
            ],
          ],
        },
        {
          heading: "Responsible Disclosure",
          body: [
            "AI-generated audio should not be passed off as a genuine human recording in contexts where doing so would mislead or harm. We encourage clear labeling of synthetic media where appropriate.",
          ],
        },
        {
          heading: "Reporting Violations",
          body: [
            "If you encounter content or behavior that violates this policy, please report it to our team. We review reports promptly and take appropriate action to keep the community safe.",
          ],
        },
        {
          heading: "Enforcement",
          body: [
            "We may investigate suspected violations and take action including content removal, feature restrictions, account suspension, or termination. Serious or repeated violations may be reported to relevant authorities.",
          ],
        },
      ]}
    />
  );
}
