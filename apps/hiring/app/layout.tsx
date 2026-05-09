import type { Metadata } from "next";
import "@repo/ui/styles/globals.css";
import { ThemeProvider } from "@repo/ui/components/themeprovider";
import { Geist, Space_Grotesk, Geist_Mono } from "next/font/google";
import { Toaster as SonnerToaster } from "@repo/ui/components/ui/sonner";
import { Providers } from "./providers/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});
const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	weight: ['300', '400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-space-grotesk',
})
const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "BuildrHQ Hiring | AI-Powered Recruitment Platform",
		template: "%s | BuildrHQ Hiring"
	},
	description: "The intelligent hiring platform for tech companies. Find pre-vetted engineers with verified skills through real projects, AI-powered assessments, and smart candidate matching.",
	keywords: [
		"Hiring Platform",
		"Tech Recruitment",
		"Software Engineer Hiring",
		"AI Recruitment",
		"Pre-vetted Candidates",
		"Coding Assessments",
		"Technical Interviews",
		"Talent Acquisition",
		"HR Tech",
		"Applicant Tracking System"
	],
	authors: [{ name: "BuildrHQ Team" }],
	creator: "BuildrHQ",
	publisher: "BuildrHQ",
	metadataBase: new URL("https://hiring.coderzai.xyz"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://hiring.coderzai.xyz",
		siteName: "BuildrHQ Hiring",
		title: "BuildrHQ Hiring - AI-Powered Recruitment Platform",
		description: "The intelligent hiring platform for tech companies. Find pre-vetted engineers with verified skills through real projects and AI-powered assessments.",
		images: [
			{
				url: "/hiring-og.png",
				width: 1200,
				height: 630,
				alt: "BuildrHQ Hiring - AI-Powered Recruitment Platform",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "BuildrHQ Hiring - AI-Powered Recruitment Platform",
		description: "The intelligent hiring platform for tech companies. Find pre-vetted engineers with verified skills.",
		images: ["/hiring-og.png"],
		creator: "@buildrhq",
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/hiring-logo.png", type: "image/png", sizes: "512x512" },
		],
		apple: [
			{ url: "/hiring-logo.png", sizes: "180x180", type: "image/png" },
		],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`
				${spaceGrotesk.className} ${geistSans.variable} ${geistMono.variable} antialiased 
			`}>
				<Providers>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
						<SonnerToaster position="top-center" closeButton richColors />
					</ThemeProvider>
				</Providers>
			</body>
		</html>
	);
}