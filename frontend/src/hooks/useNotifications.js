import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markRead, markAllRead, deleteNotif } from '../store/notificationSlice';

export default function useNotifications() {
  const dispatch = useDispatch();
  const { items, unreadCount, loading, pagination } = useSelector((s) => s.notifications);

  return {
    notifications: items, unreadCount, loading, pagination,
    fetch:     (params) => dispatch(fetchNotifications(params)),
    markRead:  (id)     => dispatch(markRead(id)),
    markAllRead:()      => dispatch(markAllRead()),
    remove:    (id)     => dispatch(deleteNotif(id)),
  };
}
