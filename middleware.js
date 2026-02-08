import { NextResponse } from 'next/server';

export function middleware(request) {
  // Vercel이 제공하는 geo 객체의 내용을 직접 로깅합니다.
  console.log("Vercel Geo Data:", request.geo);

  const country = request.geo?.country || 'US'; 
  const response = NextResponse.next();
  response.cookies.set('country-code', country);
  return response;
}

export const config = {
  matcher: '/',
};
