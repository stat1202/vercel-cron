import { generateAnswer } from "./llama";

export const summarizeNews = async (content_en: string) => {
  // 답변 변수
  const user_message = `${summaryTemplate} ${content_en}`;
  const temperature = 0;
  const top_p = 0;

  // 번역해라 요청
  const answer = (await generateAnswer(
    user_message,
    temperature,
    top_p
  )) as string;
  const answerSplit = answer
    ? answer.split(":")[1]
    : "Please hold on a moment. We're summarizing this news.";
  const summary = removeIncompleteSentences(answerSplit);
  return summary;
};

// 답변 마지막 문장 아니면 제거
const removeIncompleteSentences = (answer: string) => {
  const sentences = answer.match(/[^.!?]*[.!?]/g);

  if (sentences) {
    const completeSentences = sentences!.filter((sentence) =>
      /[.!?]$/.test(sentence)
    );
    return completeSentences.join("");
  }

  return "Please hold on a moment. We're summarizing this news.";
};

// 뉴스 요약 학습 자료
const summaryTemplate = `Follow the answer template. You must end your answer with a complete sentence. Don't answer anything other than the summary.

Question : Summarize the key points from the news in three sentences. Here is the news. Tech giant XYZ Corporation has unveiled its latest AI-powered smartphone, which promises to revolutionize the mobile phone industry. The new device, named the XYZ Pro, features advanced AI capabilities that enhance user experience through personalized suggestions and automation. The smartphone includes a high-resolution camera, extended battery life, and a sleek design. One of the standout features is its ability to learn user habits and optimize performance accordingly. XYZ Corporation's CEO stated that this launch marks a significant milestone in the company's innovation journey. The phone is set to be available for pre-order starting next week.

Answer : XYZ Corporation has launched its new AI-powered smartphone, the XYZ Pro, which features advanced AI capabilities, a high-resolution camera, extended battery life, and a sleek design. The device learns user habits to optimize performance. Pre-orders begin next week.

Question : Summarize the key points from the news in three sentences. Here is the news. `;
