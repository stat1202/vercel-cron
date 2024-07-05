import { crawlNewsDetail, crawlNewsLinks, getHTML } from "@/utils/crawl";
import { translate } from "@/utils/translate";

export async function GET() {
  const targetUrl = "https://finance.yahoo.com/topic/tech/";
  // const data = await crawlNewsLinks(targetUrl);
  return Response.json("ok");
}
