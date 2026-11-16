import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filteringProcess } from "../utils/filteringProcess";
import { fetchPlatforms } from "../services/tmdbService";

vi.mock('../services/tmdbService', () => ({
    fetchPlatforms: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('filteringProcess', () => {
    const items = [
        { id: 1, type: 'movie' },
        { id: 2, type: 'tv' },
    ] as any;

    it("excludes items already in the want to watch list, attaches platforms", async () => {
        (fetchPlatforms as any).mockResolvedValue(["Netflix"]);
        const result = await filteringProcess(items, "token", new Set(), new Set(["movie-1"]));
        expect(result.map((r) => r.id)).toEqual([2]);
        expect(result[0].platforms).toEqual(["Netflix"]);
    });

    it("excludes items with no platforms", async () => {
        (fetchPlatforms as any).mockResolvedValue([]);
        const result = await filteringProcess(items, "token", new Set());
        expect(result).toEqual([]);
    });

    it("returns items with platforms and not watched log", async () => {
        (fetchPlatforms as any).mockResolvedValue(["Netflix"]);
        const result = await filteringProcess(items, "token", new Set([1]));
        expect(result.map((r) => r.id)).toEqual([2]);
        expect(result[0].platforms).toEqual(["Netflix"]);
    });

    it("checks platform availability for each candidate independently", async () => {
        (fetchPlatforms as any).mockResolvedValueOnce(["Netflix"]).mockResolvedValueOnce([]);
        const result = await filteringProcess(items, "token", new Set());
        expect(result.map((r) => r.id)).toEqual([1]);
        expect(result[0].platforms).toEqual(["Netflix"]);
    });
    it("returns an empty array when all items are filtered out", async () => {
        const result = await filteringProcess(items, "token", new Set([1, 2]));
        expect(result).toEqual([]);
        expect(fetchPlatforms).not.toHaveBeenCalled();
    });

});