import { NextResponse, type NextRequest } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (!searchParams.toString()) {
    console.error("[DEBUG] No query params provided");
    return NextResponse.json(
      { message: "No query parameters provided" },
      { status: 400 }
    );
  }

  let browser;
  try {
    console.log("[DEBUG] VERCEL_ENV =", process.env.VERCEL_ENV);
    console.log("[DEBUG] NODE_ENV =", process.env.NODE_ENV);

    if (process.env.VERCEL_ENV === "production") {
      console.log("[DEBUG] Launching Chromium in production...");

      const executablePath = await chromium.executablePath();
      console.log("[DEBUG] Chromium executablePath =", executablePath);

      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true,

      });

      if (!browser) {
        throw new Error("Browser failed to launch in production.");
      }
    } else {
      console.log("[DEBUG] Launching Chromium in local dev...");
      const localPath =
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

      browser = await puppeteer.launch({
        executablePath: localPath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      if (!browser) {
        throw new Error("Browser failed to launch locally.");
      }
    }

    console.log("[DEBUG] Browser launched successfully");

    const page = await browser.newPage();
    console.log("[DEBUG] New page created");

    const baseUrl = process.env.NEXT_PUBLIC_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_URL is not defined");
    }
    console.log("[DEBUG] NEXT_PUBLIC_URL =", baseUrl);

    const url = new URL(`${baseUrl}/resume/download`);
    url.search = searchParams.toString();

    console.log("[DEBUG] Navigating to:", url.toString());

    await page.goto(url.toString(), {
      waitUntil: "networkidle0",
      timeout: 120000,
    });
    console.log("[DEBUG] Page navigation complete");

    await page.waitForSelector("#resume-content", {
      visible: true,
      timeout: 60000,
    });
    console.log("[DEBUG] #resume-content found on page");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "10px", bottom: "20px", left: "10px" },
    });

    if (!pdfBuffer || !(pdfBuffer instanceof Buffer)) {
      throw new Error("PDF generation failed: buffer is invalid");
    }
    console.log("[DEBUG] PDF buffer generated, size =", pdfBuffer.length);

    await browser.close();
    console.log("[DEBUG] Browser closed successfully");

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (error: any) {
    console.error("[ERROR] PDF generation failed:", error);
    if (browser) {
      try {
        await browser.close();
        console.log("[DEBUG] Browser closed after error");
      } catch (closeErr) {
        console.error("[ERROR] Failed to close browser after error:", closeErr);
      }
    }

    return NextResponse.json(
      {
        message: "Error generating PDF",
        error: error?.message || "Unknown error",
        stack: error?.stack || null,
      },
      { status: 500 }
    );
  }
}
