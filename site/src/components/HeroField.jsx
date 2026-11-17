import { useEffect, useRef } from 'react'

// Original, lightweight WebGL backdrop for the hero only (never behind charts).
// Slow contour lines over film grain, near-black, so text stays the loudest thing.
// Pauses off-screen and in background tabs, caps DPR at 2, shows a still frame
// under prefers-reduced-motion, and falls back to plain CSS if WebGL is missing.
const FRAG = `
precision mediump float;
uniform vec2 r; uniform float t;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int k=0;k<5;k++){ v+=a*n(p); p*=2.02; a*=.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / r.xy;
  vec2 p = uv * vec2(r.x/r.y, 1.) * 2.2;
  float f = fbm(p + vec2(t*.018, -t*.011)) + .35*fbm(p*1.7 - t*.02);
  float lines = abs(fract(f*9.) - .5);
  float contour = smoothstep(.045, .0, lines) * .14;
  float glow = smoothstep(1.1, .1, distance(uv, vec2(.82, .9))) * .10;   // faint blue, top right
  vec3 c = vec3(.043) + contour * vec3(.55,.62,.75) + glow * vec3(.22,.53,.9);
  c += (h(gl_FragCoord.xy + t) - .5) * .035;                              // grain
  c *= smoothstep(0., .35, uv.y);                                         // fade into page
  c = mix(vec3(.043), c, mix(.45, 1., smoothstep(.1, .8, uv.x)));        // calmer behind the copy
  gl_FragColor = vec4(c, 1.);
}`
const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }'

export default function HeroField({ className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl) return
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s }
    const prog = gl.createProgram()
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog); gl.useProgram(prog)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't')

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0, visible = true, start = performance.now()
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const draw = (now) => {
      gl.uniform2f(uR, canvas.width, canvas.height)
      gl.uniform1f(uT, reduced ? 12 : (now - start) / 1000)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(draw)
    }
    const kick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick() })
    io.observe(canvas)
    const onVis = () => !document.hidden && kick()
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', () => { resize(); kick() })
    resize(); kick()
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return <canvas ref={ref} aria-hidden="true" className={`h-full w-full bg-ink ${className}`} />
}
