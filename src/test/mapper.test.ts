import { describe, it, expect, vi } from "vitest";
import { mapServiceGame, serviceGamesToDoc } from "../api/mapper";

const BASE_GAME: Record<string, unknown> = {
  id: "game-1",
  name: "Test Game",
  platforms: ["PC", "PS5"],
  release: {
    status: "announced",
    dateISO: "2026-06-15",
    isOfficial: true,
    confidence: "official",
    sources: [],
  },
  sources: [],
};

describe("mapServiceGame", () => {
  it("maps id and name", () => {
    const result = mapServiceGame(BASE_GAME);
    expect(result.id).toBe("game-1");
    expect(result.name).toBe("Test Game");
  });

  it("maps platforms correctly", () => {
    const result = mapServiceGame(BASE_GAME);
    expect(result.platforms).toContain("pc");
    expect(result.platforms).toContain("ps5");
  });

  it("maps unknown platform to 'other'", () => {
    const result = mapServiceGame({ ...BASE_GAME, platforms: ["UnknownPlatform"] });
    expect(result.platforms).toContain("other");
  });

  it("maps announced status with dateISO to announced_date", () => {
    const result = mapServiceGame(BASE_GAME);
    expect(result.release.status).toBe("announced_date");
  });

  it("maps 'released' status with dateISO to released", () => {
    const result = mapServiceGame({
      ...BASE_GAME,
      release: { status: "released", dateISO: "2025-01-01", isOfficial: true, sources: [] },
    });
    expect(result.release.status).toBe("released");
  });

  it("maps 'released' status without dateISO to tba with a warning", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const result = mapServiceGame({
      ...BASE_GAME,
      release: { status: "released", isOfficial: true, sources: [] },
    });
    expect(result.release.status).toBe("tba");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("maps 'delayed' status correctly", () => {
    const result = mapServiceGame({
      ...BASE_GAME,
      release: { status: "delayed", isOfficial: false, sources: [] },
    });
    expect(result.release.status).toBe("delayed");
  });

  it("maps 'canceled' to 'cancelled'", () => {
    const result = mapServiceGame({
      ...BASE_GAME,
      release: { status: "canceled", isOfficial: false, sources: [] },
    });
    expect(result.release.status).toBe("cancelled");
  });

  it("maps 'unknown' status to 'tba'", () => {
    const result = mapServiceGame({
      ...BASE_GAME,
      release: { status: "unknown", isOfficial: false, sources: [] },
    });
    expect(result.release.status).toBe("tba");
  });

  it("maps official confidence to confirmed", () => {
    const result = mapServiceGame(BASE_GAME);
    expect(result.release.confidence).toBe("confirmed");
  });

  it("maps likely confidence correctly", () => {
    const result = mapServiceGame({
      ...BASE_GAME,
      release: {
        status: "announced",
        dateISO: "2026-06-15",
        isOfficial: false,
        confidence: "likely",
        sources: [],
      },
    });
    expect(result.release.confidence).toBe("likely");
  });

  it("maps studio if present", () => {
    const result = mapServiceGame({
      ...BASE_GAME,
      studio: { name: "Indie Dev", type: "indie" },
    });
    expect(result.studio?.name).toBe("Indie Dev");
    expect(result.studio?.type).toBe("indie");
  });

  it("handles missing studio gracefully", () => {
    const result = mapServiceGame({ ...BASE_GAME, studio: undefined });
    expect(result.studio).toBeUndefined();
  });
});

describe("serviceGamesToDoc", () => {
  it("returns a GamesDoc with games array", () => {
    const result = serviceGamesToDoc([BASE_GAME]);
    expect(result.games).toHaveLength(1);
    expect(result.schemaVersion).toBe("service");
    expect(result.generatedAt).toBeDefined();
  });

  it("filters out non-objects", () => {
    const result = serviceGamesToDoc([BASE_GAME, null, "string", 42]);
    expect(result.games).toHaveLength(1);
  });

  it("returns empty games array for empty input", () => {
    const result = serviceGamesToDoc([]);
    expect(result.games).toHaveLength(0);
  });
});
