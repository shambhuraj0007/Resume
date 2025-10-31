import { NextResponse, type NextRequest } from "next/server";
import puppeteer, { type Browser } from "puppeteer";
import puppeteerCore, { type Browser as BrowserCore } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (!searchParams.toString()) {
    return NextResponse.json(
      { message: "No query parameters provided" },
      { status: 400 }
    );
  }

  try {
    let browser: Browser | BrowserCore;

    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
      const executablePath = await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
      );

      console.log("[DEBUG] Launching PuppeteerCore in production");
      console.log("[DEBUG] Executable path:", executablePath);

      browser = await puppeteerCore.launch({
        executablePath,
        args: chromium.args,
        headless: true, // ✅ fix
        defaultViewport: chromium.defaultViewport,
      });
    } else {
      console.log("[DEBUG] Launching Puppeteer in dev mode");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();

    // ✅ Build base URL correctly
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8888");

    const url = new URL(`${baseUrl}/resume/download`);
    url.search = searchParams.toString();

    console.log("[DEBUG] Navigating to:", url.toString());

    await page.goto(url.toString(), { waitUntil: "networkidle0" });

    // ✅ Wait for resume content
    await page.waitForSelector("#resume-content", {
      visible: true,
      timeout: 30000,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "10px",
        bottom: "20px",
        left: "10px",
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume.pdf`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { message: "Error generating PDF", error: String(error) },
      { status: 500 }
    );
  }
}
