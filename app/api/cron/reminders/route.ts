import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
    try {
        // Protect the cron endpoint
        const authHeader = request.headers.get("authorization");

        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const now = new Date();

        // Tasks coming within the next 1 hour
        const oneHourFromNow = new Date(
            now.getTime() + 60 * 60 * 1000
        );

        const tasks = await prisma.task.findMany({
            where: {
                endTime: {
                    gt: now,
                    lte: oneHourFromNow,
                },
                status: false,
            },
            include: {
                user: true,
            },
            orderBy: {
                endTime: "asc",
            },
        });

        if (tasks.length === 0) {
            return NextResponse.json({
                message: "No tasks coming in the next hour",
            });
        }

        // Group tasks by user
        const tasksByUser = new Map<number, typeof tasks>();

        for (const task of tasks) {
            if (!task.user) continue;

            if (!tasksByUser.has(task.user.id)) {
                tasksByUser.set(task.user.id, []);
            }

            tasksByUser.get(task.user.id)!.push(task);
        }

        const emailResults = [];

        // Send one email to each user
        for (const [userId, userTasks] of tasksByUser) {
            const user = userTasks[0].user;

            if (!user?.email) continue;

            const taskList = userTasks
                .map((task) => {
                    return `
            <li>
              <strong>${task.taskName}</strong>
              <br />
              Due: ${new Date(task.endTime).toLocaleString("en-IN")}
            </li>
          `;
                })
                .join("");

            const result = await resend.emails.send({
                from: "Task Reminder <onboarding@resend.dev>",
                to: user.email,
                subject: "Tasks coming up in the next hour",
                html: `
          <h2>Hello ${user.username},</h2>

          <p>
            You have the following tasks coming up in the next hour:
          </p>

          <ul>
            ${taskList}
          </ul>

          <p>
            Make sure you complete them on time.
          </p>
        `,
            });

            emailResults.push({
                userId,
                email: user.email,
                result,
            });
        }

        return NextResponse.json({
            success: true,
            usersNotified: emailResults.length,
            tasksFound: tasks.length,
        });
    } catch (error) {
        console.error("Cron error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to process reminders",
            },
            { status: 500 }
        );
    }
}