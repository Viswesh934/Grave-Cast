/**
 * Stone Shader for Tombstone and Gothic Horror Surfaces
 * Procedural basalt with living organic vein corruption,
 * ambient illumination for high visibility, and torchlight specular response.
 */

export const stoneVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const stoneFragmentShader = `
  uniform float uTime;
  uniform float uWeathering; // 0.0 = pristine, 1.0 = crumbling
  uniform vec3 uLightPosition;
  uniform vec3 uLightColor;
  uniform float uLightIntensity;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
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
  
  void main() {
    // Gothic Basalt Palette (High contrast, clearly visible relief)
    vec3 stoneBase = vec3(0.24, 0.23, 0.27);
    vec3 stoneHighlight = vec3(0.44, 0.41, 0.40);
    
    // Procedural stone grain
    float scale = 6.0;
    float noise1 = snoise(vPosition * scale) * 0.5 + 0.5;
    float noise2 = snoise(vPosition * scale * 2.5) * 0.5 + 0.5;
    float grain = mix(noise1, noise2, 0.55);
    
    vec3 stoneColor = mix(stoneBase, stoneHighlight, grain);
    
    // Weathering cracks
    float crackNoise = snoise(vPosition * 12.0 + vec3(uTime * 0.04));
    float cracks = smoothstep(0.70, 0.85, crackNoise) * uWeathering;
    stoneColor = mix(stoneColor, vec3(0.12, 0.10, 0.12), cracks * 0.8);
    
    // Ancient Lichen & Moss Decay
    float mossNoise = snoise(vPosition * 8.0);
    float moss = smoothstep(0.55, 0.85, mossNoise) * uWeathering * 0.6;
    vec3 mossColor = vec3(0.16, 0.28, 0.14); // Visible forest-rot emerald
    stoneColor = mix(stoneColor, mossColor, moss);
    
    // Living Flesh-Stone Fusion (pulsing blood veins running through ancient stone)
    float veinNoise = snoise(vPosition * 14.0 + vec3(0.0, 0.0, uTime * 0.15));
    float veins = smoothstep(0.72, 0.88, veinNoise) * (0.2 + 0.8 * uWeathering);
    float veinPulse = sin(uTime * 2.8) * 0.5 + 0.5;
    vec3 fleshCrimson = vec3(0.85, 0.10, 0.15); // Sacrificial crimson
    vec3 veinEmissive = fleshCrimson * veins * (0.7 + 0.5 * veinPulse);
    
    // Dynamic lighting from torchlight cursor
    vec3 lightDir = normalize(uLightPosition - vPosition);
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    
    // Attenuation
    float distance = length(uLightPosition - vPosition);
    float attenuation = 1.0 / (1.0 + 0.08 * distance + 0.008 * distance * distance);
    
    // Specular highlight (wet stone sheen)
    vec3 viewDir = normalize(-vPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(vNormal, halfDir), 0.0), 24.0) * 0.35;
    
    // Dramatic Rim Lighting (Gothic silhouette definition)
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = smoothstep(0.55, 1.0, rim);
    vec3 rimGlow = mix(vec3(0.55, 0.18, 0.30), vec3(1.0, 0.60, 0.25), diffuse) * rim * 0.45;
    
    // Ambient Occlusion
    float ao = 1.0 - (cracks * 0.4);
    
    // Balanced lighting: Generous ambient ensures details are clearly visible!
    vec3 ambient = stoneColor * 0.42; 
    vec3 lit = stoneColor * diffuse * uLightColor * uLightIntensity * attenuation * ao;
    vec3 spec = uLightColor * specular * attenuation;
    
    // Inner demonic crack glow when weathered
    vec3 crackGlow = vec3(1.0, 0.35, 0.05) * cracks * uWeathering * (0.6 + 0.4 * sin(uTime * 3.5));
    
    vec3 finalColor = ambient + lit + spec + veinEmissive + rimGlow + crackGlow;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
