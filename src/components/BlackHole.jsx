import { useEffect, useRef } from 'react'

// Fullscreen WebGL background with a procedural starfield, clustered galaxies,
// layered nebula, and a sharply defined black hole. Pointer movement only adds
// gentle scene parallax; the local lens never moves or captures the cursor.

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;   // smoothed, 0..1, y up - drives parallax only
uniform vec2  uCursor;  // exact pointer position, 0..1, y up
uniform float uVel;     // smoothed pointer speed, 0..1

const float RS = 0.150; // event-horizon radius in screen units

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float softNoise(vec2 p) {
  float n = 0.0;
  n += 0.42 * sin(dot(p, vec2(1.73, 2.41)) + uTime * 0.012);
  n += 0.31 * sin(dot(p, vec2(-2.67, 1.36)) + 1.9 - uTime * 0.008);
  n += 0.20 * cos(dot(p, vec2(4.12, -2.18)) + 0.7);
  n += 0.12 * sin(length(p + vec2(1.8, -0.9)) * 4.2 - uTime * 0.01);
  return 0.5 + 0.5 * n;
}

float nebulaField(vec2 p) {
  vec2 w = p + 0.08 * vec2(sin(p.y * 2.2 + 0.6), cos(p.x * 1.8 - 0.4));
  float a = softNoise(w * 1.25);
  float b = softNoise(w * 2.35 + vec2(2.4, -1.7));
  float c = softNoise(w * 4.0 + vec2(-3.1, 2.2));
  return clamp(a * 0.58 + b * 0.30 + c * 0.12, 0.0, 1.0);
}

float starLayer(vec2 uv, float density, float thresh) {
  vec2 g = uv * density;
  vec2 cell = floor(g);
  vec2 f = fract(g);
  float h = hash21(cell);
  if (h < thresh) return 0.0;
  vec2 pos = vec2(hash21(cell + 7.31), hash21(cell + 3.17)) * 0.6 + 0.2;
  float d = length(f - pos);
  float tw = 0.55 + 0.45 * sin(uTime * (0.8 + h * 2.5) + h * 61.0);
  // tight falloff = pinpoint-sharp stars at native resolution
  float star = smoothstep(0.12, 0.0, d);
  return star * star * star * tw * (0.5 + 0.7 * h);
}

// distant galaxy: anisotropic glowing core with two faint spiral arms
vec3 galaxy(vec2 q, vec2 pos, float ang, float squash, vec3 tint) {
  vec2 d = q - pos;
  float ca = cos(ang);
  float sa = sin(ang);
  d = mat2(ca, -sa, sa, ca) * d;
  d.y *= squash;
  float r = length(d);
  float a = atan(d.y, d.x);
  float arms = 1.0 + 0.45 * cos(a * 2.0 - r * 22.0);
  // sharp gaussian nucleus + core glow + faint spiral arms
  float glow = exp(-r * r * 2600.0) * 2.6 + exp(-r * 30.0) * 1.6 + exp(-r * 9.0) * 0.35 * arms;
  return tint * glow;
}

vec3 cluster(vec2 q, vec2 pos, float size, vec3 tint) {
  vec2 d = q - pos;
  float r = length(d);
  float core = exp(-r * size) * 0.75 + exp(-r * r * 3200.0) * 0.8;
  float halo = exp(-r * size * 0.22) * 0.12;
  float sparkle = starLayer(q * 1.5 + pos * 17.0, 38.0, 0.72) * smoothstep(0.24, 0.03, r);
  return tint * (core + halo) + vec3(0.8, 0.9, 1.0) * sparkle * 0.65;
}

// a packet of hot gas orbiting the disk at a given radius and speed
float hotspot(float ang, float rd, float orbitR, float width, float phase, float speed) {
  float a = ang + phase - uTime * speed;
  a = mod(a + 3.14159265, 6.2831853) - 3.14159265;
  float arc = exp(-a * a * 10.0);
  float radial = exp(-pow((rd - orbitR) / width, 2.0));
  return arc * radial;
}

// "detail" fades the point stars out where the lens stretches space hardest,
// so they never smear into broken hairlines near the hole
vec3 sky(vec2 q, float detail) {
  float n1 = nebulaField(q + vec2(uTime * 0.004, 0.0));
  float n2 = nebulaField(q * 1.65 + vec2(-1.6, 1.25) - vec2(0.0, uTime * 0.003));

  float s = 0.0;
  s += starLayer(q * 0.7 + vec2(5.2, 17.9), 8.0, 0.93) * 1.5; // rare bright beacons
  s += starLayer(q + vec2(12.4, 33.2), 14.0, 0.76);
  s += starLayer(q * 1.8 + vec2(41.1, 7.7), 20.0, 0.80) * 0.7;
  s += starLayer(q * 2.6 + vec2(9.3, 54.2), 30.0, 0.80) * 0.5; // fine field
  s += starLayer(q * 3.4 + vec2(27.9, 3.4), 44.0, 0.82) * 0.35; // star dust
  // star clusters: a dense sprinkle gated to the bright nebula knots
  float clump = smoothstep(0.70, 0.90, n1);
  s += starLayer(q * 2.7 + vec2(57.7, 21.3), 34.0, 0.72) * clump * 0.8;
  s *= detail;

  // layered nebula: continuous wave fields, no cell boundaries or hard cuts
  vec3 col = vec3(0.011, 0.017, 0.043);
  float mist = smoothstep(0.24, 0.98, n1);
  float violet = smoothstep(0.42, 0.95, n2);
  float lane = exp(-pow((q.y + q.x * 0.28 + 0.08 + sin(q.x * 3.6) * 0.018) * 2.65, 2.0));
  col += vec3(0.022, 0.033, 0.090) * mist;
  col += vec3(0.055, 0.032, 0.125) * violet * 0.62;
  col += vec3(0.024, 0.085, 0.130) * n1 * n2 * 0.36;
  col += vec3(0.060, 0.075, 0.170) * lane * (0.28 + n2 * 0.42);

  // colourful nebula clouds: the hue drifts across the sky, so different
  // regions glow pink, violet, cyan or amber
  float cloud = smoothstep(0.50, 0.95, nebulaField(q * 0.85 + vec2(4.5, -3.2)));
  vec3 hue = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + q.x * 1.1 + q.y * 0.7 + n2 * 2.6);
  col += hue * vec3(0.105, 0.080, 0.135) * cloud * (0.5 + n1 * 0.8);
  // second, finer cloud layer with its own palette phase
  float cloud2 = smoothstep(0.55, 0.95, nebulaField(q * 1.7 + vec2(-6.2, 2.9)));
  vec3 hue2 = 0.5 + 0.5 * cos(vec3(1.6, 3.7, 5.8) + q.y * 1.3 - q.x * 0.8 + n1 * 2.2);
  col += hue2 * vec3(0.070, 0.055, 0.095) * cloud2 * (0.4 + n2 * 0.7);

  col += vec3(0.75, 0.85, 1.0) * s;

  // distant galaxies — they warp with the lens like everything else
  col += galaxy(q, vec2(-0.62, 0.33), 0.6, 2.6, vec3(0.55, 0.62, 0.95)) * 0.34;
  col += galaxy(q, vec2(0.68, -0.26), -0.9, 3.2, vec3(0.85, 0.65, 0.95)) * 0.28;
  col += galaxy(q, vec2(0.16, 0.43), 1.9, 2.2, vec3(0.55, 0.85, 0.95)) * 0.22;
  col += galaxy(q, vec2(-0.85, -0.32), 2.3, 2.9, vec3(0.95, 0.75, 0.55)) * 0.26;
  col += galaxy(q, vec2(0.88, 0.35), -1.6, 2.4, vec3(0.60, 0.90, 1.00)) * 0.22;
  col += galaxy(q, vec2(-0.20, -0.44), 0.3, 3.6, vec3(0.75, 0.60, 1.00)) * 0.18;
  col += cluster(q, vec2(-0.42, -0.08), 16.0, vec3(0.55, 0.72, 1.0)) * 0.36;
  col += cluster(q, vec2(0.48, 0.24), 20.0, vec3(0.75, 0.55, 1.0)) * 0.28;
  col += cluster(q, vec2(0.05, -0.30), 22.0, vec3(0.95, 0.80, 0.60)) * 0.22;

  return col;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 mc = (uCursor - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  // hole sits slightly above centre and parallaxes gently against the cursor
  vec2 bh = vec2(0.0, 0.06) - m * 0.055;
  vec2 d = p - bh;
  float r = length(d);

  // gravitational lensing: beta = theta * (1 - thetaE^2 / r^2)
  float te = RS * 2.08;
  float lensK = 1.0 - (te * te) / max(r * r, 1e-5);
  vec2 q = bh + d * lensK;

  // frame-drag swirl near the horizon
  float sw = 0.24 * exp(-r * 5.2);
  float cs = cos(sw);
  float sn = sin(sw);
  q = bh + mat2(cs, -sn, sn, cs) * (q - bh);

  // A compact cursor lens bends the surrounding sky without moving the ship
  // or deforming the event horizon and accretion disk.
  vec2 dm = p - mc;
  float rm = max(length(dm), 1e-4);
  float cursorFalloff = 1.0 - smoothstep(0.02, 0.34, rm);
  float cursorStrength = (0.0006 + uVel * 0.0030) / (rm * rm * 14.0 + 0.072);
  q -= (dm / rm) * cursorStrength * cursorFalloff;

  // The event horizon stays geometrically stable as the pointer moves.
  vec2 dh = d;
  float rh = r;

  // soft-cap the total warp so sampling never stretches to infinity
  vec2 disp = q - p;
  float dmag = max(length(disp), 1e-6);
  float capped = 0.38 * dmag / (0.38 + dmag);
  q = p + disp * (capped / dmag);

  // fade point stars out of the extreme-stretch zone around the hole
  float starFade = smoothstep(RS * 1.15, RS * 2.7, r);

  vec3 col = sky(q, starFade);

  // event-horizon shadow: pure black core with a pixel-sharp round edge,
  // anti-aliased over roughly one rendered pixel
  float aa = 1.0 / uRes.y;
  float shadow = smoothstep(RS - aa, RS + aa, rh);
  float well = exp(-max(rh - RS, 0.0) * 9.5);
  col *= 1.0 - well * 0.14;
  col *= shadow;

  // Thin, structured accretion disk with crisp radial bands and a controlled
  // outer falloff. Integer angular harmonics keep the texture seam-free.
  vec2 dd = vec2(dh.x, dh.y * 4.4);
  float ca = cos(-0.26);
  float sa = sin(-0.26);
  dd = mat2(ca, -sa, sa, ca) * dd;
  float rd = length(dd);
  float innerDisk = smoothstep(RS * 1.02, RS * 1.15, rd);
  float outerDisk = 1.0 - smoothstep(RS * 3.45, RS * 4.05, rd);
  float dmask = innerDisk * outerDisk;

  if (dmask > 0.002) {
    float ang = atan(dd.y, dd.x);
    float radialBands = 0.5 + 0.5 * sin(rd * 78.0 - uTime * 0.22 + sin(ang * 4.0) * 0.7);
    float spiral = 0.5 + 0.5 * sin(ang * 4.0 + 11.0 / (rd + 0.05) + rd * 22.0 + uTime * 0.15);
    spiral = smoothstep(0.18, 0.88, spiral);
    float fine = 0.72 + 0.28 * smoothstep(0.20, 0.82, radialBands);
    float doppler = 1.0 + 0.48 * sin(ang + 0.9);
    float hot = 1.0 - smoothstep(RS * 1.18, RS * 3.55, rd);
    vec3 diskCol = mix(vec3(0.14, 0.34, 0.92), vec3(1.15, 0.94, 0.72), hot);
    float texture = (0.46 + 1.08 * spiral) * fine;
    col += diskCol * dmask * texture * doppler * shadow;

    float hs = 0.0;
    hs += hotspot(ang, rd, RS * 1.38, RS * 0.13, 0.0, 0.55);
    hs += hotspot(ang, rd, RS * 1.95, RS * 0.18, 2.4, 0.38) * 0.72;
    hs += hotspot(ang, rd, RS * 2.65, RS * 0.22, 4.4, 0.26) * 0.48;
    hs *= max(0.0, 0.48 + 0.64 * sin(ang + 0.9));
    col += vec3(1.08, 1.04, 0.92) * hs * dmask * shadow * 0.92;
  }

  // photon ring and restrained ambient glow
  float ringW = max(RS * 0.014, 1.25 / uRes.y);
  float ring = exp(-pow((rh - RS * 1.035) / ringW, 2.0));
  float halo = exp(-pow((rh - RS * 1.30) / (RS * 0.19), 2.0));
  col += vec3(1.28, 1.40, 1.70) * ring * 1.95;
  col += vec3(0.22, 0.48, 1.00) * halo * 0.24 * shadow;
  col += vec3(0.18, 0.32, 0.72) * exp(-rh * 4.8) * 0.12 * shadow;


  // vignette + animated dither against banding
  float vig = 1.0 - 0.30 * dot(p * vec2(0.75, 1.0), p * vec2(0.75, 1.0));
  col *= vig;
  // keep the horizon rim grain-free: dither only well outside the edge
  col += (hash21(gl_FragCoord.xy + vec2(uTime)) - 0.5) * (3.5 / 255.0) *
    smoothstep(RS * 1.02, RS * 1.3, rh);

  gl_FragColor = vec4(col, 1.0);
}
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('BlackHole shader error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function BlackHole() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    })
    if (!gl) {
      document.documentElement.classList.add('no-webgl')
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let program = null
    let uniforms = {}
    let raf = 0
    let disposed = false
    let contextLost = false

    const getBaseScale = () => {
      const dpr = window.devicePixelRatio || 1
      if (window.innerWidth <= 640) return Math.min(dpr, 0.82)
      if (window.innerWidth <= 960) return Math.min(dpr, 1)
      return Math.min(dpr, 1.08)
    }
    // The background changes slowly, so 30-42fps keeps motion calm and saves
    // substantial GPU work while retaining one rendered pixel per CSS pixel.
    const getFrameInterval = () => (window.innerWidth <= 768 ? 32 : 24)

    let quality = 1
    let scale = getBaseScale()
    let frameInterval = getFrameInterval()
    let slowFrames = 0
    let lastTime = performance.now()
    let lastDraw = 0

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const cursor = { x: 0.5, y: 0.5 }
    let lastClient = null
    let velocity = 0
    let velocityTarget = 0

    function initGL() {
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
      if (!vs || !fs) {
        document.documentElement.classList.add('no-webgl')
        return false
      }
      program = gl.createProgram()
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('BlackHole link error:', gl.getProgramInfoLog(program))
        document.documentElement.classList.add('no-webgl')
        return false
      }
      gl.useProgram(program)

      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(program, 'aPos')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

      uniforms = {
        res: gl.getUniformLocation(program, 'uRes'),
        time: gl.getUniformLocation(program, 'uTime'),
        mouse: gl.getUniformLocation(program, 'uMouse'),
        cursor: gl.getUniformLocation(program, 'uCursor'),
        velocity: gl.getUniformLocation(program, 'uVel'),
      }
      return true
    }

    function resize() {
      const w = Math.max(1, Math.round(window.innerWidth * scale))
      const h = Math.max(1, Math.round(window.innerHeight * scale))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    function drawFrame(now) {
      gl.uniform2f(uniforms.res, canvas.width, canvas.height)
      gl.uniform1f(uniforms.time, now * 0.001)
      gl.uniform2f(uniforms.mouse, mouse.x, mouse.y)
      gl.uniform2f(uniforms.cursor, cursor.x, cursor.y)
      gl.uniform1f(uniforms.velocity, velocity)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    function loop(now) {
      if (disposed || contextLost) return
      const dt = Math.min(64, now - lastTime)
      lastTime = now

      const ease = 1 - Math.pow(0.94, dt / 16.67)
      mouse.x += (mouse.tx - mouse.x) * ease
      mouse.y += (mouse.ty - mouse.y) * ease
      velocity += (velocityTarget - velocity) * ease
      velocityTarget *= Math.pow(0.88, dt / 16.67)

      if (lastDraw === 0 || now - lastDraw >= frameInterval) {
        const drawDt = lastDraw === 0 ? 16.7 : now - lastDraw
        lastDraw = now

        // degrade gracefully on slow machines: render smaller first,
        // and only drop to 30fps as a last resort
        const budget = Math.max(frameInterval, 16.7) + 10
        if (drawDt > budget && drawDt < 220) slowFrames++
        else slowFrames = Math.max(0, slowFrames - 1)
        if (slowFrames > 20) {
          slowFrames = 0
          if (quality > 0.6) {
            quality *= 0.8
            scale = getBaseScale() * quality
            resize()
          } else if (frameInterval < 31) {
            frameInterval = 31
          }
        }

        drawFrame(now)
      }
      raf = requestAnimationFrame(loop)
    }

    function renderOnce() {
      if (disposed || contextLost || !program) return
      resize()
      drawFrame(performance.now())
    }

    function start() {
      cancelAnimationFrame(raf)
      lastTime = performance.now()
      lastDraw = 0
      if (reduced) renderOnce()
      else raf = requestAnimationFrame(loop)
    }

    if (!initGL()) return
    resize()
    start()

    const onPointerMove = (event) => {
      const nextX = event.clientX / window.innerWidth
      const nextY = 1 - event.clientY / window.innerHeight
      mouse.tx = nextX
      mouse.ty = nextY
      cursor.x = nextX
      cursor.y = nextY

      if (lastClient) {
        const distance = Math.hypot(
          event.clientX - lastClient.x,
          event.clientY - lastClient.y
        )
        velocityTarget = Math.min(1, Math.max(velocityTarget, distance / 46))
      }
      lastClient = { x: event.clientX, y: event.clientY }
    }

    const onResize = () => {
      frameInterval = getFrameInterval()
      scale = getBaseScale() * quality
      resize()
      if (reduced) renderOnce()
    }

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else {
        start()
      }
    }

    const onContextLost = (e) => {
      e.preventDefault()
      contextLost = true
      cancelAnimationFrame(raf)
    }
    const onContextRestored = () => {
      contextLost = false
      if (initGL()) {
        resize()
        start()
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
    }
  }, [])

  return <canvas ref={canvasRef} className="blackhole" aria-hidden="true" />
}
