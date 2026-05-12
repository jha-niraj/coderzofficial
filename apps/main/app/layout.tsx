import type { Metadata } from "next";
import "@repo/ui/styles/globals.css";
import { ThemeProvider } from "@repo/ui/components/themeprovider";
import { Geist, Space_Grotesk, Geist_Mono } from "next/font/google";
import { Toaster as SonnerToaster } from "@repo/ui/components/ui/sonner";
import { Providers } from "@/app/providers/providers";
import { AppProvider } from "./context/usercontext";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
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
	display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.buildrhq.com'

export const metadata: Metadata = {
	title: {
		default: "BuildrHQ — The Engineering Intelligence Suite",
		template: "%s | BuildrHQ"
	},
	description: "AI-powered platform for CS students and software engineers. Build your portfolio, ace technical interviews, practice DSA, and land your dream engineering job.",
	keywords: [
		"software engineering portfolio", "mock technical interview", "system design prep",
		"DSA practice", "open source contribution tracker", "AI resume builder",
		"cover letter generator", "coding interview prep", "cs student platform",
		"developer career tools", "BuildrHQ", "engineering intelligence suite"
	],
	authors: [{ name: "Niraj Jha", url: BASE_URL }],
	creator: "Shunya Tech",
	publisher: "Shunya Tech",
	metadataBase: new URL(BASE_URL),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: BASE_URL,
		siteName: "BuildrHQ",
		title: "BuildrHQ — The Engineering Intelligence Suite",
		description: "AI-powered platform for CS students and software engineers. Build your portfolio, ace interviews, practice DSA, and land your dream engineering job.",
		images: [
			{
				url: "/og/home.png",
				width: 1200,
				height: 630,
				alt: "BuildrHQ — The Engineering Intelligence Suite for Developers",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "BuildrHQ — The Engineering Intelligence Suite",
		description: "AI-powered platform for CS students and software engineers. Build your portfolio, ace interviews, practice DSA, and land your dream engineering job.",
		images: ["/og/home.png"],
		creator: "@buildrhq",
		site: "@buildrhq",
	},
	icons: {
		icon: [
			{ url: "/mainlogo.ico", sizes: "any" },
			{ url: "/mainlogo.png", type: "image/png", sizes: "512x512" },
		],
		apple: [
			{ url: "/mainlogo.png", sizes: "180x180", type: "image/png" },
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
		// Add when domain is verified in Google Search Console
		// google: "your-google-verification-code",
	},
	other: {
		"theme-color": "#0f172a",
	},
};

const organizationSchema = {
	"@context": "https://schema.org",
	"@type": "Organization",
	"name": "BuildrHQ",
	"url": BASE_URL,
	"logo": `${BASE_URL}/mainlogo.png`,
	"description": "AI-powered engineering intelligence platform for CS students and software engineers.",
	"sameAs": [
		"https://twitter.com/buildrhq",
		"https://github.com/buildrhq",
		"https://linkedin.com/company/buildrhq"
	],
	"foundingDate": "2024",
	"founders": [{ "@type": "Person", "name": "Niraj Jha" }],
}

const websiteSchema = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	"name": "BuildrHQ",
	"url": BASE_URL,
	"description": "AI-powered platform for CS students and software engineers.",
	"potentialAction": {
		"@type": "SearchAction",
		"target": {
			"@type": "EntryPoint",
			"urlTemplate": `${BASE_URL}/search?q={search_term_string}`
		},
		"query-input": "required name=search_term_string"
	}
}

const softwareAppSchema = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	"name": "BuildrHQ",
	"url": BASE_URL,
	"applicationCategory": "DeveloperApplication",
	"operatingSystem": "Web",
	"description": "AI-powered engineering intelligence suite: resume builder, mock interviews, DSA practice, system design prep, and open source tracking — all in one platform.",
	"offers": {
		"@type": "Offer",
		"price": "0",
		"priceCurrency": "USD",
		"description": "Free to use"
	},
	"aggregateRating": {
		"@type": "AggregateRating",
		"ratingValue": "4.8",
		"ratingCount": "120",
		"bestRating": "5"
	}
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
				/>
			</head>
			<body className={`
				${spaceGrotesk.className} ${geistSans.variable} ${geistMono.variable} antialiased
			`}>
                <Analytics/>
				<Providers>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<AppProvider>
							{children}
						</AppProvider>
						<SonnerToaster position="top-center" closeButton richColors />
					</ThemeProvider>
				</Providers>
			</body>
		</html>
	);
}
