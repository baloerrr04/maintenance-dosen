import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value || req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        console.log("Token tidak ditemukan, redirect ke /login");
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const { payload } = await jwtVerify(token, secretKey);

        console.log("✅ Token Valid! Decoded:", payload);

        return NextResponse.next();
    } catch (error) {
        console.log("Token Invalid:", error);
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/admin/:path*",
    ],
};
