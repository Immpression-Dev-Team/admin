import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

// global state on retrieving user auth token and email
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        return {
            token: token || null,
            email: email || null,
        };
    });

    const login = (token, email) => {
        setAuthState({
            token: token,
            email: email,
        })

        // add token to local storage
        localStorage.setItem("token", token);
        localStorage.setItem("email", email);
    }

    const logout = () => {
        setAuthState({
            token: null,
            email: null,
        });
        
        // remove token from local storage
        localStorage.removeItem("token");
        localStorage.removeItem("email");
    }

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            { children }
        </AuthContext.Provider>
    )
}