import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  conversationId,
  sendMessage,
  markConversationRead,
  subscribeConversations,
  subscribeMessages,
  searchUsers,
} from "../services/messagesService";
import type { Conversation, Message, UserInfo } from "../services/messagesService";
import { fmtTime } from "../utils/messagesUtils";
import { initial } from "../utils/getInitial"
import "../styles/MessagesPage.css";


// ---------------------------------------------------------------- Inbox list
const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [userResults, setUserResults] = useState<(UserInfo & { uid: string })[]>([]);

  const myUid = user?.uid || "";

  //searching of users
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setUserResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      searchUsers(q, myUid).then(setUserResults).catch(() => setUserResults([]));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, myUid]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeConversations(user.uid, (list) => {
      setConversations(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);


  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const unread = c.unread?.[myUid] || 0;
      if (filter === "unread" && unread === 0) return false;
      if (!q) return true;
      const otherUid = c.participants.find((p) => p !== myUid) || "";
      const info = c.users?.[otherUid];
      // removed searching by lastMessage as it would get confusing for users if they want to search for user
      return (info?.username || "").toLowerCase().includes(q);
    });
  }, [conversations, filter, search, myUid]);

  if (loading) {
    return <p className="messages-empty">Loading your conversations…</p>;
  }

  if (conversations.length === 0 && !search.trim()) {
    return (
      <div className="messages-empty-state">
        <img src="/Baby Pop.png" alt="" className="messages-empty-mascot" />
        <h3>No messages yet</h3>
        <p>
          Head to the <Link to="/social-connection-hub">Social Connection Hub</Link> and
          message a binge buddy to start a conversation.
        </p>
      </div>
    );
  }

  const unreadCount = conversations.filter((c) => (c.unread?.[myUid] || 0) > 0).length;

  return (
    <>
      <div className="inbox-toolbar">
        <div className="inbox-search">
          <input
            className="inbox-search-input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by buddy…"
            aria-label="Search conversations"
          />
        </div>
        <div className="inbox-filters">
          <button
            className={`inbox-filter-btn ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`inbox-filter-btn ${filter === "unread" ? "is-active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {search.trim() && userResults.length > 0 && (
        <div className="inbox-new-results">
          <p className="inbox-section-label">Start a new conversation</p>
          <div className="inbox-list">
            {userResults
              .filter((u) => !conversations.some((c) => c.participants.includes(u.uid)))
              .map((u) => (
                <button
                  key={u.uid}
                  className="inbox-row"
                  onClick={() =>
                    navigate(`/messages/${u.uid}`, {
                      state: { username: u.username, photoURL: u.photoURL },
                    })
                  }
                >
                  <div className="inbox-avatar">
                    {u.photoURL ? <img src={u.photoURL} alt="" /> : initial(u.username || "?")}
                  </div>
                  <div className="inbox-main">
                    <p className="inbox-name">{u.username}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        search.trim() && userResults.length === 0 && (
          <p className="messages-empty">No conversations match.</p>)
      ) : (
        <>
          {search.trim() && <p className="inbox-section-label">Your conversations</p>}
          <div className="inbox-list">
            {visible.map((c) => {
              const otherUid = c.participants.find((p) => p !== myUid) || "";
              const info = c.users?.[otherUid];
              const unread = c.unread?.[myUid] || 0;
              return (
                <button
                  key={c.id}
                  className={`inbox-row ${unread > 0 ? "is-unread" : ""}`}
                  onClick={() =>
                    navigate(`/messages/${otherUid}`, {
                      state: { username: info?.username, photoURL: info?.photoURL },
                    })
                  }
                >
                  <div className="inbox-avatar">
                    {info?.photoURL ? (
                      <img src={info.photoURL} alt="" />
                    ) : (
                      initial(info?.username || "?")
                    )}
                  </div>
                  <div className="inbox-main">
                    <p className="inbox-name">{info?.username || "Binge Buddy"}</p>
                    <p className="inbox-preview">
                      {c.lastSenderId === myUid ? "You: " : ""}
                      {c.lastMessage}
                    </p>
                  </div>
                  <div className="inbox-meta">
                    <span className="inbox-time">{fmtTime(c.lastMessageAt)}</span>
                    {unread > 0 && <span className="inbox-unread">{unread}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- Chat view
const ChatView = ({ otherUid }: { otherUid: string }) => {
  const { user, username } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const passed = (location.state || {}) as { username?: string; photoURL?: string | null };

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherInfo, setOtherInfo] = useState<UserInfo>({
    username: passed.username || "Binge Buddy",
    photoURL: passed.photoURL ?? null,
  });
  const [myPhoto, setMyPhoto] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const myUid = user?.uid || "";
  const convId = useMemo(
    () => (myUid ? conversationId(myUid, otherUid) : ""),
    [myUid, otherUid]
  );

  // Resolve the other user's info (if not passed) and my own avatar for sends
  useEffect(() => {
    if (!myUid) return;
    getDoc(doc(db, "users", myUid))
      .then((s) => setMyPhoto(s.exists() ? s.data().photoURL || null : null))
      .catch(() => { });
    if (!passed.username) {
      getDoc(doc(db, "users", otherUid))
        .then((s) => {
          if (s.exists()) {
            const d = s.data();
            setOtherInfo({ username: d.username || "Binge Buddy", photoURL: d.photoURL || null });
          }
        })
        .catch(() => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUid, otherUid]);

  // Live message stream
  useEffect(() => {
    if (!convId) return;
    const unsub = subscribeMessages(convId, setMessages);
    return () => unsub();
  }, [convId]);

  // Mark read whenever we're viewing and messages change
  useEffect(() => {
    if (convId && myUid) markConversationRead(convId, myUid).catch(() => { });
  }, [convId, myUid, messages.length]);

  // Auto-scroll to newest
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !myUid) return;
    setSending(true);
    setText("");
    try {
      await sendMessage({
        myUid,
        myInfo: { username: username || "Binger", photoURL: myPhoto },
        otherUid,
        otherInfo,
        text: trimmed,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setText(trimmed); // restore on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-view">
      <header className="chat-header">
        <button className="chat-back" onClick={() => navigate("/messages")} aria-label="Back to messages">
          ‹
        </button>
        <div className="chat-avatar">
          {otherInfo.photoURL ? (
            <img src={otherInfo.photoURL} alt="" />
          ) : (
            initial(otherInfo.username)
          )}
        </div>
        <p className="chat-name">{otherInfo.username}</p>
      </header>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-hint">Say hi to {otherInfo.username}!</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`chat-bubble ${m.senderId === myUid ? "is-mine" : "is-theirs"}`}
            >
              <span className="chat-text">{m.text}</span>
              <span className="chat-time">{fmtTime(m.createdAt)}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-composer">
        <input
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Message ${otherInfo.username}…`}
          maxLength={2000}
        />
        <button className="chat-send" onClick={handleSend} disabled={!text.trim() || sending}>
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Page shell
const MessagesPage = () => {
  const { otherUid } = useParams();
  return (
    <div className="messages-page">
      <Sidebar />
      <main className="messages-main">
        {otherUid ? (
          <ChatView otherUid={otherUid} />
        ) : (
          <>
            <header className="messages-title-bar">
              <h1>Messages</h1>
              <p>Your direct conversations with binge buddies.</p>
            </header>
            <Inbox />
          </>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;
