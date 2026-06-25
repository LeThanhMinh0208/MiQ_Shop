import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  isOpen:   false,
  room:     null,
  messages: [],
  unread:   0,

  setRoom:     (room)     => set({ room }),
  setMessages: (messages) => set({ messages }),

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, msg],
      unread:   s.isOpen ? 0 : s.unread + 1,
    })),

  setOpen: (isOpen) =>
    set({ isOpen, unread: isOpen ? 0 : get().unread }),

  clearUnread: () => set({ unread: 0 }),
  clear:       () => set({ isOpen: false, room: null, messages: [], unread: 0 }),
}));
