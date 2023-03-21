import obsgenClient from "@/lib/obsgen";
import openai from "@/lib/openai";

export async function POST(req: Request) {
  const reqBody = await req.json();
  const messages = reqBody.messages;
  const model = reqBody.model || "gpt-3.5-turbo";

  // async log inbound event
  const obsgenPromise = obsgenClient.logEvent({
    messages: JSON.stringify(messages),
    model,
    type: "chat-received",
  });

  // async call to OpenAI
  const openaiPromise = openai.createChatCompletion(
    {
      model,
      messages,
      stream: true,
    },
    { responseType: "stream" }
  );

  const [_, openaiResp] = await Promise.all([obsgenPromise, openaiPromise]);

  const stream = new ReadableStream({
    type: "bytes",
    start(controller) {
      const data = openaiResp.data as unknown as {
        on: (event: string, cb: (chunk: Uint8Array) => void) => void;
      };
      data.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      data.on("end", () => {
        controller.close();
      });
    },
  });

  let accumulator = "";

  const outStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const strVal = new TextDecoder("utf-8").decode(chunk);
      const vals = strVal.split("\n\n");
      for (const val of vals) {
        if (!val.startsWith("data: ")) {
          continue;
        }
        const sliced = val.slice(5).trim();
        try {
          const packet = JSON.parse(sliced);
          const content = packet.choices[0].delta.content || "";
          accumulator += content;
        } catch (e) {
          console.log({ val, e });
        }
      }

      controller.enqueue(chunk);
    },
    flush(controller) {
      obsgenClient.logEvent({
        messages: accumulator,
        type: "chat-sent",
        model,
      });
    },
  });

  stream.pipeThrough(outStream);

  return new Response(outStream.readable);
}
