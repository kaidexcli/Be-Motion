import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Be Motion | Fitness, made personal",
  description: "Track your movement, workouts, hydration and progress with Be Motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
