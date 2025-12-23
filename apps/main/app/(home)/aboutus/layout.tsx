import Navbar from '@/components/landingpage/homepagenavbar';
import Footer from '@/components/landingpage/footer';

interface LayoutProps {
    children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {

    return (
        <div className="flex flex-col bg-gray-50 dark:bg-black">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
};

export default Layout;