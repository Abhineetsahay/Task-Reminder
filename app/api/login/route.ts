import { signToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export interface LoginInData {
    username?: string,
    email?: string,
    identifier?: string,
    password: string
}

export async function POST(req: NextRequest) {
    try {
        const { email, username, identifier, password }: LoginInData = await req.json();
        const loginValue = (identifier ?? email ?? username ?? "").trim();

        if (!loginValue || !password) {
            return NextResponse.json(
                { error: "Email or username and password are required" },
                { status: 400 },
            );
        }

        const isEmail = loginValue.includes("@");

        const user = await prisma.user.findFirst({
            where: isEmail
                ? { email: loginValue }
                : { username: loginValue },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            )
        }
        const token = signToken(user.id);

        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "An error occurred during login. Please try again." },
            { status: 500 },
        );
    }
}