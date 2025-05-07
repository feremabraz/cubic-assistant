import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "Ice Cube Character",
	description: "Interactive 3D character with Jotai state management",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`min-h-screen bg-[hsl(var(--background))] font-sans antialiased ${inter.variable}`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
