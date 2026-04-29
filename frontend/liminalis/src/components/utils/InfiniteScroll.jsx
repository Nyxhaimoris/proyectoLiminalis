import { useState, useRef, useCallback, useEffect } from 'react';

const useInfiniteScroll = (initialLimit = 20) => {
    const [data, setData] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const observer = useRef(null);

    const lastElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (!hasMore) return;

            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setOffset((prev) => prev + initialLimit);
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, hasMore, initialLimit]
    );

    const reset = useCallback(() => {
        setData([]);
        setOffset(0);
        setHasMore(true);
    }, []);

    useEffect(() => {
        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, []);

    return {
        data,
        setData,
        offset,
        setOffset,
        hasMore,
        setHasMore,
        loading,
        setLoading,
        lastElementRef,
        reset,
        initialLimit
    };
};

export default useInfiniteScroll;