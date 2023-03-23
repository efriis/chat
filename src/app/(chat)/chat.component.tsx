"use client";

import { ChatCompletionResponseMessage } from "openai";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

// A tailwind react component that renders a chat input
const ChatInput = ({
  sendMessage,
  disabled,
}: {
  sendMessage: (message: string) => void;
  disabled: boolean;
}) => {
  const [message, setMessage] = useState("");
  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const newMessage = message;
    setMessage("");
    await sendMessage(newMessage);
  };
  return (
    <form action="#" onSubmit={submit}>
      <div className="flex items-center justify-center h-20">
        <input
          className="w-3/4 h-10 px-2 border-2 border-gray-300 rounded-md"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          name="message"
        />
        <button
          className="w-1/4 h-10 px-2 text-white bg-blue-500 rounded-md"
          onClick={submit}
          type="submit"
          disabled={disabled}
          value="Submit"
        >
          Send
        </button>
      </div>
    </form>
  );
};

// a tailwind react component that renders a chat message
const ChatMessage = ({ role, content }: Message) => {
  return (
    <div className="flex items-center justify-start flex-grow w-full space-x-4 min-h-20">
      <div className="w-20 p-1 text-center text-white bg-blue-500 rounded-md grow-0">
        {role}
      </div>
      <div className="px-2 border-2 border-gray-300 rounded-md grow min-h-20">
        <div className="max-w-full prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

type Message = ChatCompletionResponseMessage;

const DEFAULT_INIT: Message[] = [
  { role: "system", content: "You are a helpful AI Assistant." },
];

function useChat(
  initMessages: Message[] = DEFAULT_INIT,
  model: string = "gpt-3.5-turbo"
) {
  const [disabled, setDisabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initMessages);

  // a static randomly generated session id:
  const uuid = useMemo(() => crypto.randomUUID(), []);

  return {
    messages,
    disabled,
    sendMessage: async (message: string) => {
      if (disabled) return;
      setDisabled(true);
      const newMessages = [
        ...messages,
        { role: "user", content: message } as Message,
      ];
      setMessages(newMessages);
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: newMessages,
          model,
          session: uuid,
        }),
      });
      const reader = response.body?.getReader();
      let newMessage = "";
      for (
        let { value, done } = (await reader?.read()) as any;
        !done;
        { value, done } = (await reader?.read()) as any
      ) {
        // stream message out
        const strVal = new TextDecoder().decode(value);
        const vals = strVal.split("\n\n");
        for (const val of vals) {
          if (!val.startsWith("data: ")) {
            continue;
          }
          const sliced = val.slice(5).trim();
          if (sliced === "[DONE]") continue;
          try {
            const packet = JSON.parse(sliced);
            const newMessagePiece = packet.choices[0].delta.content || "";
            newMessage += newMessagePiece;
            setMessages([
              ...newMessages,
              { role: "assistant", content: newMessage },
            ]);
          } catch (e) {
            console.log({ val, e });
          }
        }
      }
      // const openaiResponse = await response.json();
      // const newMessage = openaiResponse.choices[0].message as Message;
      // setMessages([...newMessages, newMessage]);
      setDisabled(false);
    },
  };
}

import { useSearchParams } from "next/navigation";

// A tailwind react component that renders a chat
const Chat = () => {
  const searchParams = useSearchParams();
  const model = searchParams.get("model") || "gpt-3.5-turbo";

  const { messages, sendMessage, disabled } = useChat(DEFAULT_INIT, model);

  useEffect(() => {
    console.log(JSON.stringify(messages));
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full">
      <div className="w-full p-4 space-y-4 grow lg:p-6">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
      </div>
      <div className="sticky bottom-0 w-full h-20 px-4 border-t border-gray-400 grow-0 backdrop-blur-2xl lg:px-6">
        <ChatInput sendMessage={sendMessage} disabled={disabled} />
      </div>
    </div>
  );
};

export default Chat;
