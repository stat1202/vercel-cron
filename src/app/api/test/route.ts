import { crawlNewsDetail, crawlNewsLinks, getHTML } from "@/utils/crawl";
import { translate } from "@/utils/translate";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return Response.redirect("http://localhost:3000/api/test/news-list");
}
export const dynamic = "force-dynamic";
export const maxDuration = 60;
