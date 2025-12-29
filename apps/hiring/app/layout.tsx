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
		default: "Coder'z Hiring | Find Pre-Vetted Engineers",
		template: "%s | Coder'z Hiring"
	},
	description: "The intelligent hiring platform for tech companies. Find pre-vetted engineers with verified skills through real projects and AI-powered assessments.",
	keywords: ["Hiring", "Recruitment", "Tech Hiring", "Software Engineers", "Developer Hiring", "Pre-vetted Candidates", "Coding Assessments", "Technical Interviews"],
	authors: [{ name: "Niraj Jha" }],
	creator: "Shunya Tech",
	publisher: "Shunya Tech",
	metadataBase: new URL("https://hiring.coderzai.xyz"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://hiring.coderzai.xyz",
		siteName: "Coder'z Hiring",
		title: "Coder'z Hiring - Find Pre-Vetted Engineers with Verified Skills",
		description: "The intelligent hiring platform for tech companies. Find pre-vetted engineers with verified skills through real projects and AI-powered assessments.",
		images: [
			{
				url: "/mainlogo.jpeg",
				width: 1024,
				height: 1024,
				alt: "Coder'z Hiring - Find Pre-Vetted Engineers",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Coder'z Hiring - Find Pre-Vetted Engineers with Verified Skills",
		description: "The intelligent hiring platform for tech companies. Find pre-vetted engineers with verified skills.",
		images: ["/mainlogo.jpeg"],
		creator: "@thecoderzlab",
	},
	icons: {
		icon: [
			{ url: "/mainlogo.ico", sizes: "any" },
			{ url: "/mainlogo.jpeg", type: "image/jpeg", sizes: "512x512" },
		],
		apple: [
			{ url: "/mainlogo.jpeg", sizes: "180x180", type: "image/jpeg" },
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
	verification: {
		// Add your verification codes here when you have them
		// google: "your-google-verification-code",
		// yandex: "your-yandex-verification-code",
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