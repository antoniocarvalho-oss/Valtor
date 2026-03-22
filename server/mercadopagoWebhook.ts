import type { Request, Response } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createMPSubscription } from "./db";

const mpAccessToken = process.env.MP_ACCESS_TOKEN ?? "";

export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    const body = req.body ?? {};

    // Mercado Pago sends "type" for v1 webhooks and "action" for v2/notification events
    const eventType = body.type ?? body.action ?? "";
    const data = body.data ?? {};
    const eventId = body.id ?? "";

    console.log(`[MP Webhook] Event received — type: ${eventType}, action: ${body.action}, id: ${eventId}`, data);

    // Handle test/simulation events from Mercado Pago dashboard
    // Test events have live_mode: false or known test IDs like "123456"
    if (body.live_mode === false || eventId === "123456" || data?.id === "123456") {
      console.log("[MP Webhook] Test event detected, returning success");
      return res.status(200).json({ received: true, test: true });
    }

    // Only process payment-related events
    const isPaymentEvent = eventType === "payment" || eventType === "payment.updated" || eventType === "payment.created";
    if (!isPaymentEvent) {
      console.log(`[MP Webhook] Ignoring non-payment event: ${eventType}`);
      return res.status(200).json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.error("[MP Webhook] No payment ID in webhook data");
      return res.status(200).json({ received: true, error: "No payment ID" });
    }

    // Fetch payment details from Mercado Pago API
    let payment;
    try {
      const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
      const paymentApi = new Payment(client);
      payment = await paymentApi.get({ id: paymentId });
    } catch (apiErr) {
      console.error(`[MP Webhook] Failed to fetch payment ${paymentId} from MP API:`, apiErr);
      // Return 200 to avoid MP retrying indefinitely for invalid payment IDs
      return res.status(200).json({ received: true, error: "Payment fetch failed" });
    }

    console.log(`[MP Webhook] Payment ${paymentId} status: ${payment.status}, method: ${payment.payment_method_id}`);

    if (payment.status === "approved") {
      const metadata = payment.metadata ?? {};
      const userId = parseInt(metadata.user_id ?? "0");
      const planType = metadata.plan_type ?? "mensal";

      if (!userId) {
        console.error("[MP Webhook] No user_id in payment metadata");
        return res.status(200).json({ received: true });
      }

      // Calculate expiration based on plan type
      const expiresAt = new Date();
      if (planType === "teste") {
        // Plano de teste: 1 mês de acesso
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (planType === "parcelado" || planType === "avista") {
        // Planos reais: 12 meses de acesso
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      const priceMap: Record<string, string> = {
        avista: "35.80",
        parcelado: "47.80",
        teste: "1.00",
      };

      await createMPSubscription({
        userId,
        planType,
        priceMonthly: priceMap[planType] ?? "47.80",
        mpPaymentId: paymentId.toString(),
        mpPreferenceId: metadata.preference_id ?? "",
        mpPaymentMethod: payment.payment_method_id ?? "",
        expiresAt,
      });

      console.log(`[MP Webhook] Subscription activated for user ${userId} (${planType})`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[MP Webhook] Error processing webhook:", err);
    // Return 200 even on error to prevent MP from retrying indefinitely
    // The error is logged for debugging
    return res.status(200).json({ received: true, error: "Processing error" });
  }
}
