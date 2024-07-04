import { load } from "cheerio";
import puppeteer from "puppeteer";

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
  const title_en = $("h1#cass-lead-header-undefined").text();
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

export const crawlNewsLinks = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

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
    console.error("Crawl NewsLink Failed : ", error);
  } finally {
    await browser.close();
  }
};
