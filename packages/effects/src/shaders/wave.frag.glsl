precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_speed;

void main() {
  float wave = sin((v_uv.y * u_frequency * 20.0) + (u_time * u_speed * 6.28318));
  vec2 uv = v_uv;
  uv.x += wave * u_amplitude * 0.02 * u_intensity;

  vec4 color = texture2D(u_texture, uv);
  gl_FragColor = color;
}
