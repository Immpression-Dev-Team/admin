import { useState, useEffect } from "react";

export const useDebounce = ({value, delay=250}) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    // delay in updating value
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        // cleanup timeout when component is unmounted
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    // return debounced value
    return debouncedValue;
}