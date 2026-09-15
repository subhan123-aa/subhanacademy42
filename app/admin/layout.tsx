import "../globals.css";

/**
 * Keep the shared Tailwind stylesheet attached to the admin route segment.
 * This preserves the dashboard's complete visual system during client route
 * transitions as well as direct visits to /admin.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
