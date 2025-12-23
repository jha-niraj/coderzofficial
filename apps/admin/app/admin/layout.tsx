'use client'

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, Users, Bot, BugPlay, Briefcase, FolderKanban, Code2, 
    CheckSquareIcon, Settings, BarChart3, CreditCard, Globe, Crown, Trophy, 
    Target, Brain, MicVocal, PersonStanding, Building, Gift, Users2
} from 'lucide-react';
import AdminSidebar, { AdminRoute } from './_components/admin-sidebar';
import AdminNavbar from './_components/admin-navbar';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
    children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('adminSidebarCollapsed');
            return saved !== null ? JSON.parse(saved) : false;
        }
        return false;
    });

    const routes: AdminRoute[] = useMemo(() => [
        {
            path: "admin",
            name: "Dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
            status: "active"
        },
        {
            path: "admin/users",
            name: "Users",
            icon: <Users className="h-5 w-5" />,
            status: "active"
        },
        {
            path: "ai",
            name: "AI Tools",
            icon: <Bot className="h-5 w-5" />,
            status: "active",
            isParent: true,
            children: [
                {
                    path: "admin/ai/job-interview",
                    name: "Job Interview Assistant",
                    icon: <Briefcase className="h-4 w-4" />,
                    status: "active"
                },
                {
                    path: "admin/ai/bughunt",
                    name: "Bug Hunt",
                    icon: <BugPlay className="h-4 w-4" />,
                    status: "active"
                }
            ]
        },
        {
            path: "mock",
            name: "Mock Section",
            icon: <MicVocal className="h-5 w-5" />,
            status: "active",
            isParent: true,
            children: [
                {
                    path: "admin/mock/company-wise",
                    name: "Company Wise",
                    icon: <Building className="h-4 w-4" />,
                    status: "active"
                },
                {
                    path: "admin/mock/peer-to-peer",
                    name: "Peer to Peer",
                    icon: <PersonStanding className="h-4 w-4" />,
                    status: "active"
                },
                {
                    path: "admin/mock/general",
                    name: "General Mock",
                    icon: <Target className="h-4 w-4" />,
                    status: "active"
                }
            ]
        },
        {
            path: "projects",
            name: "Projects",
            icon: <FolderKanban className="h-5 w-5" />,
            status: "coming",
            isParent: true,
            children: [
                {
                    path: "admin/projects/free",
                    name: "Free Projects",
                    icon: <Globe className="h-4 w-4" />,
                    status: "coming"
                },
                {
                    path: "admin/projects/paid",
                    name: "Paid Projects",
                    icon: <Crown className="h-4 w-4" />,
                    status: "coming"
                }
            ]
        },
        {
            path: "opensource",
            name: "Open Source",
            icon: <Code2 className="h-5 w-5" />,
            status: "coming",
            isParent: true,
            children: [
                {
                    path: "admin/opensource/free",
                    name: "Free Open Source",
                    icon: <Globe className="h-4 w-4" />,
                    status: "coming"
                },
                {
                    path: "admin/opensource/paid",
                    name: "Paid Open Source",
                    icon: <Crown className="h-4 w-4" />,
                    status: "coming"
                }
            ]
        },
        {
            path: "assessments",
            name: "Assessments",
            icon: <CheckSquareIcon className="h-5 w-5" />,
            status: "coming",
            isParent: true,
            children: [
                {
                    path: "admin/assessments/coding",
                    name: "Coding Assessments",
                    icon: <Code2 className="h-4 w-4" />,
                    status: "coming"
                },
                {
                    path: "admin/assessments/technical",
                    name: "Technical Assessments",
                    icon: <Brain className="h-4 w-4" />,
                    status: "coming"
                }
            ]
        },
        {
            path: "behindthemagic",
            name: "Behind the Magic",
            icon: <Trophy className="h-5 w-5" />,
            status: "active",
            isParent: true,
            children: [
                {
                    path: "admin/behindthemagic/createprojects",
                    name: "Create Projects",
                    icon: <FolderKanban className="h-4 w-4" />,
                    status: "active"
                },
                {
                    path: "admin/behindthemagic/quiz",
                    name: "Quiz Management",
                    icon: <Brain className="h-4 w-4" />,
                    status: "active"
                }
            ]
        },
        {
            path: "dailypractice",
            name: "Daily Practice",
            icon: <Brain className="h-5 w-5" />,
            status: "active",
            isParent: true,
            children: [
                {
                    path: "admin/dailypractice",
                    name: "Manage Leaderboard",
                    icon: <Trophy className="h-4 w-4" />,
                    status: "active"
                }
            ]
        },
        {
            path: "admin/analytics",
            name: "Analytics",
            icon: <BarChart3 className="h-5 w-5" />,
            status: "active"
        },
        {
            path: "admin/credits",
            name: "Credits Management",
            icon: <CreditCard className="h-5 w-5" />,
            status: "active"
        },
        {
            path: "admin/settings",
            name: "Settings",
            icon: <Settings className="h-5 w-5" />,
            status: "active"
        },
        {
            path: "admin/credit-requests",
            name: "Credit Requests",
            icon: <Gift className="h-5 w-5" />,
            status: "active"
        },
        {
            path: "admin/collective",
            name: "Collective",
            icon: <Users2 className="h-5 w-5" />,
            status: "active"
        }
    ], []);

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('adminSidebarCollapsed') === null) {
            const shouldBeCollapsed = window.innerWidth < 1024;
            setIsCollapsed(shouldBeCollapsed);
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        if (typeof window !== 'undefined') {
            localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
        }
    };

    if (status === "loading") {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        redirect('/signin');
    }

    // Add admin role check here
    // if (!session?.user?.role || session.user.role !== 'ADMIN') {
    //     redirect('/dashboard');
    // }

    // if (!session?.user || session.user.role !== 'Admin') {
    //     return <AdminAuthPrompt />
    // }

    return (
        <div className="flex h-screen bg-background">
            <AdminSidebar
                routes={routes}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
            />
            <div className="flex flex-col flex-1">
                <AdminNavbar isCollapsed={isCollapsed} />
                <main className={`backdrop-blur-sm transition-all duration-300 ${isCollapsed ? 'sm:ml-[60px] ml-[0px]' : 'sm:ml-[250px] ml-[0px]'} pt-16`}>
                    <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
        </div>
    );
};

export default AdminLayout;

