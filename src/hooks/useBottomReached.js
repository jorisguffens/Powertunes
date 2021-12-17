import {useCallback, useEffect, useState} from "react";

export default function useBottomReached(ref) {

    const [bottomReached, setBottomReached] = useState(false);

    const handleScroll = useCallback(() => {
        if ( !ref.current ) return;
        const bottom = ref.current.getBoundingClientRect().bottom <= window.innerHeight;
        if ( bottom !== bottomReached ) {
            setBottomReached(bottom);
        }
    }, [ref, bottomReached]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    useEffect(() => {
        let prevHeight;
        const id = setInterval(() => {
            if ( !ref.current ) return;
            const height = ref.current.offsetHeight;
            if ( prevHeight !== height ) {
                setBottomReached(false);
                handleScroll();
            }
        }, 200);
        return () => clearInterval(id);
    }, [ref, handleScroll]);

    return bottomReached;
}