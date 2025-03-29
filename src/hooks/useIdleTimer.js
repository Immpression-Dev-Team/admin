import { useState, useEffect } from 'react';

// automatically display warn message / logout after certain time threshold (in min)
const IDLE_LIMIT = 60;
const WARNING_LIMIT = 59;

export const useIdleTimer = (logoutUser, setMsg, idleLimit=IDLE_LIMIT, warningLimit=WARNING_LIMIT) => {
    const [idleTime, setIdleTime] = useState(0);
    const [showWarning, setShowWarning] = useState(false);

    // reset timer
    const resetIdleTime = () => {
        setIdleTime(0);
        setShowWarning(false);
    };

    // track time & reset timer when user moved
    useEffect(() => {
        // update timer every 1 min
        const idleTimer = setInterval(() => {
            setIdleTime((prev) => prev+1);
        }, 60000);
        
        // install event listener for user activity (mouse/keyboard movement)
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach((event) => {
            window.addEventListener(event, resetIdleTime);
        });

        // cleanup timer & remove event listener when component is unmounted
        return () => {
            clearInterval(idleTimer);
            events.forEach((event) => {
                window.removeEventListener(event, resetIdleTime);
            });
        };
    }, []);

    // check idle time & show warning/ logged out
    useEffect(() => {
        if(idleTime === warningLimit){
            setShowWarning(true);
        }
        else if(idleTime >= idleLimit){
            setMsg({
                type: 'general',
                message: 'You have been logged out due to inactivity.'
            });
            logoutUser();
        }
    }, [idleTime, idleLimit, warningLimit]);

    return {
        showWarning,
        resetIdleTime,
    };
};
