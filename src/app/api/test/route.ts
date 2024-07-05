import { crawlNewsDetail, crawlNewsLinks, getHTML } from "@/utils/crawl";
import { translate } from "@/utils/translate";
import { NextResponse } from "next/server";

export async function GET() {
  const targetUrl = "https://finance.yahoo.com/topic/tech/";
  const data = await crawlNewsLinks(targetUrl);
  return NextResponse.json(data);
}
export const dynamic = "force-dynamic";
