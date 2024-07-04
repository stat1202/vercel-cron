import similarity from "similarity";
import { createClient } from "./supabase/server";
import nlp from "compromise";

export const updateCosineSimilarity = async () => {
  const supabase = createClient();
  const { data: newsList } = await supabase
    .from("news")
    .select("news_id, content_en");
  const length = newsList!.length;
  let cnt = 1;

  if (newsList) {
    for (const target of newsList) {
      console.log(`cosine similarity : ${cnt} / ${length}`);
      const similarities = [];
      for (const compare of newsList) {
        if (target.news_id !== compare.news_id) {
          const s = similarity(target.content_en, compare.content_en);
          similarities.push({
            news_id: target.news_id,
            related_news_id: compare.news_id,
            similarity: s,
          });
        }
      }

      similarities.sort((a, b) => b.similarity - a.similarity);

      const { error } = await supabase
        .from("news_to_news_similarity")
        .upsert(similarities.slice(0, 3));

      cnt += 1;

      if (error) {
        console.error("Database Error : ", error);
      }
    }
  } else {
    console.error("updateCosineSimilarity ocurred Error. newsList is empty.");
  }
};

export const updateRelatedStock = async () => {
  const supabase = createClient();
  const { data: newsList } = await supabase
    .from("news")
    .select("news_id, content_en");

  let i = 0;
  const { data: stock } = await supabase.from("stock").select("stock_id, name");

  if (newsList) {
    for (const news of newsList) {
      console.log(`related stock : ${i} / ${newsList!.length}`);
      const text = news.content_en;
      const doc = nlp(text);
      const terms = new Set(doc.terms().out("array"));

      const filteredStock = stock!
        .filter((s) => terms.has(s.name))
        .map((s) => ({ stock_id: s.stock_id, news_id: news.news_id }));

      const { error } = await supabase
        .from("related_stock_to_news")
        .upsert(filteredStock);

      i += 1;

      if (error) {
        console.error("Database Error : ", error);
      }
    }
  } else {
    console.error("updateRelatedStock ocurred Error. newsList is empty");
  }
};
