/** Layout neutro: la protezione admin vive in app/admin/(panel)/layout.tsx
 *  così /admin/login resta sempre raggiungibile. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
