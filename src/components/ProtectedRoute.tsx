
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  requirePublisher?: boolean;
}

const ProtectedRoute = ({ requirePublisher = false }: ProtectedRouteProps) => {
  const { user, isLoading, isPublisher } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication
  if (!user?.isAuthenticated) {
    // Encode the current path to ensure proper redirection
    const redirectPath = encodeURIComponent(location.pathname);
    return <Navigate to={`/sign-in?redirectTo=${redirectPath}`} replace />;
  }

  // Check publisher role if required
  if (requirePublisher && !isPublisher) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
