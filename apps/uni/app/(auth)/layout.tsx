import Footer from "@/components/landingpage/footer";
import Navbar from "@/components/landingpage/navbar";

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