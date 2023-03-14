import openai from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const reqBody = await request.json();
  const messages = reqBody.messages;

  console.log("chat-api", messages);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });

  return NextResponse.json(response.data);
}
