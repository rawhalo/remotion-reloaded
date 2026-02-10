precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform float u_pixel_size;

void main() {
  vec2 resolution = max(u_resolution, vec2(1.0));
  float pixel = max(1.0, u_pixel_size * (1.0 + u_intensity * 2.0));
  vec2 block = vec2(pixel) / resolution;
  vec2 uv = floor(v_uv / block) * block + (0.5 * block);

  gl_FragColor = texture2D(u_texture, uv);
}
