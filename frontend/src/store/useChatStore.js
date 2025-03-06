import toast from 'react-hot-toast';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';


export const useChatStore = create((set, get) => ({

    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
  
    getUsers: async () => {

      set({ isUsersLoading: true });
      try {

        const res = await axiosInstance.get("/messages/users"); //Getting all the users except for the loggedin user in an array.
        set({ users: res.data });

      } catch (error) {

        toast.error(error.response.data.message);

      } finally {
        set({ isUsersLoading: false });
      }
    },
  
    getMessages: async ( userId ) => {

        set({ isMessagesLoading: true });
        try {

          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });

        } catch (error) {

          toast.error(error.response.data.message);
          
        } finally {
          set({ isMessagesLoading: false });
        }
    },

    setSelectedUser: ( selectedUser ) => {
      set({ selectedUser })
    },

    sendMessage: async ( messageData ) => {

      const { selectedUser, messages } = get();
      try {

        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
        set({ messages: [...messages, res.data] });
        
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },

    subscribeToMessages: () => {

      console.log("Subscribed to messages");

      const { selectedUser } = get();
      if (!selectedUser) return;
  
      const socket = useAuthStore.getState().socket;
  
      socket.on("newMessage", (newMessage) => {

          const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
          if (!isMessageSentFromSelectedUser) return;
          
          set({
            messages: [...get().messages, newMessage],
          });

      });
    },
  
    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;
      socket.off("newMessage");
      console.log("Unsubscribed messages");
    },

}))