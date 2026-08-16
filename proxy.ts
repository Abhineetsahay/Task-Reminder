import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (token) {
        const payload = verifyToken(token);

        if (
            payload &&
            (
                request.nextUrl.pathname === "/" ||
                request.nextUrl.pathname === "/login" ||
                request.nextUrl.pathname === "/signin"
            )
        ) {
            return NextResponse.redirect(
                new URL("/tasks", request.url)
            );
        }
    }

    return NextResponse.next();
}