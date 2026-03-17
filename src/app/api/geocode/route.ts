// Server-side geocoding to keep API key out of the client bundle
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { lat, lng } = await req.json();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
    // Fallback: return approximate address using a free service
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "User-Agent": "CITYजन/1.0" } }
      );
      const data = await res.json();
      const addr = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      return NextResponse.json({ address: addr });
    } catch {
      return NextResponse.json({
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    }
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await res.json();
    const address =
      data.results?.[0]?.formatted_address ??
      `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  }
}
