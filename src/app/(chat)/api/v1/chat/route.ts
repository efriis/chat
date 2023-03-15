import openai from "@/lib/openai";

export async function POST(req: Request) {
  const reqBody = await req.json();
  const messages = reqBody.messages;

  const openaiResp = await openai.createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
    },
    { responseType: "stream" }
  );

  return new Response(openaiResp.data as unknown as ReadableStream);
}
