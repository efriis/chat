import "server-only";

import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import constants from "./constants";

const configuration = new Configuration({
  apiKey: constants.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default openai;

export const createChatCompletion = async (
  messages: ChatCompletionRequestMessage[]
) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });

  return response;
};
