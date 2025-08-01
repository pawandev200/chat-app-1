import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import notificationsound from "../assets/sounds/notification.mp3";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  chatContextId: null,  // NEW: track which chat this is (user to user or user to AI)
  isUsersLoading: false,
  isMessagesLoading: false,
  isLoadingAIResponse: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async () => {
    const { chatContextId } = get();
    if (!chatContextId) {
      toast.error("Chat context not set");
      return;
    }

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${chatContextId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, chatContextId } = get();
    if (!chatContextId || !selectedUser) {
      toast.error("Select a user or chat first");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { ...messageData, chatContextId }
      );
      set({ messages: [...messages, res.data] }); // THIS is how message appears on sender's UI
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  sendAIMessage: async (prompt) => {
    const { messages, chatContextId, selectedUser } = get();
    if (!chatContextId) {
      toast.error("Chat context not set");
      return;
    }
    try {
      // set({ isLoadingAIResponse: true });
      const res = await axiosInstance.post("/messages/ai/prompt", { prompt, chatContextId, receiverId: selectedUser._id,});
      // const { prompt: savedPrompt, reply: savedReply } = res.data;

      const savedPrompt = res.data;
      set((state) => ({ messages: [...state.messages, savedPrompt],})); // Immediately show prompt message in sender UI: for the sender own message
      set({ isLoadingAIResponse: true });
      // if you add the replyMsg manually here then two ai reply will be shown on UI, one this and another by socket by backend: this is how you implemented the backend
      //  Do NOT add savedReply here — it will be emitted via socket from backend
    
    } catch (error) {
      toast.error(error.message || "Failed to get AI reply");
      set({ isLoadingAIResponse: false });
    }
    // finally{
    //    set({ isLoadingAIResponse: false });  // handled in subcribe message when we receive ai response make it false
    // }
  },

  // subscribeToMessages: () => {
  //   const { chatContextId } = get();
  //   const socket = useAuthStore.getState().socket;
  //   if (!chatContextId || !socket) return;

  //   socket.on("newMessage", (newMessage) => {
  //     // Only add message if it belongs to the current chat context
  //     if (newMessage.chatContextId !== chatContextId) return;

  //     const sound = new Audio(notificationsound);
  //     sound.play();

  //     set({ messages: [...get().messages, newMessage] });
  //   });
  // },

  
  subscribeToMessages: () => {
    const { chatContextId, selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (socket && socket.connected) console.log("Socket is connected, Subscribing to newMessage");

    if (!chatContextId || !socket) return;

    socket.on("newMessage", (newMessage) => {

      //  Emit delivered always
      socket.emit("messageDelivered", {
        messageId: newMessage._id,
        chatContextId: newMessage.chatContextId,
      });

      const senderId = typeof newMessage.senderId === "object"
          ? newMessage.senderId._id
          : newMessage.senderId;

      // If currently chatting with sender, emit messageRead too
      if (selectedUser && senderId === selectedUser._id && newMessage.chatContextId === chatContextId) {
        socket.emit("messageRead", {
          messageId: newMessage._id,
        });
        // console.log("messageRead emitted:", newMessage._id);
      }
      const AI_USER_ID = "686047cb7a143aecd9fee73d";
      const isAIResponse = newMessage.senderId === AI_USER_ID || newMessage.senderId?._id === AI_USER_ID;
      // Only push to UI if this message is for current chat
      if (newMessage.chatContextId === chatContextId) {
        const sound = new Audio(notificationsound);
        sound.play();
        set({ messages: [...get().messages, newMessage],
          ...(isAIResponse && { isLoadingAIResponse: false }),
        });
      }
    });

    socket.on("messageStatusUpdate", ({ messageId, status }) => {
      console.log("Status update:",status,",", "time:", new Date().toLocaleTimeString());
      get().updateMessageStatus(messageId, status);
    });
  },


  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },
  // Optionally, you can also unsubscribe from message status updates
  unsubscribeFromMessageStatusUpdate: () => {
  const socket = useAuthStore.getState().socket;
  if (socket) socket.off("messageStatusUpdate");
},


  // This will update the message's status (sent, delivered, read) reactively in UI.
updateMessageStatus: (messageId, newStatus) => {
  const statusPriority = {
    sent: 1,
    delivered: 2,
    read: 3,
  };

  set((state) => ({
    messages: state.messages.map((msg) =>
      msg._id === messageId &&
      statusPriority[newStatus] > statusPriority[msg.status]
        ? { ...msg, status: newStatus }
        : msg
    ),
  }));
},

  // setSelectedUser: (selectedUser, chatContextId) => set({ selectedUser, chatContextId }),

  setSelectedUser: (selectedUser, chatContextId) => {
    set({ selectedUser, chatContextId });

    // Emit read for unread messages
    const socket = useAuthStore.getState().socket;
    const { messages } = get();

    const unreadMessages = messages.filter(
      (msg) => msg.senderId === selectedUser._id && msg.status !== "read"
    );

    unreadMessages.forEach((msg) => {
      socket.emit("messageRead", {
        messageId: msg._id,
      });
    });
  },

}));
