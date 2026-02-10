import { beforeEach, describe, expect, it, vi } from "vitest";

const registerPluginSpy = vi.fn();
let lastTimeline:
  | {
      to: ReturnType<typeof vi.fn>;
      seek: ReturnType<typeof vi.fn>;
    }
  | null = null;

const morphSVGPluginMock = { name: "MorphSVGPlugin" };
const drawSVGPluginMock = { name: "DrawSVGPlugin" };

class MockSplitText {
  public chars = [document.createElement("span")];
  public lines: Element[] = [];
  public words: Element[] = [];
  public masks: Element[] = [];
  public elements: Element[] = [];
  public isSplit = true;

  constructor(
    public readonly target: unknown,
    public readonly vars?: unknown,
  ) {}

  public kill() {}

  public revert() {}

  public split(): this {
    return this;
  }

  public static create(target: unknown, vars?: unknown): MockSplitText {
    return new MockSplitText(target, vars);
  }
}

vi.mock("gsap", () => ({
  default: {
    registerPlugin: (plugin: unknown) => registerPluginSpy(plugin),
    timeline: () => {
      const timeline = {
        to: vi.fn().mockReturnThis(),
        seek: vi.fn(),
      };
      lastTimeline = timeline;
      return timeline;
    },
  },
}));

vi.mock("gsap/MorphSVGPlugin", () => ({
  MorphSVGPlugin: morphSVGPluginMock,
}));

vi.mock("gsap/DrawSVGPlugin", () => ({
  DrawSVGPlugin: drawSVGPluginMock,
}));

vi.mock("gsap/SplitText", () => ({
  SplitText: MockSplitText,
  default: MockSplitText,
}));

describe("gsap plugins", () => {
  beforeEach(() => {
    vi.resetModules();
    registerPluginSpy.mockReset();
    lastTimeline = null;
  });

  it("registerAllGSAPPlugins registers plugins once", async () => {
    const { registerAllGSAPPlugins } = await import("../plugins/register");

    registerAllGSAPPlugins();
    registerAllGSAPPlugins();

    expect(registerPluginSpy).toHaveBeenCalledTimes(3);
    expect(registerPluginSpy).toHaveBeenNthCalledWith(1, morphSVGPluginMock);
    expect(registerPluginSpy).toHaveBeenNthCalledWith(2, MockSplitText);
    expect(registerPluginSpy).toHaveBeenNthCalledWith(3, drawSVGPluginMock);
  });

  it("register-all import registers all plugins via side effect", async () => {
    await import("../register-all");

    expect(registerPluginSpy).toHaveBeenCalledTimes(3);
  });

  it("individual subpath imports register their plugins", async () => {
    await import("../morphsvg");
    await import("../splittext");
    await import("../drawsvg");

    expect(registerPluginSpy).toHaveBeenCalledTimes(3);
    expect(registerPluginSpy).toHaveBeenCalledWith(morphSVGPluginMock);
    expect(registerPluginSpy).toHaveBeenCalledWith(MockSplitText);
    expect(registerPluginSpy).toHaveBeenCalledWith(drawSVGPluginMock);
  });

  it("throws clear error when plugin helper is used before registration", async () => {
    const { morphSVG } = await import("../plugins/morphSVG");

    expect(() => morphSVG("#target-path")).toThrowError(
      /not registered/i,
    );
    expect(() => morphSVG("#target-path")).toThrowError(
      /register-all|morphsvg/i,
    );
  });

  it("works with timeline seek after plugin registration", async () => {
    const { registerAllGSAPPlugins } = await import("../plugins/register");
    const { morphSVG } = await import("../plugins/morphSVG");
    const { drawSVG } = await import("../plugins/drawSVG");
    const { createSplitText } = await import("../plugins/splitText");
    const gsap = (await import("gsap")).default;

    registerAllGSAPPlugins();

    const split = createSplitText(".headline", { type: "chars" });
    const timeline = gsap.timeline();

    timeline.to(".shape", {
      morphSVG: morphSVG("#target-shape"),
      drawSVG: drawSVG("0% 100%"),
      duration: 1,
    });
    timeline.to(split.chars, { opacity: 0, stagger: 0.02, duration: 0.4 });
    timeline.seek(0.5);

    expect(lastTimeline).not.toBeNull();
    expect(lastTimeline?.to).toHaveBeenCalledTimes(2);
    expect(lastTimeline?.seek).toHaveBeenCalledWith(0.5);
  });
});
