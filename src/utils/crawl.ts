import { load } from "cheerio";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const getHTML = async (url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status : ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error: any) {
    console.error(`Error fetching URL : ${error.message}`);
    return null;
  }
};

export const crawlNewsDetail = (html: string) => {
  const $ = load(html);
  const title_en = $("div.caas-title-wrapper").text();
  const publisher = $("div.caas-attr-item-author").text();
  const alt = $("img.caas-img").eq(1).attr("alt");
  const thumbnail = alt ? null : $("img.caas-img").eq(1).attr("src");
  const published_at = $("time").attr("datetime");
  const content_arr: string[] = [];

  $("article p").each((_, element) => {
    content_arr.push($(element).text());
  });

  const content_en = content_arr.join("\n");

  return { title_en, publisher, thumbnail, published_at, content_en };
};

// background에서 브라우저를 열어서 내용을 가져오는 함수
export const crawlNewsLinks = async (url: string) => {
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;

  // 크로미움으로 브라우저를 연다.
  const browser = await puppeteer.launch(
    process.env.NODE_ENV === "development"
      ? // 로컬 실행 환경
        {
          headless: true,
          executablePath: process.env.NEXT_LOCAL_CHROME_PATH,
        }
      : // 서버 실행 환경
        {
          args: [
            ...chromium.args,
            "--hide-scrollbars",
            "--disable-web-security",
            "--no-sandbox",
            "--disable-setuid-sandbox",
          ],
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(
            `${process.env.NEXT_PUBLIC_CDN_LINK}`
          ),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        }
  );

  // 페이지 열기
  const page = await browser.newPage();

  // 링크 이동
  await page.goto(url, {
    waitUntil: "networkidle2", // 500ms 동안 두 개 이상의 네트워크 연결이 없을 때 탐색이 완료되는 것으로 간주
  });

  await page.setViewport({ width: 600, height: 13500 });

  //4. HTML 정보 가지고 온다.
  try {
    // 스크롤 동작
    let originalOffset = 0;
    while (true) {
      await page.evaluate("window.scrollBy(0, document.body.scrollHeight)");

      await new Promise((page) => setTimeout(page, 2000));

      let newOffset = (await page.evaluate("window.pageYOffset")) as number;
      console.log("scroll : ", originalOffset, newOffset);
      if (originalOffset === newOffset) {
        break;
      }

      originalOffset = newOffset;
    }

    const newsLinks = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="Mb(5px)"] a');
      return Array.from(elements, (e: any) => e.href);
    });

    return newsLinks;
  } catch (error) {
    throw new Error(`Crawl NewsLink Failed :  ${error}`);
  } finally {
    await browser.close();
  }
};
