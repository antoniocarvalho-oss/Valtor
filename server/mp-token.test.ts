import { describe, it, expect } from "vitest";

describe("Mercado Pago production token", () => {
  it("MP_ACCESS_TOKEN is set and starts with APP_USR (production)", () => {
    const token = process.env.MP_ACCESS_TOKEN ?? "";
    expect(token).toBeTruthy();
    expect(token.startsWith("APP_USR-")).toBe(true);
  });

  it("can reach Mercado Pago API with production token", async () => {
    const token = process.env.MP_ACCESS_TOKEN ?? "";
    // Simple API call to validate the token works
    const res = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
