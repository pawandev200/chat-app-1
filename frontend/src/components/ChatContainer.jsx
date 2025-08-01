import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import getStatusIcon from "../lib/getStatusIcon"; // Import the function to get status icon
import { MessageSquare } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    isLoadingAIResponse,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    unsubscribeFromMessageStatusUpdate,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const authUserId = useAuthStore.getState().authUser?._id;

  const messageEndRef = useRef(null); // reference to the last message(scroll to the end)

  useEffect(() => {
    // console.log(" Subscribing to messages for:", selectedUser._id);
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
      unsubscribeFromMessageStatusUpdate();
    };

  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, unsubscribeFromMessageStatusUpdate]);
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    if (!messageEndRef.current) return;

    // Delay scrolling to allow DOM to paint
    const timeout = setTimeout(() => {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      // messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 0);
    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    const socket = useAuthStore.getState().socket;
    const chatContextId = useChatStore.getState().chatContextId;
    if (!socket || !selectedUser || !chatContextId) return;

    const unreadMessages = messages.filter((msg) => {
      const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
      return senderId === selectedUser._id && msg.status !== "read";
    });

    const observers = [];

    unreadMessages.forEach((msg) => {
      const target = document.getElementById(`message-${msg._id}`);
      if (!target) return;

      const observer = new IntersectionObserver( (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          socket.emit("messageRead", {
            messageId: msg._id,
            chatContextId,
          });
          observer.disconnect(); // Stop observing once marked as read
        }
      }, { threshold: 1.0 });

      observer.observe(target);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [messages, selectedUser?._id, authUserId]);


  // loading skeleton: if messages are loading, show skeleton messages
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
const AI_USER_ID = "686047cb7a143aecd9fee73d";

return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* This is the messages area where all the text and images will apear a/c to sender and receiver */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          // Normalize senderId to support both object and string
          const senderId = typeof message.senderId === "object" ? message.senderId._id : message.senderId;
          const receiverId = typeof message.receiverId === "object" ? message.receiverId._id : message.receiverId;

          const isOwnMessage = senderId === authUserId ;
          const isAIMessage = senderId === AI_USER_ID;

          // Choose the right avatar profile pic depending on who the sender is
          const senderProfilePic = isAIMessage? "/ai-avatar.png":
            typeof message.senderId === "object"
              ? message.senderId.profilePic
              : isOwnMessage
              ? authUser.profilePic
              : selectedUser?.profilePic;

          return (
            <div
              key={message._id}
              id={`message-${message._id}`} // for scrolling to a specific message
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={senderProfilePic || "/avatar.png"}
                    alt="profile pic"
                    className="object-cover rounded-full"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}

                {/*  Show tick icon only if it’s your message */}
                {isOwnMessage && receiverId !== AI_USER_ID && (
                  <span className="text-right text-xs text-base-content/60 mt-1 flex items-center justify-end gap-1">
                    {getStatusIcon(message.status, receiverId)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/*  Placeholder for empty conversations */}
        {messages.length === 0 && !isMessagesLoading && (
          <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
            <div className="max-w-md text-center space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
                    justify-center animate-bounce"
                  >
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold">No messages yet</h2>
              <p className="text-base-content/60">
                Start your conversation with <strong>{selectedUser?.fullName || "this user"}</strong> by sending your first message!
              </p>
            </div>
          </div>
        )}

        {/* Showing a loader if AI is generating a response */}
        {isLoadingAIResponse && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-base-300 flex items-center gap-2 py-2 px-4 animate-[pulse_1.5s_infinite] rounded-xl">
              <span className="text-sm text-base-content">Generating response</span>
              <div className="flex gap-1">
                <span className="block w-2 h-2 bg-base-content/60 rounded-full animate-bounce [animation-delay:0s]"></span>
                <span className="block w-2 h-2 bg-base-content/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="block w-2 h-2 bg-base-content/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message input area where user can type / attach and send the message*/}
      <MessageInput />
    </div>
  );
};
export default ChatContainer;