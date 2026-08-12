import { useEffect, useRef } from 'react'

export interface HalftoneSettings {
  /** Base dot diameter, in CSS pixels (1–20). */
  dotSize?: number
  /** Luminance contrast multiplier (0.1–3). */
  contrast?: number
  /** Dot-edge blur amount (0–1). */
  dotSoftness?: number
  /** RGBA value for dots, expressed from 0–1. */
  darkColor?: readonly [number, number, number, number]
  /** RGBA value for the paper/background, expressed from 0–1. */
  lightColor?: readonly [number, number, number, number]
  /** Extra gap between dots, as a fraction of dot size (0–1). */
  dotSpacing?: number
  /** Radius of the pointer's local shader influence, in CSS pixels. */
  mouseRadius?: number
  /** Strength of the pointer's local shader influence (0–1). */
  mouseStrength?: number
}

interface HalftoneBackgroundProps extends HalftoneSettings {
  /** Source image to process. Swap this value to use the shader with another background. */
  src: string
  className?: string
}

const defaults: Required<HalftoneSettings> = {
  dotSize: 6,
  contrast: 1.2,
  dotSoftness: 0.33,
  darkColor: [0, 0.24705882370471954, 1, 1],
  lightColor: [0.6924276351928711, 0.34823843836784363, 1, 1],
  dotSpacing: 0.3,
  mouseRadius: 600,
  mouseStrength: 0.3,
}

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision highp float;

  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform float u_pixelRatio;
  uniform float u_dotSize;
  uniform float u_contrast;
  uniform float u_dotSoftness;
  uniform float u_dotSpacing;
  uniform vec2 u_pointer;
  uniform float u_pointerActive;
  uniform float u_mouseRadius;
  uniform float u_mouseStrength;
  uniform vec4 u_darkColor;
  uniform vec4 u_lightColor;

  void main() {
    float cellSize = u_dotSize * (1.0 + u_dotSpacing) * u_pixelRatio;
    vec2 cell = floor(gl_FragCoord.xy / cellSize);
    vec2 cellCenter = (cell + 0.5) * cellSize;
    vec2 sampleUv = cellCenter / u_resolution;
    vec3 sampleColor = texture2D(u_image, sampleUv).rgb;
    float influenceRadius = u_mouseRadius * u_pixelRatio;
    float distanceToPointer = distance(gl_FragCoord.xy, u_pointer * u_resolution);
    float pointerInfluence = 1.0 - smoothstep(influenceRadius * 0.55, influenceRadius, distanceToPointer);
    pointerInfluence *= u_pointerActive * u_mouseStrength;

    float luminance = dot(sampleColor, vec3(0.299, 0.587, 0.114));
    float localContrast = mix(u_contrast, u_contrast * 1.6, pointerInfluence);
    luminance = clamp((luminance - 0.5) * localContrast + 0.5, 0.0, 1.0);

    float maximumRadius = u_dotSize * u_pixelRatio * 0.5;
    float radius = (1.0 - luminance) * maximumRadius * mix(1.0, 1.55, pointerInfluence);
    float distanceToCenter = distance(gl_FragCoord.xy, cellCenter);
    float localSoftness = mix(u_dotSoftness, min(1.0, u_dotSoftness + 0.3), pointerInfluence);
    float edgeWidth = mix(0.001, max(1.0, radius), localSoftness);
    float dotMask = 1.0 - smoothstep(radius - edgeWidth, radius + edgeWidth, distanceToCenter);

    gl_FragColor = mix(u_lightColor, u_darkColor, dotMask);
  }
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Unable to create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Unable to compile shader')
  }
  return shader
}

/** A static, reusable two-colour halftone shader for image-based backgrounds. */
export function HalftoneBackground({ src, className, ...settings }: HalftoneBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) return

    let disposed = false
    let frame = 0
    let draw: (() => void) | undefined
    const image = new Image()

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      const isInside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom
      pointerRef.current = {
        x: (event.clientX - bounds.left) / bounds.width,
        y: 1 - (event.clientY - bounds.top) / bounds.height,
        active: isInside,
      }
      draw?.()
    }

    const clearPointer = () => {
      pointerRef.current.active = false
      draw?.()
    }

    const setup = () => {
      if (disposed || !image.complete || !image.naturalWidth) return
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      const program = gl.createProgram()
      if (!program) return
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
      const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

      const texture = gl.createTexture()
      const buffer = gl.createBuffer()
      if (!texture || !buffer) return

      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
      const position = gl.getAttribLocation(program, 'a_position')
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      const values = { ...defaults, ...settings }
      const uniform = (name: string) => gl.getUniformLocation(program, name)
      draw = () => {
        if (disposed) return
        const { width, height } = canvas.getBoundingClientRect()
        const outputWidth = Math.max(1, Math.round(width * pixelRatio))
        const outputHeight = Math.max(1, Math.round(height * pixelRatio))
        if (canvas.width !== outputWidth || canvas.height !== outputHeight) {
          canvas.width = outputWidth
          canvas.height = outputHeight
        }

        gl.viewport(0, 0, outputWidth, outputHeight)
        gl.useProgram(program)
        gl.uniform1i(uniform('u_image'), 0)
        gl.uniform2f(uniform('u_resolution'), outputWidth, outputHeight)
        gl.uniform1f(uniform('u_pixelRatio'), pixelRatio)
        gl.uniform1f(uniform('u_dotSize'), values.dotSize)
        gl.uniform1f(uniform('u_contrast'), values.contrast)
        gl.uniform1f(uniform('u_dotSoftness'), values.dotSoftness)
        gl.uniform1f(uniform('u_dotSpacing'), values.dotSpacing)
        gl.uniform2f(uniform('u_pointer'), pointerRef.current.x, pointerRef.current.y)
        gl.uniform1f(uniform('u_pointerActive'), pointerRef.current.active ? 1 : 0)
        gl.uniform1f(uniform('u_mouseRadius'), values.mouseRadius)
        gl.uniform1f(uniform('u_mouseStrength'), values.mouseStrength)
        gl.uniform4fv(uniform('u_darkColor'), values.darkColor)
        gl.uniform4fv(uniform('u_lightColor'), values.lightColor)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }

      draw()
    }

    image.onload = () => setup()
    image.src = src
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => draw?.())
    })
    observer.observe(canvas)
    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('blur', clearPointer)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('blur', clearPointer)
    }
  }, [src, settings.dotSize, settings.contrast, settings.dotSoftness, settings.darkColor, settings.lightColor, settings.dotSpacing, settings.mouseRadius, settings.mouseStrength])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
