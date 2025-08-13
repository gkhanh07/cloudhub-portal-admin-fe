import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    if (url.pathname === '/login') {
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
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
