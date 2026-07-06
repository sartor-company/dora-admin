import { Navigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';

export function RoleHomeRedirect() {
  const user = useAuthStore((s) => s.user);
  const role = user?.consoleRole ?? 'owner';
  return <Navigate to={ROLES[role].defaultPath} replace />;
}
