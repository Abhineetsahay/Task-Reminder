import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function getUserIdFromAuth(payload: { userId: string } | null) {
    if (!payload) return null;
    const userId = Number(payload.userId);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return userId;
}

function getTaskId(value: string) {
    const taskId = Number(value);
    if (!Number.isInteger(taskId) || taskId <= 0) return null;
    return taskId;
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const payload = await getCurrentUser();
        const userId = getUserIdFromAuth(payload);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const taskId = getTaskId(id);

        if (!taskId) {
            return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
        }

        const { status }: { status?: boolean } = await req.json();

        if (typeof status !== "boolean") {
            return NextResponse.json(
                { error: "Status must be true or false." },
                { status: 400 },
            );
        }

        const existing = await prisma.task.findFirst({
            where: { id: taskId, userId },
            select: { id: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const task = await prisma.task.update({
            where: { id: taskId },
            data: { status },
        });

        return NextResponse.json({ task });
    } catch (error) {
        console.error("Update task error:", error);
        return NextResponse.json(
            { error: "Unable to update task right now." },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const payload = await getCurrentUser();
        const userId = getUserIdFromAuth(payload);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const taskId = getTaskId(id);

        if (!taskId) {
            return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
        }

        const existing = await prisma.task.findFirst({
            where: { id: taskId, userId },
            select: { id: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        await prisma.task.delete({ where: { id: taskId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete task error:", error);
        return NextResponse.json(
            { error: "Unable to delete task right now." },
            { status: 500 },
        );
    }
}
