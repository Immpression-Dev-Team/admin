
import { useState, useEffect } from "react";
import { useAuth } from '@/context/authContext';

import Navbar from "./Navbar";
import '@/styles/template.css';

export default function ScreenTemplate({ children }) {
    const { authState } = useAuth();

    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState(null);

    const navHeight = 80;

    // stay on loading while user auth is still in processing
    useEffect(() => {
        if(!authState.token || !authState.email){
            setLoading(false);
            console.error("No auth found, redirecting to login.");
            navigate("/login");
            return;
        }

        setEmail(authState.email);
        setLoading(false);
    }, [authState]);

    // display loading screen if on load
    if(loading){
        return(
            <div className="container" style={{ paddingTop: `${navHeight}px` }}>
                <Navbar height={navHeight}/>
                <h1>Loading information...</h1>
            </div>
        )
    }

    return (
        <div className="container" style={{ paddingTop: `${navHeight}px` }}>
            <Navbar email={email} height={navHeight}/>
            
            <div className="content">
                { children }
            </div>
        </div>
    )
}