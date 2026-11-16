import { describe, it, expect } from "vitest";
import { computeBingeBuddiesMatches } from "../utils/computeBingeBuddiesMatches";


describe("computeBingeBuddiesMatches", () => {
    const myList = [
        { id: 1, type: "movie" },
        { id: 2, type: "tv" },
        { id: 3, type: "movie" },
    ];
    it("exclude the current user from matches", () => {
        const allUsers = [
            { id: "me", data: { bingeBuddyOptIn: true, wantToWatchList: myList } },
        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches).toEqual([]);
    });

    it("exclude users who haven't opted in even if they have matching titles", () => {
        const allUsers = [
            { id: "user1", data: { bingeBuddyOptIn: false, wantToWatchList: myList } },
        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches).toEqual([]);
    });

    it("exclude users with no titles even if they have opted in", () => {
        const allUsers = [
            { id: "user1", data: { bingeBuddyOptIn: true, wantToWatchList: [] } },
        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches).toEqual([]);
    });

    it("exlcude users with no shared titles even if they have opted in and have titles", () => {
        const allUsers = [
            { id: "user1", data: { bingeBuddyOptIn: true, wantToWatchList: [{ id: 4, type: "movie" }] } },
        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches).toEqual([]);
    });

    it("returns users with shared titles and opted in", () => {
        const allUsers = [
            { id: "user1", data: { bingeBuddyOptIn: true, wantToWatchList: [{ id: 1, type: "movie" }, { id: 999, type: "tv" }] } },

        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches).toHaveLength(1);
        expect(matches[0].matchCount).toBe(1);
        expect(matches[0].commonItems).toEqual([{ id: 1, type: "movie" }]);
    });
    it("treats the same id with different types as distinct titles", () => {
        const allUsers = [
            { id: "user1", data: { bingeBuddyOptIn: true, wantToWatchList: [{ id: 1, type: "tv" }] } },
        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches).toHaveLength(0);
    });
    it("sorts matches by most shared titles first", () => {
        const allUsers = [
            { id: "user1", data: { bingeBuddyOptIn: true, wantToWatchList: [{ id: 1, type: "movie" }] } },
            { id: "user2", data: { bingeBuddyOptIn: true, wantToWatchList: myList } },
        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches).toHaveLength(2);
        expect(matches[0].uid).toBe("user2");
        expect(matches[1].uid).toBe("user1");
    });
    it("falls back to default values for missing user data", () => {
        const allUsers = [
            { id: "user1", data: { bingeBuddyOptIn: true, wantToWatchList: [{ id: 1, type: "movie" }] } },
        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches[0].username).toBe("Binger");
    });

    it("returns contactType if contactValue is available", () => {
        const allUsers = [
            { id: "user1", data: { bingeBuddyOptIn: true, wantToWatchList: [{ id: 1, type: "movie" }], contactType: "email" }, },
        ];
        const matches = computeBingeBuddiesMatches("me", myList, allUsers);
        expect(matches[0].contactType).toBe(null);
        expect(matches[0].contactValue).toBe(null);
    });
});

