export const getToken = async () => {
  const auth_url = `${process.env.LLAMA_API_URL}/auth/token`;
  const auth_body = {
    username: `${process.env.LLAMA_USER_NAME}`,
    password: `${process.env.LLAMA_PASSWORD}`,
  };

  const response = await fetch(auth_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(auth_body),
  });

  const auth_data = await response.json();

  return auth_data.access_token;
};

export const generateAnswer = async (
  user_message: string,
  temperature: number,
  top_p: number
) => {
  const url = `${process.env.LLAMA_API_URL}/generate`;
  const token = await getToken();

  const generate_body = {
    user_message: `${user_message}`,
    temperature: temperature,
    top_p: top_p,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(generate_body),
    });

    if (response.status !== 200) {
      const errorText = await response.text();
      console.error(`Request Failed : ${errorText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    let answer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      answer += decoder.decode(value, { stream: true });
    }

    answer += decoder.decode();

    return answer;
  } catch (error) {
    console.error("Internal Server Error", error);
  }
};
