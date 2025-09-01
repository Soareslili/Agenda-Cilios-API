

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"
import { z } from "zod";

const PatchSchema = z.object({
    status: z.enum(["SCHEDULED","REMINDER_SENT","DONE","CANCELLED"]),
})

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try{
        const body = await req.json()
        const { status} = PatchSchema.parse(body)

        const updated = await prisma.appointment.update({
            where: { id: params.id},
            data: {status},
        });

        return NextResponse.json({ ok: true, appointment: updated})
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message}, { status: 400 })
    }
}