// In-app message notifications: a live total-unread count (for the sidebar
// badge) and toast pop-ups when a new message arrives while the app is open.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { subscribeConversations } from "../services/messagesService";
import type { Conversation } from "../services/messagesService";
import "../styles/Notifications.css";

interface Toast {
  id: number;
  otherUid: string;
  username: string;
  photoURL: string | null;
  text: string;
}

interface NotificationValue {
  totalUnread: number;
}

const NotificationContext = createContext<NotificationValue>({ totalUnread: 0 });

export const useNotifications = () => useContext(NotificationContext);

const millisOf = (ts: Conversation["lastMessageAt"]): number =>
  ts && typeof ts.toMillis === "function" ? ts.toMillis() : Date.now();

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [totalUnread, setTotalUnread] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Last-seen activity timestamp per conversation, so we only toast on genuinely
  // new incoming messages (not on the initial load or our own sends).
  const seen = useRef<Record<string, number>>({});
  const initialized = useRef(false);
  const toastId = useRef(0);
  // Keep the current path in a ref so the snapshot handler always reads the latest.
  const pathRef = useRef(location.pathname);
  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!user?.uid) {
      setTotalUnread(0);
      setToasts([]);
      seen.current = {};
      initialized.current = false;
      return;
    }

    const myUid = user.uid;
    const unsub = subscribeConversations(myUid, (conversations) => {
      // Live unread badge total
      setTotalUnread(
        conversations.reduce((sum, c) => sum + (c.unread?.[myUid] || 0), 0)
      );

      const firstRun = !initialized.current;
      conversations.forEach((c) => {
        const at = millisOf(c.lastMessageAt);
        const prev = seen.current[c.id] ?? 0;
        const otherUid = c.participants.find((p) => p !== myUid) || "";
        const fromOther = c.lastSenderId && c.lastSenderId !== myUid;
        const viewingThisChat = pathRef.current === `/messages/${otherUid}`;

        if (!firstRun && fromOther && at > prev && !viewingThisChat) {
          const info = c.users?.[otherUid];
          const t: Toast = {
            id: ++toastId.current,
            otherUid,
            username: info?.username || "Someone",
            photoURL: info?.photoURL || null,
            text: c.lastMessage || "",
          };
          setToasts((prevToasts) => [...prevToasts, t]);
          const dismissId = t.id;
          setTimeout(
            () => setToasts((cur) => cur.filter((x) => x.id !== dismissId)),
            5000
          );
        }
        seen.current[c.id] = at;
      });
      initialized.current = true;
    });

    return () => unsub();
  }, [user]);

  const dismiss = (id: number) =>
    setToasts((cur) => cur.filter((x) => x.id !== id));

  const openChat = (t: Toast) => {
    dismiss(t.id);
    navigate(`/messages/${t.otherUid}`, {
      state: { username: t.username, photoURL: t.photoURL },
    });
  };

  return (
    <NotificationContext.Provider value={{ totalUnread }}>
      {children}
      <div className="toast-stack" role="region" aria-label="Message notifications">
        {toasts.map((t) => (
          <div key={t.id} className="msg-toast" onClick={() => openChat(t)}>
            <div className="msg-toast-avatar">
              {t.photoURL ? (
                <img src={t.photoURL} alt="" />
              ) : (
                (t.username.charAt(0) || "?").toUpperCase()
              )}
            </div>
            <div className="msg-toast-body">
              <p className="msg-toast-name">{t.username}</p>
              <p className="msg-toast-text">{t.text}</p>
            </div>
            <button
              className="msg-toast-close"
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
