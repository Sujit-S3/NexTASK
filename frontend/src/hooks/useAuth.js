import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, fetchMe, clearAuthError } from '../store/authSlice';

export default function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const isAdmin  = user?.role === 'admin';
  const isMember = user?.role === 'member';

  return {
    user, token, isAuthenticated, loading, error, isAdmin, isMember,
    login:       (creds) => dispatch(loginUser(creds)),
    register:    (data)  => dispatch(registerUser(data)),
    logout:      ()      => dispatch(logoutUser()),
    refreshUser: ()      => dispatch(fetchMe()),
    clearError:  ()      => dispatch(clearAuthError()),
  };
}
