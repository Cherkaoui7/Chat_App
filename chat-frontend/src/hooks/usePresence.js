import { useState, useEffect } from "react";
import { getEcho, connectSocket } from "../services/socket";
import { useAuth } from "./useAuth";

export function usePresence() {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const echo = getEcho() || connectSocket();
        if (!echo) return;

        const channel = echo.join("online")
            .here((users) => {
                setOnlineUsers(users);
            })
            .joining((joiningUser) => {
                setOnlineUsers((prev) => {
                    if (!prev.find((u) => u.id === joiningUser.id)) {
                        return [...prev, joiningUser];
                    }
                    return prev;
                });
            })
            .leaving((leavingUser) => {
                setOnlineUsers((prev) => prev.filter((u) => u.id !== leavingUser.id));
            })
            .listen(".UserOnline", (e) => {
                setOnlineUsers((prev) => {
                    if (!prev.find((u) => u.id === e.user_id)) {
                        return [...prev, { id: e.user_id, last_seen: e.last_seen }];
                    }
                    return prev;
                });
            })
            .listen(".UserOffline", (e) => {
                setOnlineUsers((prev) => prev.filter((u) => u.id !== e.user_id));
            })
            .error((error) => {
                console.error("Presence channel error:", error);
            });

        return () => {
            echo.leave("online");
        };
    }, [user]);

    const isUserOnline = (userId) => {
        return onlineUsers.some((u) => u.id === userId);
    };

    return { onlineUsers, isUserOnline };
}
