import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    conversationId,
    sendMessage,
    markConversationRead,
    subscribeConversations,
    subscribeMessages,
} from "../services/messagesService";

// Mock the firebase app export (db instance itself is opaque, just needs to exist)
vi.mock("../firebase", () => ({
    db: {},
}));

// Mock every Firestore SDK function this file touches
vi.mock("firebase/firestore", () => ({
    collection: vi.fn((...args) => ({ __type: "collection", path: args.slice(1).join("/") })),
    doc: vi.fn((...args) => ({ __type: "doc", path: args.slice(1).join("/") })),
    setDoc: vi.fn().mockResolvedValue(undefined),
    addDoc: vi.fn().mockResolvedValue(undefined),
    onSnapshot: vi.fn(),
    query: vi.fn((...args) => ({ __type: "query", args })),
    where: vi.fn((...args) => ({ __type: "where", args })),
    orderBy: vi.fn((...args) => ({ __type: "orderBy", args })),
    serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
    increment: vi.fn((n: number) => ({ __increment: n })),
}));

import {
    setDoc,
    addDoc,
    onSnapshot,
    where,
    orderBy,

} from "firebase/firestore";


beforeEach(() => {
    vi.clearAllMocks();
});

//conversationId tests
describe("conversationId", () => {
    it("generates the same id for the same pair of users regardless of order", () => {
        const id1 = conversationId("userA", "userB");
        const id2 = conversationId("userB", "userA");
        expect(id1).toBe(id2);
    });

    it("joins user ids with double underscore", () => {
        const id = conversationId("userA", "userB");
        expect(id).toBe("userA__userB");
    });
});

//sendMessage tests
describe("sendMessage", () => {
    const baseParams = {
        myUid: "userA",
        myInfo: { username: "Alice", photoURL: null },
        otherUid: "userB",
        otherInfo: { username: "Bob", photoURL: null },
        text: "Hello, Bob!",
    };

    it("does nothing for empty or whitespace-only messages", async () => {
        await sendMessage({ ...baseParams, text: "" });
        await sendMessage({ ...baseParams, text: "   " });
        expect(setDoc).not.toHaveBeenCalled();
        expect(addDoc).not.toHaveBeenCalled();
    });

    it("upserts the conversation and adds the message for a valid message", async () => {
        const text = "Hello, Bob!";
        await sendMessage({ ...baseParams, text });
        expect(setDoc).toHaveBeenCalledWith(
            expect.objectContaining({ path: "conversations/userA__userB" }),
            expect.objectContaining({
                participants: ["userA", "userB"],
                users: {
                    userA: { username: "Alice", photoURL: null },
                    userB: { username: "Bob", photoURL: null },
                },
                lastMessage: text,
                lastSenderId: "userA",
                lastMessageAt: "SERVER_TIMESTAMP",
                unread: {
                    userA: { __increment: 0 },
                    userB: { __increment: 1 },
                },
            }),
            { merge: true }
        );

    });
it("bumps the unread count for the recipient and not for the sender", async () => {
        const text = "Hello again!";
        await sendMessage({ ...baseParams, text });
        const[, data] = (setDoc as any).mock.calls[0];
        expect(data.unread).toEqual({
            userA: { __increment: 0 },
            userB: { __increment: 1 },
        });
    });
it("trims the whitespace from the message and limits last message to 500 characters", async () => {
        const longText = " ".repeat(10) + "A".repeat(600) + " ".repeat(10);
        await sendMessage({ ...baseParams, text: longText });
        const[, data] = (setDoc as any).mock.calls[0];
        expect(data.lastMessage).toBe("A".repeat(500));
    });
it("appends a message to the messages subcollection with createdAt/senderId", async () => {
    await sendMessage({ ...baseParams, text: "Hello!" });
    expect(addDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "conversations/userA__userB/messages" }),
        {
            text: "Hello!",
            senderId: "userA",
            createdAt: "SERVER_TIMESTAMP",
        }
    );
});
it("truncates the stored message text to 2000 characters", async () => {
    const longText = "A".repeat(2500);
    await sendMessage({ ...baseParams, text: longText });
    const[, messageData] = (addDoc as any).mock.calls[0];
    expect(messageData.text).toBe("A".repeat(2000));
});
}
);

//markConversationRead tests
describe("markConversationRead", () => {
    it("sets the unread count for the user to 0", async () => {
        const myUid = "userA";
        const otherUid = "userB";
        await markConversationRead(conversationId(myUid, otherUid), myUid);
        expect(setDoc).toHaveBeenCalledWith(
            expect.objectContaining({ path: "conversations/userA__userB" }),
            { unread: { [myUid]: 0 } },
            { merge: true }
        );
    });
});

//subscribeConversations tests 
describe("subscribeConversations", () => {
    it("queries conversations where participans array contains the user id", () => {
        (onSnapshot as any).mockReturnValue(() => {}); // mock the unsubscribe function
        subscribeConversations("userA", vi.fn());
        expect(where).toHaveBeenCalledWith("participants", "array-contains", "userA");
    });
it("maps the snapshot docs to conversation objects and sorts by lastMessageAt descending", () => {
    const cb = vi.fn();
    let snapshotCallback: (snap: any) => void = () => {};
    (onSnapshot as any).mockImplementation((_q:any, handler: any) => {
        snapshotCallback = handler;
        return () => {};
    });
    subscribeConversations("userA", cb);

    const mockDocs = [
        { id: "conv1", data: () => ({ lastMessageAt: { toMillis: () => 100 } }) },
        { id: "conv2", data: () => ({ lastMessageAt: { toMillis: () => 300 } }) },
        { id: "conv3", data: () => ({ lastMessageAt: null }) },
    ];
    snapshotCallback({ docs: mockDocs });
    const result = cb.mock.calls[0][0];
    expect(result.map((c: any) => c.id)).toEqual(["conv3", "conv2", "conv1"]);
});
it("returns an unsubscribe function from onSnapshot", () => {
    const unsubscribeMock = vi.fn();
    (onSnapshot as any).mockReturnValue(unsubscribeMock);
    const unsubscribe = subscribeConversations("userA", vi.fn());
    expect(unsubscribe).toBe(unsubscribeMock);
});
});

//subscribeMessages tests
describe("subscribeMessages", () => {
    it("queries messages ordered by createdAt ascending", () => {
        (onSnapshot as any).mockReturnValue(() => {}); // mock the unsubscribe function
        subscribeMessages("conv1", vi.fn());
        expect(orderBy).toHaveBeenCalledWith("createdAt", "asc");
    });
    it("maps the snapshot docs to message objects", () => {
        const cb = vi.fn();
        let snapshotCallback: (snap: any) => void = () => {};
        (onSnapshot as any).mockImplementation((_q:any, handler: any) => {
            snapshotCallback = handler;
            return () => {};
        });
        subscribeMessages("conv1", cb);

        const mockDocs = [
            { id: "msg1", data: () => ({ text: "Hello" , senderId: "userA", createdAt: null }) },
            { id: "msg2", data: () => ({ text: "World" , senderId: "userB", createdAt: null }) },
        ];
        snapshotCallback({ docs: mockDocs });
        expect(cb).toHaveBeenCalledWith([
            { id: "msg1", text: "Hello", senderId: "userA", createdAt: null },
            { id: "msg2", text: "World", senderId: "userB", createdAt: null },
        ]);
    });
})