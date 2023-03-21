import obsgenClient from "@/lib/obsgen";
import openai from "@/lib/openai";

export async function POST(req: Request) {
  const reqBody = await req.json();
  const messages = reqBody.messages;
  const model = reqBody.model || "gpt-3.5-turbo";

  const obsgenPromise = obsgenClient.logEvent({
    messages: JSON.stringify(messages),
    model,
    type: "chat-sent",
  });

  const openaiPromise = openai.createChatCompletion(
    {
      model,
      messages,
      stream: true,
    },
    { responseType: "stream" }
  );

  const [_, openaiResp] = await Promise.all([obsgenPromise, openaiPromise]);

  const stream = openaiResp.data as unknown as ReadableStream;

  return new Response(stream);
}
