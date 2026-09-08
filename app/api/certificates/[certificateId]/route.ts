import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const certificates = await getStore("certificates");
  const certificate = certificates.find((item) => item.id === certificateId);
  if (!certificate) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });

  const users = await getStore("users");
  const courses = await getStore("courses");
  const user = users.find((item) => item.id === certificate.userId);
  const course = courses.find((item) => item.id === certificate.courseId);
  if (!user || !course) return NextResponse.json({ error: "Certificate data incomplete." }, { status: 404 });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" viewBox="0 0 1400 1000">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#ecfdf5"/>
      </linearGradient>
    </defs>
    <rect width="1400" height="1000" fill="url(#g)"/>
    <rect x="70" y="70" width="1260" height="860" rx="40" fill="#fff" stroke="#d1fae5" stroke-width="4"/>
    <text x="700" y="180" text-anchor="middle" font-family="Arial" font-size="42" fill="#166534" font-weight="700">Subhan Academy</text>
    <text x="700" y="255" text-anchor="middle" font-family="Arial" font-size="28" fill="#0f172a">Certificate of Completion</text>
    <text x="700" y="365" text-anchor="middle" font-family="Arial" font-size="24" fill="#475569">This certifies that</text>
    <text x="700" y="445" text-anchor="middle" font-family="Arial" font-size="52" fill="#020617" font-weight="700">${user.name}</text>
    <text x="700" y="520" text-anchor="middle" font-family="Arial" font-size="24" fill="#475569">has successfully completed</text>
    <text x="700" y="595" text-anchor="middle" font-family="Arial" font-size="38" fill="#166534" font-weight="700">${course.title}</text>
    <text x="180" y="770" font-family="Arial" font-size="22" fill="#475569">Certificate ID</text>
    <text x="180" y="805" font-family="Arial" font-size="24" fill="#020617" font-weight="700">${certificate.certificateNumber}</text>
    <text x="650" y="770" font-family="Arial" font-size="22" fill="#475569">Issued</text>
    <text x="650" y="805" font-family="Arial" font-size="24" fill="#020617" font-weight="700">${new Date(certificate.issuedAt).toLocaleDateString("en-IN")}</text>
    <text x="1080" y="770" font-family="Arial" font-size="22" fill="#475569">Status</text>
    <text x="1080" y="805" font-family="Arial" font-size="24" fill="#020617" font-weight="700">Verified Completion</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="certificate-${certificate.certificateNumber}.svg"`
    }
  });
}
