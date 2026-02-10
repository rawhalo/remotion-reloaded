precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_intensity;
uniform float u_strength;
uniform float u_samples;
uniform vec2 u_center;

void main() {
  float sampleCount = clamp(u_samples, 1.0, 20.0);
  vec2 toCenter = u_center - v_uv;
  vec4 color = vec4(0.0);
  float total = 0.0;

  for (int i = 0; i < 20; i += 1) {
    float fi = float(i);
    if (fi >= sampleCount) {
      continue;
    }

    float t = sampleCount <= 1.0 ? 0.0 : (fi / (sampleCount - 1.0));
    vec2 uv = v_uv + toCenter * t * u_strength * 0.08 * u_intensity;
    color += texture2D(u_texture, uv);
    total += 1.0;
  }

  gl_FragColor = color / max(total, 1.0);
}
