import { crawlNewsLinks } from "@/utils/crawl";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const targetUrl = "https://finance.yahoo.com/topic/tech/";
  const data = await crawlNewsLinks(targetUrl);
  return NextResponse.redirect(
    `${process.env.API_URL}/api/test/news/0?data=${encodeURIComponent(
      JSON.stringify(data)
    )}`
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
