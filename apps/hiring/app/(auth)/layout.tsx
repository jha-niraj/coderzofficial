import Footer from "@/components/landingpage/footer";
import Navbar from "@/components/landingpage/navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		default: "BuildrHQ",
		template: "%s | BuildrHQ"
	},
	description: "The Engineering Intelligence Platform for Computer Science Students",
	keywords: ["Learn", "Build Projects", "Computer Science", "Programming", "Coding", "Developer", "Tech Community", "Coding Resources", "Tech Articles", "Coding Tutorials"],
	authors: [{ name: "Niraj Jha" }],
	creator: "Shunya Tech",
	publisher: "Shunya Tech",
	metadataBase: new URL("https://www.coderzai.xyz"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://www.coderzai.xyz",
		siteName: "BuildrHQ",
		title: "BuildrHQ - The Engineering Intelligence Platform for Computer Science Students",
		description: "The Engineering Intelligence Platform for Computer Science Students",
		images: [
			{
				url: "/mainlogo.jpeg",
				width: 1024,
				height: 1024,
				alt: "BuildrHQ - The Engineering Intelligence Platform for Computer Science Students",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "BuildrHQ - The Engineering Intelligence Platform for Computer Science Students",
		description: "The Engineering Intelligence Platform for Computer Science Students",
		images: ["/mainlogo.jpeg"],
		creator: "@buildrhq",
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

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}