import { describe, it, expect } from "vitest";
import { fmtTime } from "../utils/messagesUtils";
import { initial } from "../utils/getInitial";

describe("fmtTime", () => {
    it("formats a valid timestamp into a time string", () => {
        const mockTs = {
            toDate: () => new Date("2026-08-06T15:45:00"),
        } as any;

        const result = fmtTime(mockTs);
        expect(result).toMatch(/3:45/);
    });

    it("returns an empty string when timestamp is null", () => {
        expect(fmtTime(null)).toBe("");
    });

    it("returns an empty string when timestamp is undefined", () => {
        expect(fmtTime(undefined)).toBe("");
    });

    it("returns an empty string when toDate is not a function", () => {
        expect(fmtTime({} as any)).toBe("");
    });
});

describe("initial", () => {
    it("returns the uppercased first letter of a name", () => {
        expect(initial("alice")).toBe("A");
    });

    it("returns '?' for an empty string", () => {
        expect(initial("")).toBe("?");
    });

    it("returns '?' for a whitespace-only string", () => {
        expect(initial("   ")).toBe("?");
    });

    it("uses the first letter even if the name has leading whitespace", () => {
        expect(initial("  bob")).toBe("B");
    });

    it("handles a single-character name", () => {
        expect(initial("z")).toBe("Z");
    });
});
