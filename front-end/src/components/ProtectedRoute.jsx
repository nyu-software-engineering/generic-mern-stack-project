import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function checkLogin() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (active) {
          setStatus(response.ok ? "authenticated" : "unauthenticated");
        }
      } catch (error) {
        if (active) {
          setStatus("unauthenticated");
        }
      }
    }

    checkLogin();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <p>Checking login...</p>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

export default ProtectedRoute;
