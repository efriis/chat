"use client";

import { createClient } from "@supabase/supabase-js";
import { ChatCompletionResponseMessage } from "openai";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

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
    <div className="flex flex-grow space-x-4 items-center justify-start w-full min-h-20">
      <div className="w-20 grow-0 p-1 text-white bg-blue-500 rounded-md text-center">
        {role}
      </div>
      <div className="grow min-h-20 px-2 border-2 border-gray-300 rounded-md">
        <div className="prose max-w-full">
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
const LARGE_INIT: Message[] = [
  { role: "system", content: "You are a helpful AI Assistant." },
  { role: "user", content: "Write a nextjs route" },
  {
    role: "assistant",
    content:
      "Sure! Here's an example of a basic Next.js route:\n\n```\n// pages/about.js\n\nfunction About() {\n  return (\n    <div>\n      <h1>About Page</h1>\n      <p>This is the about page!</p>\n    </div>\n  )\n}\n\nexport default About;\n```\n\nThis code defines a simple Next.js route that renders an About page with a header and paragraph of text.\n\nTo create a new route, simply create a new file under the `/pages` directory with the desired name (e.g. `contact.js`), and define the route's contents as a React component. Remember to export the component using `export default` so that it can be imported and used elsewhere in your application!",
  },
  {
    role: "user",
    content:
      "could you add a login to the middle? and explain the whole thing?",
  },
  {
    role: "assistant",
    content:
      'Sure! Here\'s an example of a Next.js route that includes a login form:\n\n```\n// pages/about.js\n\nimport { useState } from "react";\n\nfunction About() {\n  const [email, setEmail] = useState("");\n  const [password, setPassword] = useState("");\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState("");\n\n  const handleSubmit = async (event) => {\n    event.preventDefault();\n    setLoading(true);\n    setError("");\n\n    try {\n      // Call your login API here and handle the response\n      setLoading(false);\n    } catch (error) {\n      setError("Invalid email or password");\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div>\n      <h1>About Page</h1>\n      <p>This is the about page!</p>\n\n      <form onSubmit={handleSubmit}>\n        <label>\n          Email:\n          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />\n        </label>\n        <br />\n        <label>\n          Password:\n          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />\n        </label>\n        <br />\n        {error && <p>{error}</p>}\n        <button disabled={loading}>Login</button>\n      </form>\n    </div>\n  );\n}\n\nexport default About;\n```\n\nHere\'s a breakdown of what\'s happening in the code:\n\n1. We import the `useState` hook from React, which allows us to manage state in our component.\n\n2. We define four state variables using `useState`:\n\n  - `email`: A string representing the user\'s email address.\n  \n  - `password`: A string representing the user\'s password.\n  \n  - `loading`: A boolean representing whether or not the login form is currently being submitted.\n  \n  - `error`: A string representing any error messages that occur during the login process.\n\n3. We define a function `handleSubmit` that will be called when the user submits the login form. \n\n4. In `handleSubmit`, we prevent the default form submission behavior using `event.preventDefault()`, so that we can handle the form submission ourselves.\n\n5. We set `loading` to `true` to indicate that the form submission is in progress.\n\n6. We clear any previous error messages by setting `error` to an empty string.\n\n7. We try to make a request to our login API (you should replace the comments with your actual login API calls). If the request is successful, we can handle the successful login by navigating to the appropriate page. If the request fails, we set `error` to an appropriate string (in this case, "Invalid email or password").\n\n8. In the `return` statement, we render a basic login form with two input fields for email and password, a submit button, and an error message (if applicable). \n\n9. We use the `disabled` attribute on the submit button to prevent the user from submitting the form while a request is in progress (indicated by the `loading` state variable). \n\nSo overall, this example code shows how to create a Next.js route that includes a basic login form. Obviously, you will need to customize this code to meet your specific requirements, such as adding validation to the email and password fields, integrating with your own authentication system, and so on. But this should give you a good starting point to build from!',
  },
];

function useChat(initMessages: Message[] = LARGE_INIT) {
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
            const newMessagePiece = (
              packet.choices[0].delta.content || ""
            ).replace("e", "i");
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

// A tailwind react component that renders a chat
const Chat = () => {
  const { messages, sendMessage, disabled } = useChat();

  useEffect(() => {
    console.log(JSON.stringify(messages));
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full">
      <div className="w-full grow space-y-4 p-4 lg:p-6">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
      </div>
      <div className="w-full grow-0 h-20 sticky backdrop-blur-2xl border-t border-gray-400 bottom-0 px-4 lg:px-6">
        <ChatInput sendMessage={sendMessage} disabled={disabled} />
      </div>
    </div>
  );
};

export default Chat;
