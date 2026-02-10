struct Particle {
  position: vec4<f32>,
  velocity: vec4<f32>,
  meta: vec4<f32>,
};

@group(0) @binding(0)
var<storage, read_write> particles: array<Particle>;

struct SimUniforms {
  frame: f32,
  fps: f32,
  behavior: f32,
  speed: f32,
  gravity: f32,
  strength: f32,
  curl: f32,
  noiseScale: f32,
};

@group(0) @binding(1)
var<uniform> uniforms: SimUniforms;

fn flow_field(base: vec3<f32>, velocity: vec3<f32>, phase: f32, seconds: f32) -> vec3<f32> {
  let t = seconds * uniforms.speed + phase;
  let nx = sin(base.x * uniforms.noiseScale + t * 1.31);
  let ny = cos(base.y * uniforms.noiseScale - t * 0.87);
  let nz = sin(base.z * uniforms.noiseScale + t * 0.63);
  let curl = normalize(vec3<f32>(ny - nz, nz - nx, nx - ny) + vec3<f32>(0.0001));
  return base + velocity * (seconds * 0.35) + curl * uniforms.curl * 1.8;
}

fn explosion(base: vec3<f32>, velocity: vec3<f32>, phase: f32, life: f32, seconds: f32) -> vec3<f32> {
  let local_life = max(life, 0.1);
  let local_t = (seconds + phase * 0.2) % local_life;
  return vec3<f32>(
    base.x + velocity.x * local_t,
    base.y + velocity.y * local_t + 0.5 * uniforms.gravity * local_t * local_t,
    base.z + velocity.z * local_t,
  );
}

fn orbit(base: vec3<f32>, phase: f32, radius: f32, seconds: f32) -> vec3<f32> {
  let angle = phase + seconds * uniforms.speed;
  let r = max(radius, 0.1);
  return vec3<f32>(
    cos(angle) * r + base.x,
    sin(angle * 2.0 + phase) * r * 0.35 + base.y,
    sin(angle) * r + base.z,
  );
}

fn attract(base: vec3<f32>, phase: f32, mass: f32, seconds: f32) -> vec3<f32> {
  let decay = exp((-uniforms.strength * seconds) / max(mass, 0.1));
  return vec3<f32>(
    base.x * decay + sin(seconds * 1.7 + phase) * 0.35,
    base.y * decay + cos(seconds * 1.2 + phase * 0.5) * 0.35,
    base.z * decay + sin(seconds * 0.9 + phase * 0.75) * 0.35,
  );
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= arrayLength(&particles)) {
    return;
  }

  let seconds = uniforms.frame / max(uniforms.fps, 1.0);
  let current = particles[id.x];

  let base = current.position.xyz;
  let velocity = current.velocity.xyz;
  let phase = current.meta.x;
  let life = current.meta.y;
  let mass = current.meta.z;
  let orbit_radius = current.meta.w;

  var next = base;

  if (uniforms.behavior < 0.5) {
    next = flow_field(base, velocity, phase, seconds);
  } else if (uniforms.behavior < 1.5) {
    next = explosion(base, velocity, phase, life, seconds);
  } else if (uniforms.behavior < 2.5) {
    next = orbit(base, phase, orbit_radius, seconds);
  } else {
    next = attract(base, phase, mass, seconds);
  }

  particles[id.x].position = vec4<f32>(next, 1.0);
}
