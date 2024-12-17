import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

//for the socket: 
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// Create a store using Zustand, it is similar to hooks with global state, we can call this hook, destructured it and use in any component
export const useAuthStore = create((set, get) => ({ // set is used to set the state and get is used to get the state
  // Initial state of the store
  authUser: null,
  isSigningUp: false, //lodaing state for signup
  isLoggingIn: false, //loading state for login
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [], // contains list of userids(for online users), sent by backend socket's events 
  socket: null,

  // function to check if the user is authenticated or not
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();  // connect the socket if the user is authenticated
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // function that take user data and send it to server to create a new account
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket(); // connect the socket after creating the account
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // function that take user data and send it to server to login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket(); // connect the socket, if user is authenticated 
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // function to logout the user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket(); // disconnect the socket after logout
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  //function that take user data and send it to server to update the profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data }); // setting the authuser to newly updated data
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // function to connect the socket server
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
    query: { userId: authUser._id,},});
    socket.connect();

    set({ socket: socket }); // setting the socket to the store
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
