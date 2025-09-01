import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startOfDay, addDays, format } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { sendMail } from "@/lib/mailer";

const TZ = process.env.TZ_BACKEND || "America/Sao_Paulo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const nowBrt = utcToZonedTime(now, TZ);
  const startBrt = startOfDay(nowBrt);
  const endBrt = addDays(startBrt, 1);

  const startUtc = zonedTimeToUtc(startBrt, TZ);
  const endUtc = zonedTimeToUtc(endBrt, TZ);

  const due = await prisma.appointment.findMany({
    where: {
      maintenanceDueAt: { gte: startUtc, lt: endUtc },
      NOT: { status: "DONE" },
    },
    include: { client: true },
    orderBy: { maintenanceDueAt: "asc" },
  });

  if (!due.length) {
    console.log("[CRON] sem manutenções hoje");
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const itemsHtml = due.map(a => {
    const when = utcToZonedTime(a.maintenanceDueAt, TZ);
    const whenStr = format(when, "dd/MM/yyyy (EEEE)");
    return `<li><b>${a.client.name}</b> — ${a.client.phoneE164} • ${a.service} • Devido: <b>${whenStr}</b></li>`;
  }).join("");

  await sendMail({
    to: process.env.ALERT_TARGET_EMAIL || "profissional@exemplo.com",
    subject: "Lembrete: Manutenções (20 dias) — hoje",
    html: `<h3>Manutenções de hoje</h3><ul>${itemsHtml}</ul>`,
  });

  await prisma.appointment.updateMany({
    where: { id: { in: due.map(d => d.id) } },
    data: { status: "REMINDER_SENT" },
  });

  return NextResponse.json({ ok: true, sent: due.length });
}
