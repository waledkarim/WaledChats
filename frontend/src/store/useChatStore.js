import toast from 'react-hot-toast';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';


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

}))