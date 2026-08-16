import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET!;

export function signToken(userId: number) {
    return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET) as { userId: string };
    } catch {
        return null;
    }
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;


    if (!token) return null;
    return verifyToken(token);
}