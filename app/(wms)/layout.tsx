import WmsShell from "@/app/components/layout/WmsShell";

export default function WmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WmsShell>{children}</WmsShell>;
}
