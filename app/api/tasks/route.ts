import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface CreateTaskData {
    taskName?: string;
    taskDescription?: string;
    endTime?: string;
}

function getUserIdFromAuth(payload: { userId: string } | null) {
    if (!payload) return null;
    const userId = Number(payload.userId);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return userId;
}

export async function GET() {
    try {
        const payload = await getCurrentUser();
        const userId = getUserIdFromAuth(payload);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tasks = await prisma.task.findMany({
            where: { userId },
            orderBy: [{ createdAt: "desc" }],
        });

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error("Get tasks error:", error);
        return NextResponse.json(
            { error: "Unable to fetch tasks right now." },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        
        const payload = await getCurrentUser();
        const userId = getUserIdFromAuth(payload);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { taskName, taskDescription, endTime }: CreateTaskData = await req.json();

        if (!taskName?.trim() || !endTime) {
            return NextResponse.json(
                { error: "Task name and due date are required." },
                { status: 400 },
            );
        }

        const parsedEndTime = new Date(endTime);

        if (Number.isNaN(parsedEndTime.getTime())) {
            return NextResponse.json(
                { error: "Please provide a valid due date." },
                { status: 400 },
            );
        }

        const task = await prisma.task.create({
            data: {
                userId,
                taskName: taskName.trim(),
                taskDescription: taskDescription?.trim() || null,
                endTime: parsedEndTime,
            },
        });

        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        console.error("Create task error:", error);
        return NextResponse.json(
            { error: "Unable to create task right now." },
            { status: 500 },
        );
    }
}
