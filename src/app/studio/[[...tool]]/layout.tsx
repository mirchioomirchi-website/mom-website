// Studio uses its own full-screen layout — bypass the site's nav/grain overlay.

export const metadata = {
  title: "MOM Content Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
