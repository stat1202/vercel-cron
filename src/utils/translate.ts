import { Translator } from "deepl-node";

export const translate = async (
  title: string,
  content: string,
  summary: string
) => {
  const authKey = process.env.DEEPL_API_KEY as string;
  const translator = new Translator(authKey);
  const result_fr = await translator.translateText(
    [title, content, summary],
    "en",
    "fr"
  );
  const result_ko = await translator.translateText(
    [title, content, summary],
    "en",
    "ko"
  );
  const result_ja = await translator.translateText(
    [title, content, summary],
    "en",
    "ja"
  );
  const result_zh = await translator.translateText(
    [title, content, summary],
    "en",
    "zh"
  );

  const result = {
    title_fr: result_fr[0].text,
    content_fr: result_fr[1].text,
    summary_fr: result_fr[2].text,
    title_ko: result_ko[0].text,
    content_ko: result_ko[1].text,
    summary_ko: result_ko[2].text,
    title_ja: result_ja[0].text,
    content_ja: result_ja[1].text,
    summary_ja: result_ja[2].text,
    title_zh: result_zh[0].text,
    content_zh: result_zh[1].text,
    summary_zh: result_zh[2].text,
  };
  return result;
};
