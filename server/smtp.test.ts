import { describe, it, expect } from "vitest";
import nodemailer from "nodemailer";

describe("SMTP Zoho Mail Configuration", () => {
  it("should have SMTP environment variables configured", () => {
    expect(process.env.SMTP_HOST).toBe("smtp.zoho.com");
    expect(process.env.SMTP_PORT).toBe("465");
    expect(process.env.SMTP_USER).toBe("resultados@valtor.com.br");
    expect(process.env.SMTP_FROM).toBe("resultados@valtor.com.br");
    expect(process.env.SMTP_PASS).toBeTruthy();
    expect(process.env.SMTP_PASS!.length).toBeGreaterThan(0);
  });

  it("should create a valid SMTP transporter and verify connection", async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // verify() checks the SMTP connection and authentication
    const result = await transporter.verify();
    expect(result).toBe(true);
  }, 15000);
});
