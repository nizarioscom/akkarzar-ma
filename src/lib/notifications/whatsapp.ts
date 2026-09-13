export type WhatsAppTemplateName =
  | "listing_status_changed"
  | "promoter_decision"
  | "notary_review_ready";

export type WhatsAppMessage = {
  toE164: string;
  template: WhatsAppTemplateName;
  variables: string[];
};

export type WhatsAppDispatchResult = {
  delivered: boolean;
  providerMessageId?: string;
  skippedReason?: string;
};

function getWhatsAppConfig(): { token: string; phoneNumberId: string } | null {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return null;
  }
  return { token, phoneNumberId };
}

export async function sendWhatsAppTemplate(message: WhatsAppMessage): Promise<WhatsAppDispatchResult> {
  const config = getWhatsAppConfig();
  if (!config) {
    return { delivered: false, skippedReason: "whatsapp_not_configured" };
  }

  const response = await fetch(`https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: message.toE164.replace(/^\+/, ""),
      type: "template",
      template: {
        name: message.template,
        language: { code: "fr" },
        components: [
          {
            type: "body",
            parameters: message.variables.map((text) => ({ type: "text", text })),
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    return { delivered: false, skippedReason: "whatsapp_provider_error" };
  }

  const body = (await response.json()) as { messages?: { id?: string }[] };
  return { delivered: true, providerMessageId: body.messages?.[0]?.id };
}

export async function notifyListingStatus(input: {
  phoneE164: string | null;
  listingId: string;
  status: string;
}): Promise<WhatsAppDispatchResult> {
  if (!input.phoneE164) {
    return { delivered: false, skippedReason: "missing_phone" };
  }

  return sendWhatsAppTemplate({
    toE164: input.phoneE164,
    template: "listing_status_changed",
    variables: [input.listingId, input.status],
  });
}
