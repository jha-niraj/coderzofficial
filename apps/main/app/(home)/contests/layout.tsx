import Navbar from "@/components/landingpage/homepagenavbar";
import Footer from "@/components/landingpage/footer";

interface LayoutProps {
    children: React.ReactNode
}
const Layout = ({ children }: LayoutProps) => {
    return (
        <section>
            <Navbar />
            {
                children
            }
            <Footer />
        </section>
    )
}

export default Layout;