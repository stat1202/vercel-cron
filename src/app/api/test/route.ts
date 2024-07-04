import { crawlNewsDetail, getHTML } from "@/utils/crawl";
import { translate } from "@/utils/translate";

export async function GET() {
  const url =
    "https://finance.yahoo.com/news/huawei-exec-rejects-idea-advanced-112724745.html";
  const html = (await getHTML(url)) as string;

  // 뉴스 상세 크롤링
  let initNewsData = crawlNewsDetail(html);
  return Response.json(initNewsData);
}
