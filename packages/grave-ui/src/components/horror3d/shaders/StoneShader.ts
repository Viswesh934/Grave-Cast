/**
 * Stone Shader for Tombstone and Gothic Horror Surfaces
 * Procedural granite that weathers the way real headstones do: the polish
 * fades to grey, rain streaks the face, lichen and soil gather, then thin
 * cracks open and moss climbs the base. Torchlight follows the pointer.
 *
 * Detail is computed in the stone's own coordinates, so it stays put on the
 * stone as it moves.
 */

export const stoneVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vObjPos;
  varying vec3 vWorldNormal;
  
  void main() {
    vUv = uv;
    vObjPos = position;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const stoneFragmentShader = `
  uniform float uTime;
  uniform float uWeathering; // 0.0 = pristine, 0.3 aged, 0.6 cracked, 0.9 crumbling
  uniform float uHalfHeight; // half the stone's height, for "near the foot" and "under the arch"
  uniform vec3 uLightPosition;
  uniform vec3 uLightColor;
  uniform float uLightIntensity;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vObjPos;
  varying vec3 vWorldNormal;
  
  // Simplex noise for procedural detail
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
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Thin lines where the noise crosses zero: a branching crack network.
  float crackLines(vec3 p, float sharpness) {
    float n = abs(snoise(p));
    float n2 = abs(snoise(p * 2.1 + vec3(5.2, 1.3, 8.7)));
    return max(1.0 - smoothstep(0.0, sharpness, n), (1.0 - smoothstep(0.0, sharpness * 0.6, n2)) * 0.6);
  }
  
  void main() {
    vec3 p = vObjPos;
    // 0 at the foot of the stone, 1 at the top of the arch.
    float heightFrac = clamp((p.y + uHalfHeight) / (2.0 * uHalfHeight), 0.0, 1.0);

    // Polished granite: dark grey with light and dark mineral flecks.
    vec3 stoneBase = vec3(0.30, 0.31, 0.33);
    vec3 stoneHighlight = vec3(0.47, 0.47, 0.47);
    float grain = mix(snoise(p * 7.0) * 0.5 + 0.5, snoise(p * 19.0) * 0.5 + 0.5, 0.55);
    vec3 stoneColor = mix(stoneBase, stoneHighlight, grain);
    float flecks = smoothstep(0.62, 0.8, snoise(p * 46.0) * 0.5 + 0.5);
    stoneColor = mix(stoneColor, vec3(0.70, 0.69, 0.66), flecks * 0.55);
    float darkFlecks = smoothstep(0.66, 0.84, snoise(p * 38.0 + vec3(4.0)) * 0.5 + 0.5);
    stoneColor = mix(stoneColor, vec3(0.10, 0.10, 0.11), darkFlecks * 0.5);

    // How far weathering has gone: 0 for pristine, 1 from "aged" on.
    float exposure = smoothstep(0.0, 0.3, uWeathering);

    // The polish goes and the stone pales to a dry, slightly warm grey.
    vec3 paled = mix(vec3(dot(stoneColor, vec3(0.333))), vec3(0.50, 0.48, 0.44), 0.55);
    stoneColor = mix(stoneColor, paled, exposure * 0.75);

    // Rain streaks running down the face, and grime under the arch.
    float streakNoise = snoise(vec3(p.x * 13.0, p.y * 0.8, p.z * 13.0)) * 0.5 + 0.5;
    float streaks = smoothstep(0.58, 0.85, streakNoise) * exposure;
    float runoff = smoothstep(0.6, 1.0, heightFrac) * exposure;
    stoneColor *= 1.0 - streaks * 0.3 - runoff * 0.18;

    // Lichen crusts: pale grey-green, with a few ochre spots.
    float lichenNoise = snoise(p * 3.2 + vec3(3.1, 7.4, 1.9)) * 0.5 + 0.5;
    float lichenDetail = snoise(p * 26.0) * 0.5 + 0.5;
    float lichen = smoothstep(0.62, 0.78, lichenNoise) * smoothstep(0.3, 0.55, lichenDetail) * exposure;
    float ochre = smoothstep(0.55, 0.72, snoise(p * 1.8 + vec3(9.0)) * 0.5 + 0.5);
    vec3 lichenColor = mix(vec3(0.66, 0.68, 0.58), vec3(0.72, 0.56, 0.30), ochre);
    stoneColor = mix(stoneColor, lichenColor, lichen * 0.8);

    // Soil splashed onto the foot of the stone.
    float soil = (1.0 - smoothstep(0.0, 0.22, heightFrac)) * exposure * (0.6 + 0.4 * (snoise(p * 9.0) * 0.5 + 0.5));
    stoneColor = mix(stoneColor, vec3(0.22, 0.17, 0.12), soil * 0.7);

    // Cracks: none on aged stone, thin dark lines once cracked, deeper when crumbling.
    float crackAmount = smoothstep(0.45, 0.6, uWeathering);
    float crackWidth = mix(0.035, 0.06, smoothstep(0.6, 0.9, uWeathering));
    float cracks = crackLines(p * vec3(1.6, 1.1, 1.6) + vec3(1.7), crackWidth) * crackAmount;
    stoneColor = mix(stoneColor, vec3(0.06, 0.05, 0.05), cracks * 0.9);

    // Moss climbing the base of a crumbling stone.
    float mossAmount = smoothstep(0.75, 0.9, uWeathering);
    float mossNoise = snoise(p * 5.0 + vec3(2.0, 0.0, 6.0)) * 0.5 + 0.5;
    float moss = (1.0 - smoothstep(0.05, 0.4, heightFrac + (mossNoise - 0.5) * 0.25)) * mossAmount * smoothstep(0.35, 0.6, mossNoise);
    stoneColor = mix(stoneColor, vec3(0.20, 0.30, 0.15), moss * 0.85);
    
    // Torchlight from the pointer
    vec3 lightDir = normalize(uLightPosition - vPosition);
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float distance = length(uLightPosition - vPosition);
    float attenuation = 1.0 / (1.0 + 0.08 * distance + 0.008 * distance * distance);
    
    // Polished stone shines; weathered stone is matte.
    vec3 viewDir = normalize(-vPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float shine = mix(0.4, 0.05, exposure);
    float specular = pow(max(dot(vNormal, halfDir), 0.0), mix(48.0, 12.0, exposure)) * shine;
    
    // A soft, cool edge light so the silhouette reads against the night.
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = smoothstep(0.55, 1.0, rim);
    vec3 rimGlow = mix(vec3(0.30, 0.32, 0.36), vec3(0.62, 0.52, 0.40), diffuse) * rim * 0.35;
    
    // Cracks sit in shadow.
    float ao = 1.0 - cracks * 0.5;
    
    vec3 ambient = stoneColor * 0.48;
    vec3 lit = stoneColor * diffuse * uLightColor * uLightIntensity * attenuation * ao;
    vec3 spec = uLightColor * specular * attenuation * (1.0 - cracks);
    
    // Stone does not glow: no veins or ember light in the face itself.
    vec3 finalColor = ambient * ao + lit + spec + rimGlow;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
