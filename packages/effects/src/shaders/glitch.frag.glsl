precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_frame;
uniform float u_intensity;
uniform float u_strength;
uniform float u_block_size;
uniform float u_seed;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233)) + u_seed) * 43758.5453);
}

void main() {
  vec2 blockUv = floor(v_uv * max(u_block_size, 1.0)) / max(u_block_size, 1.0);
  float noise = rand(blockUv + floor(u_frame));
  float glitch = step(1.0 - (u_strength * u_intensity), noise);

  vec2 offset = vec2(glitch * 0.02 * u_strength * u_intensity, 0.0);

  float r = texture2D(u_texture, v_uv + offset).r;
  float g = texture2D(u_texture, v_uv).g;
  float b = texture2D(u_texture, v_uv - offset).b;

  vec3 color = vec3(r, g, b);
  color += glitch * 0.1 * u_intensity;

  gl_FragColor = vec4(color, 1.0);
}
