precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform float u_radius;
uniform float u_threshold;
uniform vec3 u_color;

void main() {
  vec2 texel = vec2(1.0) / max(u_resolution, vec2(1.0));

  vec3 c = texture2D(u_texture, v_uv).rgb;
  vec3 n = texture2D(u_texture, v_uv + vec2(0.0, texel.y)).rgb;
  vec3 s = texture2D(u_texture, v_uv - vec2(0.0, texel.y)).rgb;
  vec3 e = texture2D(u_texture, v_uv + vec2(texel.x, 0.0)).rgb;
  vec3 w = texture2D(u_texture, v_uv - vec2(texel.x, 0.0)).rgb;

  float edge = length((n + s + e + w) * 0.25 - c);
  float glow = smoothstep(u_threshold * 0.5, u_threshold, edge) * u_intensity;

  vec3 neon = c + (u_color * glow * (1.0 + u_radius * 0.03));
  gl_FragColor = vec4(neon, 1.0);
}
