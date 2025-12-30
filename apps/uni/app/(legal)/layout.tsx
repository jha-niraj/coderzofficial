import Footer from "@/components/landingpage/footer";
import Navbar from "@/components/landingpage/navbar";

export default function LegalLayout({
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
