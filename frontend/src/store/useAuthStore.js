import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = "http://localhost:5100";

export const useAuthStore = create((set, get) => ({

    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {

            const res = await axiosInstance.get('auth/check');
            set({ authUser: res.data });

            get().connectSocket();

        } catch (error) {

            console.log("Error in checkAuth: " +error);
            set({ authUser: null });

        }finally{
            set({ isCheckingAuth: false });
        }
    },

    signup: async (formData) => {

        set({ isSigningUp: true });

        try {

            const res = await axiosInstance.post("/auth/signup", formData);
            set({ authUser: res.data });
            toast.success("Account created successfully");

        } catch (error) {
            
            toast.error(error.response.data.message);

        } finally {
            set({ isSigningUp: false });
        }


    },

    login: async (formData) => {

        set({ isLoggingIn: true });

        try {

            const res = await axiosInstance.post("/auth/login", formData);
            set({ authUser: res.data });
            toast.success("Logged in successfully");

            get().connectSocket();

        } catch (error) {
            console.log("Error in login: " +error)
            toast.error(error.response.data.message);

        } finally {
            set({ isLoggingIn: false });
        }

    },

    logout: async () => {

        try {

          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
          get().disconnectSocket();

        } catch (error) {

          toast.error(error.response.data.message);

        }

    },

    updateProfile: async (data) => {

        set({ isUpdatingProfile: true });
        try {

            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");

        } catch (error) {

            console.log("error in update profile:", error);
            toast.error(error.response.data.message);

        } finally {
            set({ isUpdatingProfile: false });
        }

    },

    connectSocket: () => {

        const { authUser } = get();

        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            }
        });
        socket.connect();

        set({ socket });

        socket.on("getOnlineUsers", ( userIds ) => {
            set({ onlineUsers: userIds });
        });


    },
    
    disconnectSocket: () => {
        if(get().socket?.connected) get().socket?.disconnect();
    },


}))