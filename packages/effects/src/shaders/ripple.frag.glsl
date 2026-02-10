precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_time;
uniform float u_intensity;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_speed;
uniform vec2 u_center;

void main() {
  vec2 delta = v_uv - u_center;
  float dist = length(delta);
  float ripple = sin((dist * u_frequency * 30.0) - (u_time * u_speed * 8.0));
  float displacement = ripple * u_amplitude * 0.015 * u_intensity;

  vec2 direction = dist > 0.0001 ? normalize(delta) : vec2(0.0);
  vec2 uv = v_uv + direction * displacement;

  gl_FragColor = texture2D(u_texture, uv);
}
