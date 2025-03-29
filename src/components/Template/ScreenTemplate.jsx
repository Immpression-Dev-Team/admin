import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/authContext';
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { renewToken } from "@/api/API";

import Navbar from "../Navbar";
import Modal from "../Modal";
import '@/styles/template.css';

export default function ScreenTemplate({ children }) {
    const navigate = useNavigate();
    const { authState, logout, setMsg, renewAuthToken } = useAuth();

    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState(null);

    // set up nav bar height, warning & logout time threshold
    const navHeight = 80;

    // logout user
    const logoutUser = () => {
        logout();
        navigate("/login");
    }

    // use idle time tracker
    const { showWarning, resetIdleTime, } = useIdleTimer(logoutUser, setMsg);

    // stay on loading while user auth is still in processing
    useEffect(() => {
        if (authState?.email) {
            // Set the email if authenticated
            setEmail(authState.email);
            setLoading(false);
        }
    }, [authState]);

    // continue session by renewing auth token & timer
    const continueSession = async () => {
        const response = await renewToken(authState.token);
        renewAuthToken(response.token);
        resetIdleTime();
    }

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
            <Modal
                isOpened={showWarning}
                continueSession={continueSession}
                logout={logoutUser}
                title={'Session Expiring'}
                message={'You will be logged out in less than 1 minute due to inactivity, do you wish to stay logged in?'}
            />
            
            <Navbar email={email} height={navHeight}/>
            
            <div className="content">
                { children }
            </div>
        </div>
    )
}