precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform float u_scale;
uniform float u_angle;
uniform float u_threshold;

void main() {
  vec2 centered = v_uv - 0.5;
  float c = cos(u_angle);
  float s = sin(u_angle);
  vec2 rotated = vec2(
    centered.x * c - centered.y * s,
    centered.x * s + centered.y * c
  ) + 0.5;

  vec2 grid = rotated * u_resolution / max(u_scale, 1.0);
  vec2 cell = floor(grid) + 0.5;
  vec2 sampleUv = cell * max(u_scale, 1.0) / u_resolution;

  vec3 source = texture2D(u_texture, sampleUv).rgb;
  float luminance = dot(source, vec3(0.299, 0.587, 0.114));

  vec2 local = fract(grid) - 0.5;
  float radius = (1.0 - luminance) * 0.5 * u_intensity;
  float dotMask = smoothstep(radius, radius - 0.05, length(local));

  vec3 halftone = mix(vec3(1.0), vec3(0.0), dotMask);
  vec3 color = mix(source, halftone, clamp(u_threshold, 0.0, 1.0) * u_intensity);

  gl_FragColor = vec4(color, 1.0);
}
