
type MailPayload = { to: string; subject: string; html: string; from?: string };

export async function sendMail({ to, subject, html, from }: MailPayload) {
    const sender = from || process.env. ALERT_SENDER_EMAIL || 'cilios@example.com';
    
    
    if (process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({from: sender, to, subject, html});
        return;
    }



}