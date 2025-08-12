import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    // Nếu đang ở trang login thì cho phép qua luôn
    if (url.pathname === '/login') {
        return NextResponse.next();
    }

    // Lấy accessToken từ cookie
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/',
};
