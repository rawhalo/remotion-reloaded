precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_intensity;
uniform float u_exposure;
uniform float u_decay;
uniform float u_density;
uniform float u_weight;
uniform vec2 u_light_position;

void main() {
  vec2 delta = (u_light_position - v_uv) * u_density / 40.0;
  vec2 coord = v_uv;
  float illumination = 1.0;
  vec3 rays = vec3(0.0);

  for (int i = 0; i < 40; i += 1) {
    coord += delta;
    vec3 sampleColor = texture2D(u_texture, coord).rgb;
    sampleColor *= illumination * u_weight;
    rays += sampleColor;
    illumination *= u_decay;
  }

  vec3 base = texture2D(u_texture, v_uv).rgb;
  vec3 color = base + rays * u_exposure * u_intensity;

  gl_FragColor = vec4(color, 1.0);
}
