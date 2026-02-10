precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform float u_blur;
uniform float u_focus;
uniform float u_falloff;

void main() {
  float distanceFromFocus = abs(v_uv.y - u_focus);
  float focusBand = max(u_falloff, 0.0001);
  float blurAmount = smoothstep(0.0, focusBand, distanceFromFocus) * u_blur * u_intensity;

  vec2 texel = vec2(1.0) / max(u_resolution, vec2(1.0));
  vec2 offset = vec2(texel.x * blurAmount, 0.0);

  vec4 color = vec4(0.0);
  color += texture2D(u_texture, v_uv - offset * 2.0) * 0.15;
  color += texture2D(u_texture, v_uv - offset) * 0.2;
  color += texture2D(u_texture, v_uv) * 0.3;
  color += texture2D(u_texture, v_uv + offset) * 0.2;
  color += texture2D(u_texture, v_uv + offset * 2.0) * 0.15;

  gl_FragColor = color;
}
