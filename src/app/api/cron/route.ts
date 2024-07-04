import { updateCosineSimilarity, updateRelatedStock } from "@/utils/compare";
import { crawlNewsDetail, crawlNewsLinks, getHTML } from "@/utils/crawl";
import { summarizeNews } from "@/utils/summary";
import { createClient } from "@/utils/supabase/server";
import { translate } from "@/utils/translate";
export async function GET(requset: Request) {
  /*
  ----- 크롤링한 뉴스 db에 저장 작업 시작
  */
  const targetUrl = "https://finance.yahoo.com/topic/tech/";
  const newsLinks = (await crawlNewsLinks(targetUrl)) as string[];
  const newsList = [];
  // // db에 있는 최신 뉴스 호출
  const supabase = createClient();
  const { data: latestNews, error: selectLatestNewsError } = await supabase
    .from("news")
    .select("origin_url")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (selectLatestNewsError) {
    console.error("최신 뉴스를 가져오는데 실패했습니다.");
  } else {
    // 중복 뉴스 제거
    const duplicateIndex = newsLinks.indexOf(latestNews?.origin_url);

    // 상세 경로 배열 for 반복
    for (const url of newsLinks.slice(0, duplicateIndex)) {
      // 뉴스 상세 HTML 문서 받아오기
      const html = (await getHTML(url)) as string;

      // 뉴스 상세 크롤링
      let initNewsData = crawlNewsDetail(html);

      // 요약
      const summary_en = await summarizeNews(initNewsData.content_en);

      // 번역
      const translateNews = translate(
        initNewsData.title_en,
        initNewsData.content_en,
        summary_en
      );
      const news = {
        ...initNewsData,
        summary_en,
        ...translateNews,
      };
      newsList.push(news);
    }

    // 뉴스 db에 Insert
    const { error: insertNewsListError } = await supabase
      .from("news")
      .insert(newsList);
    /*
    ----- 크롤링한 뉴스 db에 저장 완료
    */

    if (insertNewsListError) {
      console.error("뉴스 목록 삽입에 실패했습니다.");
    } else {
      // 코사인 유사도 업데이트
      updateCosineSimilarity();

      // 뉴스와 관련된 주식 업데이트
      updateRelatedStock();
    }
  }

  return Response.json({ message: "ok" });
}
