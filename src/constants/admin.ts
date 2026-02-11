// src/constants/admin.ts

/**
 * Email addresses with admin access to blog management
 * Add your admin email addresses here
 */
export const ADMIN_EMAILS: string[] = [
  "admin@tenlabs.ai",
  "codeinc.ai@gmail.com",
  "im2gudguy@gmail.com",
];

/**
 * Check if an email has admin access
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === email.toLowerCase()
  );
}
