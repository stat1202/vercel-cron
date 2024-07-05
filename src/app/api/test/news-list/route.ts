import { crawlNewsLinks } from "@/utils/crawl";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const { error: startError } = await supabase
    .from("cron-test")
    .insert({ text: "news-list 시작" });

  const targetUrl = "https://finance.yahoo.com/topic/tech/";
  const data = await crawlNewsLinks(targetUrl);

  const { error: endError } = await supabase
    .from("cron-test")
    .insert({ text: "news-list 종료" });

  return NextResponse.redirect(
    `${process.env.API_URL}/api/test/news/0?data=${encodeURIComponent(
      JSON.stringify(data)
    )}`
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
