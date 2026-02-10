precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_time;
uniform float u_intensity;
uniform float u_scanlines;
uniform float u_distortion;
uniform float u_jitter;
uniform float u_noise;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float lineOffset = sin(v_uv.y * u_scanlines * 400.0 + u_time * 30.0) * 0.0015 * u_distortion * u_intensity;
  float jitter = (rand(vec2(u_time, v_uv.y)) - 0.5) * 0.003 * u_jitter * u_intensity;

  vec2 uv = v_uv;
  uv.x += lineOffset + jitter;

  float r = texture2D(u_texture, uv + vec2(0.002 * u_intensity, 0.0)).r;
  float g = texture2D(u_texture, uv).g;
  float b = texture2D(u_texture, uv - vec2(0.002 * u_intensity, 0.0)).b;

  vec3 color = vec3(r, g, b);
  float scanline = sin(v_uv.y * 800.0) * 0.04 * u_scanlines * u_intensity;
  float grain = (rand(v_uv + u_time) - 0.5) * 0.08 * u_noise * u_intensity;

  color -= scanline;
  color += grain;

  gl_FragColor = vec4(color, 1.0);
}
