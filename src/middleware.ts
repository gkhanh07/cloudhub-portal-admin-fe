import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    // Cho phép các route public
    if (url.pathname === '/login' || url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
        return NextResponse.next();
    }
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)',]
};