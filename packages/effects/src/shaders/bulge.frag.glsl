precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_intensity;
uniform float u_radius;
uniform float u_strength;
uniform vec2 u_center;

void main() {
  vec2 delta = v_uv - u_center;
  float dist = length(delta);
  float radius = max(u_radius, 0.0001);
  float influence = smoothstep(radius, 0.0, dist);
  float bulge = 1.0 - (u_strength * u_intensity * influence * 0.35);
  vec2 uv = u_center + delta * bulge;

  gl_FragColor = texture2D(u_texture, uv);
}
