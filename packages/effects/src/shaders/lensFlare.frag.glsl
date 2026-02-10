precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_intensity;
uniform float u_halo_size;
uniform float u_streaks;
uniform vec2 u_light_position;

void main() {
  vec3 base = texture2D(u_texture, v_uv).rgb;

  vec2 delta = v_uv - u_light_position;
  float distanceToLight = length(delta);

  float halo = smoothstep(u_halo_size, 0.0, distanceToLight) * u_intensity;
  float angle = atan(delta.y, delta.x);
  float streak = pow(abs(cos(angle * max(u_streaks, 1.0))), 24.0) * u_intensity;
  float flare = halo + streak * smoothstep(0.8, 0.0, distanceToLight);

  vec3 flareColor = vec3(1.0, 0.85, 0.6) * flare;
  gl_FragColor = vec4(base + flareColor, 1.0);
}
