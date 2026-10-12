import type { Metadata } from "next";

// Keeps every admin page (including the login page) out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
