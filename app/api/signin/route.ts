import { signToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export interface SignInData {
    username: string,
    email: string,
    password: string
}

export async function POST(req: NextRequest) {
    try {
        const { email, username, password }: SignInData = await req.json();

        if (!email || !username || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 },
            );
        }

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Email or username already taken" },
                { status: 409 },
            );
        }

        const new_Password = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { email, username, password: new_Password },
        });

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
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "An error occurred during signup. Please try again." },
            { status: 500 },
        );
    }
}