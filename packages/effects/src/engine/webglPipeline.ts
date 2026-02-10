import type { WebGLUniformValue } from "../types";

export const WEBGL_VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export interface CaptureElementOptions {
  element: HTMLElement;
  targetCanvas?: HTMLCanvasElement;
}

export interface WebGLRenderParams {
  fps: number;
  frame: number;
  sourceCanvas: HTMLCanvasElement;
  uniforms?: Record<string, WebGLUniformValue>;
}

export interface RenderElementParams {
  element: HTMLElement;
  fps: number;
  frame: number;
  uniforms?: Record<string, WebGLUniformValue>;
}

const clampDimension = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.round(value));
};

const readStylesheetRules = (sheet: CSSStyleSheet): string => {
  try {
    return Array.from(sheet.cssRules)
      .map((rule) => rule.cssText)
      .join("\n");
  } catch {
    return "";
  }
};

const collectDocumentCss = (doc: Document): string =>
  Array.from(doc.styleSheets)
    .map((sheet) => readStylesheetRules(sheet as CSSStyleSheet))
    .filter((text) => text.length > 0)
    .join("\n");

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const loadImageFromUrl = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = url;
  });

const drawSvgToCanvas = async (
  canvas: HTMLCanvasElement,
  svgMarkup: string,
): Promise<void> => {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    throw new Error("Failed to create 2D canvas context for DOM capture.");
  }

  const blob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      return;
    } catch {
      // Fall through to URL + Image fallback.
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImageFromUrl(url);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }
};

/**
 * Captures a DOM subtree into a 2D canvas by serializing it into an SVG foreignObject.
 */
export const captureElementToCanvas = async ({
  element,
  targetCanvas,
}: CaptureElementOptions): Promise<HTMLCanvasElement | null> => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const width = clampDimension(rect.width || element.clientWidth || element.offsetWidth);
  const height = clampDimension(
    rect.height || element.clientHeight || element.offsetHeight,
  );

  const canvas = targetCanvas ?? document.createElement("canvas");
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ownerDocument = element.ownerDocument;
  const cssText = ownerDocument ? collectDocumentCss(ownerDocument) : "";

  const serializedElement = element.outerHTML;
  const cssTag = cssText.length > 0 ? `<style>${escapeXml(cssText)}</style>` : "";

  const svgMarkup = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
    `<foreignObject x="0" y="0" width="${width}" height="${height}">`,
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;overflow:hidden;">`,
    cssTag,
    serializedElement,
    "</div>",
    "</foreignObject>",
    "</svg>",
  ].join("");

  try {
    await drawSvgToCanvas(canvas, svgMarkup);
    return canvas;
  } catch {
    return null;
  }
};

const getWebGlContext = (
  canvas: HTMLCanvasElement,
): WebGLRenderingContext | null => {
  const context = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
  });

  if (context) {
    return context;
  }

  return canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
};

export const supportsWebGl = (canvas?: HTMLCanvasElement): boolean => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const target = canvas ?? document.createElement("canvas");
  return Boolean(getWebGlContext(target));
};

const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader => {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to allocate WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "Unknown shader compile error.";
    gl.deleteShader(shader);
    throw new Error(info);
  }

  return shader;
};

const linkProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram => {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Failed to allocate WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "Unknown program link error.";
    gl.deleteProgram(program);
    throw new Error(info);
  }

  return program;
};

const resolveContextTypeName = (
  context: WebGLRenderingContext,
): "webgl" | "webgl2" => {
  if (typeof WebGL2RenderingContext !== "undefined" && context instanceof WebGL2RenderingContext) {
    return "webgl2";
  }

  return "webgl";
};

export class WebGLPipeline {
  private readonly captureCanvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;
  private readonly canvas: HTMLCanvasElement;
  private readonly positionBuffer: WebGLBuffer;
  private readonly texture: WebGLTexture;
  private readonly uniformLocations = new Map<string, WebGLUniformLocation | null>();
  private disposed = false;
  private fragmentSource: string;
  private program: WebGLProgram;

  public readonly contextType: "webgl" | "webgl2";

  constructor(canvas: HTMLCanvasElement, fragmentSource: string) {
    const gl = getWebGlContext(canvas);
    if (!gl) {
      throw new Error("WebGL is not available for the target canvas.");
    }

    this.canvas = canvas;
    this.gl = gl;
    this.fragmentSource = fragmentSource;
    this.contextType = resolveContextTypeName(gl);

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, WEBGL_VERTEX_SHADER_SOURCE);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    this.program = linkProgram(gl, vertexShader, fragmentShader);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    const texture = gl.createTexture();
    if (!texture) {
      throw new Error("Failed to allocate WebGL texture.");
    }
    this.texture = texture;

    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error("Failed to allocate WebGL buffer.");
    }
    this.positionBuffer = buffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.captureCanvas = document.createElement("canvas");
  }

  private getUniformLocation(name: string): WebGLUniformLocation | null {
    if (this.uniformLocations.has(name)) {
      return this.uniformLocations.get(name) ?? null;
    }

    const location = this.gl.getUniformLocation(this.program, name);
    this.uniformLocations.set(name, location);
    return location;
  }

  private applyUniform(name: string, value: WebGLUniformValue): void {
    const location = this.getUniformLocation(name);
    if (!location) {
      return;
    }

    if (typeof value === "boolean") {
      this.gl.uniform1i(location, value ? 1 : 0);
      return;
    }

    if (typeof value === "number") {
      this.gl.uniform1f(location, value);
      return;
    }

    if (value.length === 2) {
      this.gl.uniform2f(location, value[0], value[1]);
      return;
    }

    if (value.length === 3) {
      this.gl.uniform3f(location, value[0], value[1], value[2]);
    }
  }

  public setFragmentShader(fragmentSource: string): void {
    if (this.disposed || fragmentSource === this.fragmentSource) {
      return;
    }

    const nextFragmentShader = compileShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentSource);
    const nextVertexShader = compileShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      WEBGL_VERTEX_SHADER_SOURCE,
    );

    const nextProgram = linkProgram(this.gl, nextVertexShader, nextFragmentShader);
    this.gl.deleteShader(nextVertexShader);
    this.gl.deleteShader(nextFragmentShader);

    this.gl.deleteProgram(this.program);
    this.program = nextProgram;
    this.fragmentSource = fragmentSource;
    this.uniformLocations.clear();
  }

  private resize(width: number, height: number): void {
    if (this.canvas.width === width && this.canvas.height === height) {
      return;
    }

    this.canvas.width = width;
    this.canvas.height = height;
  }

  public render({ fps, frame, sourceCanvas, uniforms = {} }: WebGLRenderParams): number | null {
    if (this.disposed) {
      return null;
    }

    const width = clampDimension(sourceCanvas.width);
    const height = clampDimension(sourceCanvas.height);
    this.resize(width, height);

    const safeFps = fps > 0 ? fps : 30;
    const start = typeof performance !== "undefined" ? performance.now() : 0;

    this.gl.viewport(0, 0, width, height);
    this.gl.useProgram(this.program);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      sourceCanvas,
    );

    const textureLocation = this.getUniformLocation("u_texture");
    if (textureLocation) {
      this.gl.uniform1i(textureLocation, 0);
    }

    this.applyUniform("u_resolution", [width, height]);
    this.applyUniform("u_frame", frame);
    this.applyUniform("u_time", frame / safeFps);

    for (const [uniformName, uniformValue] of Object.entries(uniforms)) {
      this.applyUniform(uniformName, uniformValue);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
    if (positionLocation >= 0) {
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    const end = typeof performance !== "undefined" ? performance.now() : 0;
    return end - start;
  }

  public async renderElement({
    element,
    fps,
    frame,
    uniforms = {},
  }: RenderElementParams): Promise<number | null> {
    const sourceCanvas = await captureElementToCanvas({
      element,
      targetCanvas: this.captureCanvas,
    });

    if (!sourceCanvas) {
      return null;
    }

    return this.render({
      fps,
      frame,
      sourceCanvas,
      uniforms,
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.gl.deleteTexture(this.texture);
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteProgram(this.program);
  }
}
