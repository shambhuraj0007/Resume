import { NextResponse, type NextRequest } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs"; // ⬅️ force Node runtime, not Edge

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (!searchParams.toString()) {
    return NextResponse.json(
      { message: "No query parameters provided" },
      { status: 400 }
    );
  }

  let browser;
  try {
    if (process.env.VERCEL_ENV === "production") {
      // Vercel / Serverless
      const executablePath = await chromium.executablePath();

      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true, // always true on serverless
      });
    } else {
      // Local dev (change Chrome path if needed)
      browser = await puppeteer.launch({
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();

    const baseUrl = process.env.NEXT_PUBLIC_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_URL is not defined");

    const url = new URL(`${baseUrl}/resume/download`);
    url.search = searchParams.toString();

    console.log("Navigating to:", url.toString());

    await page.goto(url.toString(), {
      waitUntil: "networkidle0",
      timeout: 120000,
    });

    await page.waitForSelector("#resume-content", {
      visible: true,
      timeout: 60000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "10px", bottom: "20px", left: "10px" },
    });

    await browser.close();

   return new Response(Buffer.from(pdfBuffer), {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=resume.pdf",
  },
});
  } catch (error: any) {
    console.error("PDF generation error:", error);
    if (browser) await browser.close();

    return NextResponse.json(
      { message: "Error generating PDF", error: error?.message },
      { status: 500 }
    );
  }
}
