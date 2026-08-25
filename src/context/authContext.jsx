import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { renewToken } from "@/api/API";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

// global state on retrieving user auth token and email
export const AuthProvider = ({ children }) => {
    const [msg, setMsg] = useState(null);

    const [authState, setAuthState] = useState(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role");
        const id = localStorage.getItem("adminId");
        return {
            token: token || null,
            email: email || null,
            role: role || null,
            id: id || null,
        };
    });

    const login = (token, email, role, id) => {
        setAuthState({ token, email, role, id });
        localStorage.setItem("token", token);
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);
        localStorage.setItem("adminId", id);
    };

    const logout = useCallback(() => {
        setAuthState({ token: null, email: null, role: null, id: null });
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("adminId");
    }, []);

    // update w/ new token
    const renewAuthToken = useCallback((token) => {
        setAuthState((prev) => ({ ...prev, token }));
        localStorage.setItem("token", token);
    }, []);

    // ─── Auto token renewal ───
    // Renews proactively every 50 min and immediately when the user
    // returns to the tab after being away (visibilitychange).
    const isRenewing = useRef(false);

    const tryRenew = useCallback(async () => {
        const currentToken = localStorage.getItem("token");
        if (!currentToken || isRenewing.current) return;
        isRenewing.current = true;
        try {
            const res = await renewToken(currentToken);
            if (res?.success && res?.token) {
                renewAuthToken(res.token);
            } else {
                logout();
            }
        } catch {
            // If server is unreachable, don't log out — just wait for next attempt
        } finally {
            isRenewing.current = false;
        }
    }, [renewAuthToken, logout]);

    useEffect(() => {
        if (!authState?.token) return;

        // Renew every 50 minutes
        const interval = setInterval(tryRenew, 50 * 60 * 1000);

        // Renew immediately when user returns to the tab
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                tryRenew();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [authState?.token, tryRenew]);

    return (
        <AuthContext.Provider value={{ authState, msg, setMsg, login, logout, renewAuthToken }}>
            {children}
        </AuthContext.Provider>
    );
};
