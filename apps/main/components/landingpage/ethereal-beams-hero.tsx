"use client"

import type React from "react"
import { useRef, useMemo } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import { degToRad } from "three/src/math/MathUtils.js"
import { 
    Terminal, Cpu, Network, ShieldCheck, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSession } from '@repo/auth'
import { useRouter } from "next/navigation"

// --- THREE.JS CONFIGURATION (UNCHANGED) ---
const CanvasWrapper = ({ children }: { children: React.ReactNode }) => (
    <Canvas dpr={[1, 2]} frameloop="always" className="w-full h-full relative">
        {children}
    </Canvas>
)

const hexToNormalizedRGB = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "")
    const r = Number.parseInt(clean.substring(0, 2), 16)
    const g = Number.parseInt(clean.substring(2, 4), 16)
    const b = Number.parseInt(clean.substring(4, 6), 16)
    return [r / 255, g / 255, b / 255]
}

const noise = `
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);} 
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;} 
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);} 
float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
  return 2.2 * n_xyz;
}
`

type UniformValue = THREE.IUniform<unknown> | unknown
interface ExtendMaterialConfig {
    header: string
    vertexHeader?: string
    fragmentHeader?: string
    material?: THREE.MeshPhysicalMaterialParameters & { fog?: boolean }
    uniforms?: Record<string, UniformValue>
    vertex?: Record<string, string>
    fragment?: Record<string, string>
}

type ShaderWithDefines = THREE.ShaderLibShader & { defines?: Record<string, string | number | boolean> }

function extendMaterial<T extends THREE.Material = THREE.Material>(
    BaseMaterial: new (params?: THREE.MaterialParameters) => T,
    cfg: ExtendMaterialConfig,
): THREE.ShaderMaterial {
    const physical = THREE.ShaderLib.physical as ShaderWithDefines
    const { vertexShader: baseVert, fragmentShader: baseFrag, uniforms: baseUniforms } = physical
    const baseDefines = physical.defines ?? {}
    const uniforms: Record<string, THREE.IUniform> = THREE.UniformsUtils.clone(baseUniforms)
    const defaults = new BaseMaterial(cfg.material || {}) as T & {
        color?: THREE.Color
        roughness?: number
        metalness?: number
        envMap?: THREE.Texture
        envMapIntensity?: number
    }
    if (defaults.color) uniforms.diffuse.value = defaults.color
    if ("roughness" in defaults) uniforms.roughness.value = (defaults as any).roughness
    if ("metalness" in defaults) uniforms.metalness.value = (defaults as any).metalness
    if ("envMap" in defaults) uniforms.envMap.value = (defaults as any).envMap
    if ("envMapIntensity" in defaults) uniforms.envMapIntensity.value = (defaults as any).envMapIntensity
    Object.entries(cfg.uniforms ?? {}).forEach(([key, u]) => {
        uniforms[key] = u !== null && typeof u === "object" && "value" in (u as any)
            ? (u as THREE.IUniform<unknown>)
            : ({ value: u } as THREE.IUniform<unknown>)
    })
    let vert = `${cfg.header}\n${cfg.vertexHeader ?? ""}\n${baseVert}`
    let frag = `${cfg.header}\n${cfg.fragmentHeader ?? ""}\n${baseFrag}`
    for (const [inc, code] of Object.entries(cfg.vertex ?? {})) {
        vert = vert.replace(inc, `${inc}\n${code}`)
    }
    for (const [inc, code] of Object.entries(cfg.fragment ?? {})) {
        frag = frag.replace(inc, `${inc}\n${code}`)
    }
    return new THREE.ShaderMaterial({
        defines: { ...baseDefines },
        uniforms,
        vertexShader: vert,
        fragmentShader: frag,
        lights: true,
        fog: !!cfg.material?.fog,
    })
}

function createStackedPlanesBufferGeometry(
    n: number,
    width: number,
    height: number,
    spacing: number,
    heightSegments: number,
): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry()
    const numVertices = n * (heightSegments + 1) * 2
    const numFaces = n * heightSegments * 2
    const positions = new Float32Array(numVertices * 3)
    const indices = new Uint32Array(numFaces * 3)
    const uvs = new Float32Array(numVertices * 2)
    let vertexOffset = 0
    let indexOffset = 0
    let uvOffset = 0
    const totalWidth = n * width + (n - 1) * spacing
    const xOffsetBase = -totalWidth / 2
    for (let i = 0; i < n; i++) {
        const xOffset = xOffsetBase + i * (width + spacing)
        const uvXOffset = Math.random() * 300
        const uvYOffset = Math.random() * 300
        for (let j = 0; j <= heightSegments; j++) {
            const y = height * (j / heightSegments - 0.5)
            const v0 = [xOffset, y, 0]
            const v1 = [xOffset + width, y, 0]
            positions.set([...v0, ...v1], vertexOffset * 3)
            const uvY = j / heightSegments
            uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOffset)
            if (j < heightSegments) {
                const a = vertexOffset, b = vertexOffset + 1, c = vertexOffset + 2, d = vertexOffset + 3
                indices.set([a, b, c, c, b, d], indexOffset)
                indexOffset += 6
            }
            vertexOffset += 2
            uvOffset += 4
        }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    geometry.computeVertexNormals()
    return geometry
}

const MergedPlanes = ({
    material,
    width,
    count,
    height,
}: {
    material: THREE.ShaderMaterial
    width: number
    count: number
    height: number
}) => {
    const mesh = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null!)
    const geometry = useMemo(() => createStackedPlanesBufferGeometry(count, width, height, 0, 100), [count, width, height])
    useFrame((_, delta) => {
        mesh.current.material.uniforms.time.value += 0.1 * delta
    })
    return <mesh ref={mesh} geometry={geometry} material={material} />
}

const DirLight = ({ position, color }: { position: [number, number, number]; color: string }) => {
    return <directionalLight color={color} intensity={1} position={position} />
}

const Beams = ({
    beamWidth = 2.5,
    beamHeight = 18,
    beamNumber = 15,
    lightColor = "#ffffff",
    speed = 2.5,
    noiseIntensity = 2,
    scale = 0.15,
    rotation = 43,
}: {
    beamWidth?: number
    beamHeight?: number
    beamNumber?: number
    lightColor?: string
    speed?: number
    noiseIntensity?: number
    scale?: number
    rotation?: number
}) => {
    const beamMaterial = useMemo(
        () =>
            extendMaterial(THREE.MeshStandardMaterial, {
                header: `
  varying vec3 vEye; varying float vNoise; varying vec2 vUv; varying vec3 vPosition;
  uniform float time; uniform float uSpeed; uniform float uNoiseIntensity; uniform float uScale; ${noise}`,
                vertexHeader: `
  float getPos(vec3 pos) { vec3 noisePos = vec3(pos.x * 0., pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale; return cnoise(noisePos); }
  vec3 getCurrentPos(vec3 pos) { vec3 newpos = pos; newpos.z += getPos(pos); return newpos; }
  vec3 getNormal(vec3 pos) { vec3 curpos = getCurrentPos(pos); vec3 nX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0)); vec3 nZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0)); vec3 tX = normalize(nX - curpos); vec3 tZ = normalize(nZ - curpos); return normalize(cross(tZ, tX)); }`,
                fragmentHeader: "",
                vertex: {
                    "#include <begin_vertex>": `transformed.z += getPos(transformed.xyz);`,
                    "#include <beginnormal_vertex>": `objectNormal = getNormal(position.xyz);`,
                },
                fragment: {
                    "#include <dithering_fragment>": ` float randN = noise(gl_FragCoord.xy); gl_FragColor.rgb -= randN / 15. * uNoiseIntensity;`,
                },
                material: { fog: true },
                uniforms: {
                    diffuse: new THREE.Color(...hexToNormalizedRGB("#000000")),
                    time: { value: 0 },
                    roughness: 0.3,
                    metalness: 0.3,
                    uSpeed: { value: speed },
                    envMapIntensity: 10,
                    uNoiseIntensity: noiseIntensity,
                    uScale: scale,
                },
            }),
        [speed, noiseIntensity, scale]
    )
    return (
        <CanvasWrapper>
            <group rotation={[0, 0, degToRad(rotation)]}>
                <MergedPlanes material={beamMaterial} count={beamNumber} width={beamWidth} height={beamHeight} />
                <DirLight color={lightColor} position={[0, 3, 10]} />
            </group>
            <ambientLight intensity={1} />
            <color attach="background" args={["#000000"]} />
            <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
        </CanvasWrapper>
    )
}

// --- MAIN COMPONENT ---
export default function EtherealBeamsHero() {
    const { data: session } = useSession()
    const router = useRouter()

    const handleAuthenticatedAction = (targetUrl: string) => {
        if (session) {
            router.push(targetUrl);
        } else {
            router.push('/signin');
        }
    }

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black selection:bg-neutral-800">
            <div className="absolute inset-0 z-0">
                <Beams />
            </div>
            <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center pt-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-1.5 text-xs font-mono text-white/70 uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            System Operational
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                            The Engineering <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-400 to-neutral-600">
                                Intelligence Suite.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl leading-relaxed text-neutral-400 max-w-2xl mx-auto mb-10 font-light">
                            Master system design, open source contribution, and full-stack architecture with a suite of specialized AI agents designed for serious developers.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Button
                                onClick={() => handleAuthenticatedAction("/explore")}
                                className="h-14 px-8 text-base rounded-full bg-white text-black hover:bg-neutral-200 font-semibold transition-all"
                            >
                                <Terminal className="mr-2 h-5 w-5" />
                                Initialize Environment
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => scrollToSection("pricing")}
                                className="h-14 px-8 text-base rounded-full border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
                            >
                                View Compute Pricing
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/10 pt-10">
                            {
                                [
                                    { label: "Active Nodes", value: "2.4k", icon: Network },
                                    { label: "Code Reviews", value: "15k+", icon: ShieldCheck },
                                    { label: "Latency", value: "<50ms", icon: Zap },
                                    { label: "Uptime", value: "99.9%", icon: Cpu },
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center p-4 rounded-xl hover:bg-white/5 transition-colors">
                                        <stat.icon className="w-5 h-5 text-neutral-500 mb-2" />
                                        <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                                        <div className="text-xs text-neutral-500 uppercase tracking-widest mt-1">{stat.label}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-0" />
        </div>
    )
}