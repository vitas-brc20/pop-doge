import { NextResponse } from 'next/server';

export async function middleware(request) {
  let country = request.geo?.country; // Try Vercel's geo first
  console.log("Vercel Geo Data:", request.geo);

  // If Vercel's geo is not available, use a fallback API
  if (!country) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '1.1.1.1';
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
      if (response.ok) {
        const data = await response.json();
        country = data.countryCode;
      }
    } catch (error) {
      console.error('Error fetching geo data from ip-api:', error);
    }
  }

  // Set the final country code, defaulting to 'US' if all else fails
  const finalCountry = country || 'US';
  
  console.log("Determined Country:", finalCountry);

  const response = NextResponse.next();
  response.cookies.set('country-code', finalCountry);
  return response;
}

export const config = {
  matcher: '/',
};
