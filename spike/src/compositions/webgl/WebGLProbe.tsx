/**
 * Spike 0.3 — WebGL/WebGPU capability probe
 *
 * Renders GPU capability information to the screen so we can
 * verify what's available in different environments.
 */
import { AbsoluteFill, delayRender, continueRender } from "remotion";
import { useEffect, useRef, useState } from "react";

interface GPUInfo {
  webglAvailable: boolean;
  webgl2Available: boolean;
  webgpuAvailable: boolean;
  renderer: string;
  vendor: string;
  unmaskedRenderer: string;
  unmaskedVendor: string;
  maxTextureSize: number;
  maxRenderbufferSize: number;
  webglVersion: string;
  shadingLanguageVersion: string;
}

export const WebGLProbe: React.FC = () => {
  const [handle] = useState(() => delayRender("Probing GPU capabilities"));
  const [gpuInfo, setGPUInfo] = useState<GPUInfo | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const probe = async () => {
      const info: GPUInfo = {
        webglAvailable: false,
        webgl2Available: false,
        webgpuAvailable: false,
        renderer: "N/A",
        vendor: "N/A",
        unmaskedRenderer: "N/A",
        unmaskedVendor: "N/A",
        maxTextureSize: 0,
        maxRenderbufferSize: 0,
        webglVersion: "N/A",
        shadingLanguageVersion: "N/A",
      };

      // Test WebGL 1
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        if (gl) {
          info.webglAvailable = true;
          info.renderer = gl.getParameter(gl.RENDERER);
          info.vendor = gl.getParameter(gl.VENDOR);
          info.webglVersion = gl.getParameter(gl.VERSION);
          info.shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
          info.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
          info.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);

          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          if (debugInfo) {
            info.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            info.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          }
        }
      } catch (e) {
        // WebGL not available
      }

      // Test WebGL 2
      try {
        const canvas = document.createElement("canvas");
        const gl2 = canvas.getContext("webgl2");
        if (gl2) {
          info.webgl2Available = true;
        }
      } catch (e) {
        // WebGL 2 not available
      }

      // Test WebGPU
      try {
        if ("gpu" in navigator) {
          const adapter = await (navigator as any).gpu.requestAdapter();
          if (adapter) {
            info.webgpuAvailable = true;
          }
        }
      } catch (e) {
        // WebGPU not available
      }

      setGPUInfo(info);
      continueRender(handle);
    };

    probe();
  }, [handle]);

  if (!gpuInfo) {
    return <AbsoluteFill style={{ backgroundColor: "#0a0a23" }} />;
  }

  const Row = ({ label, value, ok }: { label: string; value: string; ok?: boolean }) => (
    <div style={{ display: "flex", marginBottom: 8 }}>
      <div style={{ width: 280, color: "#888", fontSize: 16, fontFamily: "monospace" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontFamily: "monospace",
          color: ok === undefined ? "#fff" : ok ? "#4ade80" : "#ef4444",
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a23",
        padding: 60,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 30 }}>
        GPU Capability Probe
      </div>

      <Row label="WebGL 1" value={gpuInfo.webglAvailable ? "Available" : "NOT Available"} ok={gpuInfo.webglAvailable} />
      <Row label="WebGL 2" value={gpuInfo.webgl2Available ? "Available" : "NOT Available"} ok={gpuInfo.webgl2Available} />
      <Row label="WebGPU" value={gpuInfo.webgpuAvailable ? "Available" : "NOT Available"} ok={gpuInfo.webgpuAvailable} />

      <div style={{ height: 20 }} />

      <Row label="GL Version" value={gpuInfo.webglVersion} />
      <Row label="GLSL Version" value={gpuInfo.shadingLanguageVersion} />
      <Row label="Renderer" value={gpuInfo.renderer} />
      <Row label="Vendor" value={gpuInfo.vendor} />
      <Row label="Unmasked Renderer" value={gpuInfo.unmaskedRenderer} />
      <Row label="Unmasked Vendor" value={gpuInfo.unmaskedVendor} />
      <Row label="Max Texture Size" value={String(gpuInfo.maxTextureSize)} />
      <Row label="Max Renderbuffer Size" value={String(gpuInfo.maxRenderbufferSize)} />

      <canvas ref={canvasRef} width={1} height={1} style={{ display: "none" }} />
    </AbsoluteFill>
  );
};
