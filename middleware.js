import { NextResponse } from 'next/server';

export function middleware(request) {
  const country = request.geo?.country || 'US'; // Default to US if not available

  // Clone the request headers and set a new header `x-country-code`
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-country-code', country);

  // You can also set a cookie if needed, but a header is often sufficient for server components or initial props
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set('country-code', country); // Set a cookie for client-side access
  return response;
}

export const config = {
  matcher: '/', // Apply middleware to all routes
};
