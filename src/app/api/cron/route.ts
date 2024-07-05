import { updateCosineSimilarity, updateRelatedStock } from "@/utils/compare";
import { crawlNewsDetail, crawlNewsLinks, getHTML } from "@/utils/crawl";
import { summarizeNews } from "@/utils/summary";
import { createClient } from "@/utils/supabase/server";
import { translate } from "@/utils/translate";
import { NextResponse } from "next/server";
export async function GET(requset: Request) {
  const supabase = createClient();
  const { error } = await supabase
    .from("cron-test")
    .insert({ text: "cron start" });

  setTimeout(async () => {
    await cronJob();
  }, 0);

  return NextResponse.json({ message: "ok" });
}

const cronJob = async () => {
  /*
  ----- 크롤링한 뉴스 db에 저장 작업 시작
  */
  const supabase = createClient();
  const { error: cronJobError } = await supabase
    .from("cron-test")
    .insert({ text: `cronJob 진입.` });
  const targetUrl = "https://finance.yahoo.com/topic/tech/";
  const newsLinks = (await crawlNewsLinks(targetUrl)) as string[];
  // // db에 있는 최신 뉴스 호출

  const { error: crawlLinksError } = await supabase
    .from("cron-test")
    .insert({ text: `뉴스 링크 크롤링 완료.` });
  const newsList = [];

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
    const duplicateIndex =
      newsLinks.indexOf(latestNews?.origin_url) === -1
        ? newsLinks.length
        : newsLinks.indexOf(latestNews?.origin_url);
    let i = 1;
    // 상세 경로 배열 for 반복
    for (const url of newsLinks.slice(0, duplicateIndex)) {
      // 뉴스 상세 HTML 문서 받아오기
      const html = (await getHTML(url)) as string;

      // 뉴스 상세 크롤링
      let initNewsData = crawlNewsDetail(html);

      //로그
      const { error: crawlDetailError } = await supabase
        .from("cron-test")
        .insert({ text: `${i} / ${duplicateIndex} 크롤링 완료.` });

      // 요약
      const summary_en = await summarizeNews(initNewsData.content_en);
      // console.log(initNewsData, summary_en);
      // 로그
      const { error: summaryError } = await supabase
        .from("cron-test")
        .insert({ text: `${i} / ${duplicateIndex} 요약 완료.` });

      // 번역
      const translateNews = await translate(
        initNewsData.title_en,
        initNewsData.content_en,
        summary_en
      );

      // 로그
      const { error: translateError } = await supabase
        .from("cron-test")
        .insert({ text: `${i} / ${duplicateIndex} 번역 완료.` });

      const news = {
        ...initNewsData,
        summary_en,
        ...translateNews,
      };
      // newsList.push(news);
      const { error: insertNewsListError } = await supabase
        .from("news")
        .insert(news);

      if (!insertNewsListError) {
        // 로그
        const { error } = await supabase
          .from("cron-test")
          .insert({ text: `${i} / ${duplicateIndex} 완료.` });
      } else {
        // 로그
        const { error } = await supabase
          .from("cron-test")
          .insert({ text: `${i} / ${duplicateIndex} 실패.` });
      }
      i += 1;
    }

    // 뉴스 db에 한 번에 Insert
    // const { error: insertNewsListError } = await supabase
    //   .from("news")
    //   .insert(newsList);
    /*
    ----- 크롤링한 뉴스 db에 저장 완료
    */
    // 코사인 유사도 업데이트
    updateCosineSimilarity();

    // 뉴스와 관련된 주식 업데이트
    updateRelatedStock();
    // if (insertNewsListError) {
    //   console.error("뉴스 목록 삽입에 실패했습니다.");
    // } else {

    // }
  }
};
export const dynamic = "force-dynamic";
