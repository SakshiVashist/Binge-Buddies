import { describe, it, expect } from "vitest";
import { getActiveGenre } from "../utils/getActiveGenre";

describe("getActiveGenre", () => {
    it("returns topGenre when it is valid", () => {
        expect(getActiveGenre("Action", null)).toBe("Action");
    });

    it("returns topGenre over onboarding genre", () => {
        expect(getActiveGenre("Action", JSON.stringify(["Drama", "Comedy"]))).toBe("Action");
    });

    it("falls back to first onboarding genre when topGenre is None", () => {
        expect(getActiveGenre("None", JSON.stringify(["Drama", "Comedy"]))).toBe("Drama");
    });

    it("falls back to first onboarding genre when topGenre is empty", () => {
        expect(getActiveGenre("", JSON.stringify(["Thriller"]))).toBe("Thriller");
    });

    it("returns None when both topGenre and onboarding genres are unavailable", () => {
        expect(getActiveGenre("None", null)).toBe("None");
    });

    it("returns None when onboarding genres JSON is invalid", () => {
        expect(getActiveGenre("None", "invalid json")).toBe("None");
    });

    it("returns None when onboarding genres array is empty", () => {
        expect(getActiveGenre("None", JSON.stringify([]))).toBe("None");
    });
});