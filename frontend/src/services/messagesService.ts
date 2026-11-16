// Direct-messaging service — conversations + messages stored in Firestore,
// streamed in real time (same live-listener approach as the Community Hub).
import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  startAt,
  endAt,
  limit,
  getDocs
} from "firebase/firestore";
import type { Timestamp, Unsubscribe } from "firebase/firestore";
import { db } from "../firebase";




export interface UserInfo {
  username: string;
  photoURL: string | null;
}

export interface Conversation {
  id: string;
  participants: string[];
  users: Record<string, UserInfo>;
  lastMessage: string;
  lastSenderId: string;
  lastMessageAt: Timestamp | null;
  unread: Record<string, number>;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp | null;
}

// Deterministic conversation id for a pair of users (order-independent). null lastMessageAt means the timestamp hasn't resolved from the server yet so treat it as most-recent so the conversationtreat it as most-recent so the conversationtreat it as most-recent.
export const conversationId = (a: string, b: string): string =>
  [a, b].sort().join("__");

const millis = (ts: Timestamp | null): number =>
  ts && typeof ts.toMillis === "function" ? ts.toMillis() : Number.MAX_SAFE_INTEGER;

// Send a message: upserts the conversation (fresh last-message + unread bump
// for the recipient) then appends the message to its subcollection.
export async function sendMessage(params: {
  myUid: string;
  myInfo: UserInfo;
  otherUid: string;
  otherInfo: UserInfo;
  text: string;
}): Promise<void> {
  const { myUid, myInfo, otherUid, otherInfo, text } = params;
  const trimmed = text.trim();
  if (!trimmed) return;

  const convId = conversationId(myUid, otherUid);
  const convRef = doc(db, "conversations", convId);

  await setDoc(
    convRef,
    {
      participants: [myUid, otherUid],
      users: { [myUid]: myInfo, [otherUid]: otherInfo },
      lastMessage: trimmed.slice(0, 500),
      lastSenderId: myUid,
      lastMessageAt: serverTimestamp(),
      // increment(0) creates the field at 0 if missing; increment(1) bumps the recipient
      unread: { [otherUid]: increment(1), [myUid]: increment(0) },
    },
    { merge: true }
  );

  await addDoc(collection(db, "conversations", convId, "messages"), {
    text: trimmed.slice(0, 2000),
    senderId: myUid,
    createdAt: serverTimestamp(),
  });
}

// Clear the current user's unread count for a conversation.
export async function markConversationRead(convId: string, myUid: string): Promise<void> {
  await setDoc(
    doc(db, "conversations", convId),
    { unread: { [myUid]: 0 } },
    { merge: true }
  );
}

// Live list of the current user's conversations, newest activity first.
// (Sorted client-side to avoid needing a composite Firestore index.)
export function subscribeConversations(
  myUid: string,
  cb: (conversations: Conversation[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", myUid)
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Conversation, "id">) }));
    list.sort((a, b) => millis(b.lastMessageAt) - millis(a.lastMessageAt));
    cb(list);
  });
}

// Live stream of a conversation's messages, oldest first.
export function subscribeMessages(
  convId: string,
  cb: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "conversations", convId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) })));
  });
}

// added the searching of users in messages inbox so that you can search for users and connect with them
export const searchUsers = async (search: string, excludeUid: string): Promise<(UserInfo & { uid: string })[]> => {
  const q = search.trim();
  if (!q) return [];

  const usersRef = collection(db, "users");
  const qy = query(
    usersRef,
    orderBy("username"),
    startAt(q),
    endAt(q + "\uf8ff"), // \uf8ff sorts after most chars, giving a "prefix" match
    limit(10)
  );

  const snap = await getDocs(qy);
  return snap.docs
    .filter((d) => d.id !== excludeUid)
    .map((d) => ({ uid: d.id, ...d.data() } as UserInfo & { uid: string }));
};
