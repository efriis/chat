"use client";

import { createClient } from "@supabase/supabase-js";
import { ChatCompletionResponseMessage } from "openai";
import { useState } from "react";

export const supabase = createClient(
  "https://iezsgbmknwbyqxorwwee.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllenNnYm1rbndieXF4b3J3d2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzU0NjEyODYsImV4cCI6MTk5MTAzNzI4Nn0.I0zs8yJ3EzAt-WXQMRbDTeIaTg9LzepozvL-ukvZc9s"
);
// A tailwind react component that renders a chat input
const ChatInput = ({
  sendMessage,
  disabled,
}: {
  sendMessage: (message: string) => void;
  disabled: boolean;
}) => {
  const [message, setMessage] = useState("");
  return (
    <div className="flex items-center justify-center h-20">
      <input
        className="w-3/4 h-10 px-2 border-2 border-gray-300 rounded-md"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        className="w-1/4 h-10 px-2 text-white bg-blue-500 rounded-md"
        onClick={() => sendMessage(message)}
        disabled={disabled}
      >
        Send
      </button>
    </div>
  );
};

// a tailwind react component that renders a chat message
const ChatMessage = ({ from, message }: { from: string; message: string }) => {
  return (
    <div className="flex flex-grow items-center justify-start w-full h-20">
      <div className="w-20 grow-0 h-10 px-2 text-white bg-blue-500 rounded-md">
        {from}
      </div>
      <div className="grow h-10 px-2 border-2 border-gray-300 rounded-md">
        {message}
      </div>
    </div>
  );
};

type Message = ChatCompletionResponseMessage;

function useChat(
  initMessages: Message[] = [
    { role: "system", content: "You are a helpful AI Assistant." },
  ]
) {
  const [disabled, setDisabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initMessages);

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
        }),
      });
      const reader = response.body?.getReader();
      let newMessage = "";
      for (
        let { value, done } = await reader?.read();
        !done;
        { value, done } = await reader?.read()
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
      console.log("done");
      // const openaiResponse = await response.json();
      // const newMessage = openaiResponse.choices[0].message as Message;
      // setMessages([...newMessages, newMessage]);
      setDisabled(false);
    },
  };
}

// A tailwind react component that renders a chat
const Chat = () => {
  const { messages, sendMessage, disabled } = useChat();

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full">
      <div className="w-full grow">
        {messages.map((m, i) => (
          <ChatMessage key={i} from={m.role} message={m.content} />
        ))}
      </div>
      <div className="w-full grow-0 h-20">
        <ChatInput sendMessage={sendMessage} disabled={disabled} />
      </div>
    </div>
  );
};

export default Chat;
