import { crawlNewsDetail, crawlNewsLinks, getHTML } from "@/utils/crawl";
import { translate } from "@/utils/translate";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return Response.redirect(`${process.env.API_URL}/api/test/news-list`);
}
export const dynamic = "force-dynamic";
export const maxDuration = 60;
