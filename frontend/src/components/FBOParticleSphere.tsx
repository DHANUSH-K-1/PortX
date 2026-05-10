import { useRef, useMemo } from 'react';
import { useFrame, createPortal } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';

const size = 256; // 256 * 256 = 65536 particles

const simulationVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const simulationFragmentShader = `
uniform sampler2D positions;
uniform float uTime;
uniform vec3 uMouse;
varying vec2 vUv;

// Curl noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 snoiseVec3(vec3 x){
  float s  = snoise(vec3(x));
  float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  vec3 c = vec3(s, s1, s2);
  return c;
}

vec3 curlNoise(vec3 p){
  const float e = .1;
  vec3 dx = vec3(e   , 0.0 , 0.0);
  vec3 dy = vec3(0.0 , e   , 0.0);
  vec3 dz = vec3(0.0 , 0.0 , e  );
  vec3 p_x0 = snoiseVec3(p - dx);
  vec3 p_x1 = snoiseVec3(p + dx);
  vec3 p_y0 = snoiseVec3(p - dy);
  vec3 p_y1 = snoiseVec3(p + dy);
  vec3 p_z0 = snoiseVec3(p - dz);
  vec3 p_z1 = snoiseVec3(p + dz);
  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

void main() {
  vec3 pos = texture2D(positions, vUv).rgb;
  
  vec3 target = pos;
  
  float len = length(pos);
  if(len > 0.0) {
      vec3 dir = pos / len;
      target = dir * 2.0; 
  }
  
  float distToMouse = length(pos - uMouse);
  float force = smoothstep(1.5, 0.0, distToMouse);
  if(force > 0.0) {
      vec3 repelDir = normalize(pos - uMouse);
      target += repelDir * force * 1.5;
  }
  
  vec3 curl = curlNoise(pos * 0.8 + uTime * 0.2);
  target += curl * 0.5;

  pos = mix(pos, target, 0.05);
  
  gl_FragColor = vec4(pos, 1.0);
}
`;

const renderVertexShader = `
uniform sampler2D uPositions;
uniform float uTime;
varying vec3 vColor;
void main() {
  vec3 pos = texture2D(uPositions, position.xy).xyz;
  
  float noise = length(pos) * 0.5;
  vec3 color1 = vec3(0.1, 0.4, 1.0); // Bright Blue
  vec3 color2 = vec3(0.5, 0.2, 1.0); // Purple
  vColor = mix(color1, color2, sin(noise + uTime) * 0.5 + 0.5);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (30.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const renderFragmentShader = `
varying vec3 vColor;
void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  
  float alpha = smoothstep(0.5, 0.1, dist);
  gl_FragColor = vec4(vColor, alpha * 0.8);
}
`;

const getSpherePositions = (size: number) => {
  const length = size * size * 4;
  const data = new Float32Array(length);
  for (let i = 0; i < size * size; i++) {
    const stride = i * 4;
    
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 2.0;
    
    data[stride] = r * Math.sin(phi) * Math.cos(theta);
    data[stride + 1] = r * Math.sin(phi) * Math.sin(theta);
    data[stride + 2] = r * Math.cos(phi);
    data[stride + 3] = 1.0;
  }
  return data;
};

export default function FBOParticleSphere() {
  const renderTargetA = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });
  const renderTargetB = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });
  
  const targetRef = useRef(renderTargetA);

  const positionsTexture = useMemo(() => {
    const data = getSpherePositions(size);
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const simulationMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const renderMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  
  const simulationScene = useMemo(() => new THREE.Scene(), []);
  const simulationCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1), []);
  const mouse = useRef(new THREE.Vector3(0, 0, 0));

  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(size * size * 3);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = (i * size + j) * 3;
        positions[index] = j / size;
        positions[index + 1] = i / size;
        positions[index + 2] = 0;
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  const initialized = useRef(false);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (planeRef.current) {
      mouse.current.x = (state.pointer.x * state.viewport.width) / 2;
      mouse.current.y = (state.pointer.y * state.viewport.height) / 2;
      mouse.current.z = 0;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }

    const prevTarget = targetRef.current;
    const nextTarget = targetRef.current === renderTargetA ? renderTargetB : renderTargetA;

    if (simulationMaterialRef.current) {
      if (!initialized.current) {
        simulationMaterialRef.current.uniforms.positions.value = positionsTexture;
        initialized.current = true;
      } else {
        simulationMaterialRef.current.uniforms.positions.value = prevTarget.texture;
      }
      simulationMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      simulationMaterialRef.current.uniforms.uMouse.value.lerp(mouse.current, 0.1);
    }

    state.gl.setRenderTarget(nextTarget);
    state.gl.render(simulationScene, simulationCamera);
    state.gl.setRenderTarget(null);

    targetRef.current = nextTarget;

    if (renderMaterialRef.current) {
      renderMaterialRef.current.uniforms.uPositions.value = nextTarget.texture;
      renderMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            ref={simulationMaterialRef}
            vertexShader={simulationVertexShader}
            fragmentShader={simulationFragmentShader}
            uniforms={{
              positions: { value: positionsTexture },
              uTime: { value: 0 },
              uMouse: { value: new THREE.Vector3() },
            }}
          />
        </mesh>,
        simulationScene
      )}

      <points ref={pointsRef}>
        <bufferGeometry attach="geometry" {...particlesGeometry} />
        <shaderMaterial
          ref={renderMaterialRef}
          vertexShader={renderVertexShader}
          fragmentShader={renderFragmentShader}
          uniforms={{
            uPositions: { value: null },
            uTime: { value: 0 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh ref={planeRef} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}
