import { NextResponse, type NextRequest } from "next/server";
import puppeteer from "puppeteer";

import puppeteerCore from "puppeteer-core";
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
    let browser: puppeteer.Browser | puppeteerCore.Browser;

    if (process.env.VERCEL_ENV === "production") {
      // ✅ Use chromium-min default executablePath (no URL needed)
      const executablePath = await chromium.executablePath();
      browser = await puppeteerCore.launch({
        executablePath,
        args: chromium.args,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });
    } else {
      console.log("Launching Puppeteer in development mode");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();

    // ✅ Safe fallback for BASE_URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:8888";
const url = new URL(`${baseUrl}/resume/download`);
url.search = searchParams.toString();

    await page.goto(url.toString(), { waitUntil: "networkidle0", timeout: 80000 });

    // ✅ Ensure your /resume/download has this div
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

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume.pdf`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { message: "Error generating PDF", error: error?.message },
      { status: 500 }
    );
  }
}
