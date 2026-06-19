import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen:    true,
    sidebarMobile:  false,
    onlineUsers:    [],
  },
  reducers: {
    toggleSidebar:       (s) => { s.sidebarOpen = !s.sidebarOpen; },
    setSidebarOpen:      (s, a) => { s.sidebarOpen = a.payload; },
    toggleMobileSidebar: (s) => { s.sidebarMobile = !s.sidebarMobile; },
    setMobileSidebar:    (s, a) => { s.sidebarMobile = a.payload; },
    setOnlineUsers:      (s, a) => { s.onlineUsers = a.payload; },
  },
});

export const {
  toggleSidebar, setSidebarOpen,
  toggleMobileSidebar, setMobileSidebar,
  setOnlineUsers,
} = uiSlice.actions;
export default uiSlice.reducer;
