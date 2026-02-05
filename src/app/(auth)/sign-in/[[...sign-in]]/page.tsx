import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="w-full">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden p-6 sm:p-7">
        <div className="mb-5">
          <h1
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
          >
            Sign in
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Use your TenLabs workspace credentials.
          </p>
        </div>

        <div className="clerk-dark-theme">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-0 p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
                socialButtonsBlockButtonText: "text-white/90 font-medium",
                dividerLine: "bg-white/10",
                dividerText: "text-white/50",
                formFieldLabel: "text-white/65 text-xs",
                formFieldInput:
                  "bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:ring-white/20 h-11 rounded-xl",
                formButtonPrimary:
                  "bg-white text-black hover:bg-white/90 h-11 rounded-xl font-medium",
                footerActionLink: "text-white hover:text-white/80",
                footerActionText: "text-white/50",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-white/65 hover:text-white",
                formFieldAction: "text-white/65 hover:text-white text-xs",
                formFieldWarningText: "text-amber-400",
                formFieldErrorText: "text-red-400",
                alertText: "text-white/80",
                formResendCodeLink: "text-white/65 hover:text-white",
                otpCodeFieldInput:
                  "bg-black/30 border-white/10 text-white h-12 rounded-xl",
                selectButton:
                  "bg-black/30 border-white/10 text-white hover:bg-white/10",
                selectOptionsContainer: "bg-black/90 border-white/10",
                selectOption: "text-white hover:bg-white/10",
                navbar: "hidden",
                navbarButton: "hidden",
                headerBackRow: "hidden",
                main: "gap-4",
                form: "gap-4",
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false,
              },
            }}
          />
        </div>

        <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-white/65">
            New here?{" "}
            <Link
              href="/sign-up"
              className="text-white hover:opacity-90 underline underline-offset-4"
            >
              Create an account
            </Link>
          </div>
          <div className="text-xs text-white/45">
            By continuing, you agree to the Terms & Privacy.
          </div>
        </div>
      </div>
    </div>
  );
}
