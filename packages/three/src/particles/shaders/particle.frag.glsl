uniform float uOpacity;

varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float distanceFromCenter = length(uv);
  float alpha = smoothstep(0.5, 0.0, distanceFromCenter) * uOpacity;

  if (alpha <= 0.001) {
    discard;
  }

  gl_FragColor = vec4(vColor, alpha);
}
