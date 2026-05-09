export async function mailchimpSubscribe(email: string) {
  const key = process.env.MAILCHIMP_API_KEY;
  const audience = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!key || !audience) {
    console.info("[mailchimp] skipped — no MAILCHIMP_API_KEY or AUDIENCE_ID");
    return { skipped: true as const };
  }
  const dc = key.split("-")[1];
  if (!dc) return { error: "Invalid Mailchimp key" as const };
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audience}/members`;
  const auth = Buffer.from(`anystring:${key}`).toString("base64");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: email,
      status: "subscribed",
    }),
  });
  if (!res.ok && res.status !== 400) {
    const t = await res.text();
    console.warn("[mailchimp]", res.status, t);
  }
  return { ok: true as const };
}
