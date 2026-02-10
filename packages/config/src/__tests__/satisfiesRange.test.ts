import { describe, it, expect } from "vitest";

// Import the internal function for unit testing
// We re-export it from a test helper since it's not public
import { satisfiesRange } from "../semver";

describe("satisfiesRange", () => {
  describe("caret (^) ranges", () => {
    it("matches exact version", () => {
      expect(satisfiesRange("4.0.0", "^4.0.0")).toBe(true);
    });

    it("matches higher minor", () => {
      expect(satisfiesRange("4.1.0", "^4.0.0")).toBe(true);
    });

    it("matches higher patch", () => {
      expect(satisfiesRange("4.0.5", "^4.0.0")).toBe(true);
    });

    it("rejects lower major", () => {
      expect(satisfiesRange("3.12.0", "^4.0.0")).toBe(false);
    });

    it("rejects higher major", () => {
      expect(satisfiesRange("5.0.0", "^4.0.0")).toBe(false);
    });

    it("rejects lower minor", () => {
      expect(satisfiesRange("3.11.0", "^3.12.0")).toBe(false);
    });

    it("rejects lower patch when minor matches", () => {
      expect(satisfiesRange("3.12.0", "^3.12.5")).toBe(false);
    });

    it("matches GSAP version", () => {
      expect(satisfiesRange("3.14.2", "^3.12.0")).toBe(true);
      expect(satisfiesRange("3.12.0", "^3.12.0")).toBe(true);
      expect(satisfiesRange("3.10.0", "^3.12.0")).toBe(false);
    });
  });

  describe(">= ranges", () => {
    it("matches exact version", () => {
      expect(satisfiesRange("0.160.0", ">=0.160.0")).toBe(true);
    });

    it("matches higher version", () => {
      expect(satisfiesRange("0.172.0", ">=0.160.0")).toBe(true);
    });

    it("rejects lower version", () => {
      expect(satisfiesRange("0.150.0", ">=0.160.0")).toBe(false);
    });

    it("matches across major versions", () => {
      expect(satisfiesRange("1.0.0", ">=0.160.0")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("returns true for unparseable version", () => {
      expect(satisfiesRange("unknown", "^4.0.0")).toBe(true);
    });

    it("returns true for unparseable range", () => {
      expect(satisfiesRange("4.0.0", "latest")).toBe(true);
    });

    it("handles pre-release suffixes in version", () => {
      expect(satisfiesRange("4.0.0-rc.1", "^4.0.0")).toBe(true);
    });
  });
});
