import { Navigate } from "react-router-dom";
import { useUser } from "../auth/contexts/UserContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { userState } = useUser();

    if (userState.checking) {
        return <div>Cargando usuario...</div>;
    }

    if (!userState.logged) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
