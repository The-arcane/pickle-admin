// This layout ensures that the /super-admin/login page does not inherit the main
// /super-admin layout, which prevents the dashboard from flashing for
// unauthenticated users before they are redirected.

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
