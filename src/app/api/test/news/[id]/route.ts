import { crawlNewsDetail, getHTML } from "@/utils/crawl";
import { summarizeNews } from "@/utils/summary";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const searchParams = request.nextUrl.searchParams;
  const newsList: string[] = JSON.parse(searchParams.get("data") as string);
  const length = newsList.length;

  if (id < length) {
    const supabase = createClient();

    const { error: startError } = await supabase
      .from("cron-test")
      .insert({ text: `news-${id} 시작` });

    const html = (await getHTML(newsList[id])) as string;
    const initNewsData = crawlNewsDetail(html);
    const summary_en = await summarizeNews(initNewsData.content_en);

    const news = { ...initNewsData, summary_en, origin_url: newsList[id] };

    const { error: endError } = await supabase
      .from("cron-test")
      .insert({ text: `news-${id} 종료` });
    const { error: insertNewsListError } = await supabase
      .from("news")
      .insert(news);
    return Response.redirect(
      `${process.env.API_URL}/api/test/news/${id + 1}?data=${JSON.stringify(
        newsList
      )}`
    );
  }
  return Response.json({ message: "crawl complete." });
}
export const dynamic = "force-dynamic";
export const maxDuration = 60;
