export async function sendOrderSms(params: { to: string; message: string }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.info("[twilio] skipped (no credentials)", params.to);
    return { skipped: true as const };
  }
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({ To: params.to, From: from, Body: params.message });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const t = await res.text();
      console.warn("[twilio]", res.status, t);
  }
  return { ok: true as const };
}

export async function sendWhatsAppStub(params: { to: string; body: string }) {
  console.info("[whatsapp stub]", params.to, params.body);
}
