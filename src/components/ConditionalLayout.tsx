'use client'
import { usePathname } from 'next/navigation';
import MenuComponent from './MenuComponent';

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
    const pathname = usePathname();

    // Don't show sidebar for login page
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <MenuComponent />
            </aside>
            <main className="content">
                {children}
            </main>
        </div>
    );
};

export default ConditionalLayout;
