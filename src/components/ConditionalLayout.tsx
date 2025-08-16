'use client'

import { usePathname } from 'next/navigation';
import MenuComponent from './MenuComponent';
import NextTopLoader from 'nextjs-toploader';

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="layout-container">
            {/* Progress bar */}
            <NextTopLoader
                color="black"
                height={3}
                showSpinner={false}
            />

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
