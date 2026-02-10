attribute vec3 aVelocity;
attribute vec4 aMeta;
attribute float aSize;

uniform float uFrame;
uniform float uFps;
uniform float uBehavior;
uniform float uSpeed;
uniform float uGravity;
uniform float uStrength;
uniform float uCurl;
uniform float uNoiseScale;
uniform float uRadius;

varying vec3 vColor;

vec3 applyFlowField(vec3 basePosition, vec3 velocity, vec4 meta, float seconds) {
  float t = seconds * uSpeed + meta.x;
  float nx = sin(basePosition.x * uNoiseScale + t * 1.31);
  float ny = cos(basePosition.y * uNoiseScale - t * 0.87);
  float nz = sin(basePosition.z * uNoiseScale + t * 0.63);

  vec3 curlVector = normalize(vec3(ny - nz, nz - nx, nx - ny) + vec3(0.0001));
  return basePosition + velocity * (seconds * 0.35) + curlVector * uCurl * 1.8;
}

vec3 applyExplosion(vec3 basePosition, vec3 velocity, vec4 meta, float seconds) {
  float lifetime = max(meta.y, 0.1);
  float localTime = mod(seconds + meta.x * 0.2, lifetime);

  vec3 displaced = basePosition + velocity * localTime;
  displaced.y += 0.5 * uGravity * localTime * localTime;
  return displaced;
}

vec3 applyOrbit(vec3 basePosition, vec4 meta, float seconds) {
  float angle = meta.x + seconds * uSpeed;
  float radius = max(meta.w, 0.1) + uRadius * 0.1;

  return vec3(
    cos(angle) * radius + basePosition.x,
    sin(angle * 2.0 + meta.x) * radius * 0.35 + basePosition.y,
    sin(angle) * radius + basePosition.z
  );
}

vec3 applyAttract(vec3 basePosition, vec4 meta, float seconds) {
  float decay = exp((-uStrength * seconds) / max(meta.z, 0.1));

  return vec3(
    basePosition.x * decay + sin(seconds * 1.7 + meta.x) * 0.35,
    basePosition.y * decay + cos(seconds * 1.2 + meta.x * 0.5) * 0.35,
    basePosition.z * decay + sin(seconds * 0.9 + meta.x * 0.75) * 0.35
  );
}

void main() {
  float safeFps = max(uFps, 1.0);
  float seconds = uFrame / safeFps;
  vec3 animatedPosition = position;

  if (uBehavior < 0.5) {
    animatedPosition = applyFlowField(position, aVelocity, aMeta, seconds);
  } else if (uBehavior < 1.5) {
    animatedPosition = applyExplosion(position, aVelocity, aMeta, seconds);
  } else if (uBehavior < 2.5) {
    animatedPosition = applyOrbit(position, aMeta, seconds);
  } else {
    animatedPosition = applyAttract(position, aMeta, seconds);
  }

  vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depthScale = 300.0 / max(1.0, -mvPosition.z);
  gl_PointSize = max(1.0, aSize * depthScale);
  vColor = color;
}
