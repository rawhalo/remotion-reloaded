precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_intensity;
uniform float u_distance;
uniform float u_angle;
uniform float u_samples;

void main() {
  float sampleCount = clamp(u_samples, 1.0, 16.0);
  vec2 direction = vec2(cos(u_angle), sin(u_angle));
  vec2 velocity = direction * u_distance * 0.0025 * u_intensity;

  vec4 color = vec4(0.0);
  float total = 0.0;

  for (int i = 0; i < 16; i += 1) {
    float fi = float(i);
    if (fi >= sampleCount) {
      continue;
    }

    float t = sampleCount <= 1.0 ? 0.0 : (fi / (sampleCount - 1.0)) - 0.5;
    color += texture2D(u_texture, v_uv + velocity * t);
    total += 1.0;
  }

  gl_FragColor = color / max(total, 1.0);
}
