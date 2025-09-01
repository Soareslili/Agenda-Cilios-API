import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { addDays } from "date-fns";
import { normalizeBRPhoneToE164 } from "@/lib/whatsapp";

/** GET /api/appointments?page=1&perPage=20 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const perPage = Math.min(Number(searchParams.get("perPage") || 20), 100);

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      include: { client: true },
      orderBy: { startsAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.appointment.count(),
  ]);

  return NextResponse.json({ ok: true, page, perPage, total, items });
}

// Validação com Zod para o POST
const BodySchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  service: z.string().min(2),
  startsAt: z.string(),
});

/** POST /api/appointments */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = BodySchema.parse(body);

    const phoneE164 = normalizeBRPhoneToE164(data.phone);
    const starts = new Date(data.startsAt);
    if (Number.isNaN(starts.getTime())) throw new Error("startsAt inválido");

    const maintenanceDueAt = addDays(starts, 20);

    const client = await prisma.client.upsert({
      where: { phoneE164 },
      update: { name: data.name, email: data.email || undefined },
      create: { name: data.name, phoneE164, email: data.email || undefined },
    });

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        service: data.service,
        startsAt: starts,
        maintenanceDueAt,
      },
    });

    return NextResponse.json({ ok: true, appointment });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
