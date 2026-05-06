import type { ColorSpaceId } from '$lib/types/color-space';

const VERT = /* glsl */ `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
	v_uv = a_position * 0.5 + 0.5;
	gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_lightness;       // 0-1 in the color space's native range
uniform int u_colorSpace;        // 0=CAM02p 1=OKLCH 2=LCH 3=HSL 4=HSV
uniform int u_outputGamut;       // 0=sRGB 1=Display P3
uniform float u_maxChroma;
uniform int u_showGamutBoundary; // 0=off 1=on

// ── Constants ──

const float PI = 3.14159265358979;

// sRGB gamma
vec3 srgb_gamma(vec3 linear) {
	return mix(
		12.92 * linear,
		1.055 * pow(linear, vec3(1.0 / 2.4)) - 0.055,
		step(0.0031308, linear)
	);
}

// XYZ (D65, 0-1 scale) → linear sRGB
const mat3 M_XYZ_sRGB = mat3(
	 3.2404541621, -0.9692660305,  0.0556434309,
	-1.5371385940,  1.8760108454, -0.2040259135,
	-0.4985314096,  0.0415560175,  1.0572251882
);

// XYZ (D65, 0-1 scale) → linear Display P3
const mat3 M_XYZ_P3 = mat3(
	 2.4934969119, -0.8294889696,  0.0358458302,
	-0.9313836179,  1.7626640603, -0.0761723893,
	-0.4027107845,  0.0236246858,  0.9568845240
);

vec3 xyz_to_rgb(vec3 xyz) {
	mat3 m = u_outputGamut == 1 ? M_XYZ_P3 : M_XYZ_sRGB;
	return m * xyz;
}

// ── CAM02p (JCh) → XYZ ──

const float CAM_Aw  = 34.86395780371521;
const float CAM_FL  = 0.584803571432196;
const float CAM_Nbb = 1.0003040045593807;
const float CAM_Ncb = 1.0003040045593807;
const float CAM_Nc  = 1.0;
const float CAM_c   = 0.69;
const float CAM_z   = 1.9272135954999579;
const float CAM_n   = 0.2;
const vec3  CAM_D   = vec3(1.0473696817305513, 0.96968946889798, 0.9289435247333704);

const mat3 M_HPE_to_CAT02 = mat3(
	 1.5591523979, -0.7143267176,  0.0107755117,
	-0.5447226797,  1.8503099729,  0.0052187662,
	-0.0144453098, -0.1359761120,  0.9840056143
);

const mat3 M_CAT02_inv = mat3(
	 1.0961238208,  0.4543690420, -0.0096276087,
	-0.2788690002,  0.4735331543, -0.0056980312,
	 0.1827451794,  0.0720978037,  1.0153256400
);

vec3 cam02p_to_xyz(float J, float C, float h) {
	if (J <= 0.0) return vec3(0.0);

	float hRad = radians(h);
	float sinH = sin(hRad);
	float cosH = cos(hRad);
	float J100 = J / 100.0;

	float t_base = C / (sqrt(J100) * pow(1.64 - pow(0.29, CAM_n), 0.73));
	float t = pow(t_base, 10.0 / 9.0);
	float et = 0.25 * (cos(hRad + 2.0) + 3.8);
	float A = CAM_Aw * pow(J100, 1.0 / (CAM_c * CAM_z));

	float p1 = (50000.0 / 13.0) * CAM_Nc * CAM_Ncb * et / t;
	float p2 = A / CAM_Nbb + 0.305;
	float q1 = p2 * (61.0 / 20.0) * (460.0 / 1403.0);
	float q2 = (61.0 / 20.0) * (220.0 / 1403.0);
	float q3 = (21.0 / 20.0) * (6300.0 / 1403.0) - 27.0 / 1403.0;

	float a, b;
	if (t == 0.0 || isinf(t)) {
		a = 0.0; b = 0.0;
	} else {
		float denom = p1 + q2 * cosH + q3 * sinH;
		a = (q1 * cosH) / denom;
		b = (q1 * sinH) / denom;
	}

	vec3 RGBa = vec3(
		(20.0/61.0)*p2 + (451.0/1403.0)*a + (288.0/1403.0)*b,
		(20.0/61.0)*p2 - (891.0/1403.0)*a - (261.0/1403.0)*b,
		(20.0/61.0)*p2 - (220.0/1403.0)*a - (6300.0/1403.0)*b
	);

	// Reverse adapted responses
	vec3 raw;
	for (int i = 0; i < 3; i++) {
		float x = RGBa[i] - 0.1;
		float s = sign(x);
		float ax = abs(x);
		raw[i] = s * (100.0 / CAM_FL) * pow(27.13 * ax / (400.0 - ax), 1.0 / 0.42);
	}

	vec3 RGBc = M_HPE_to_CAT02 * raw;
	vec3 undone = RGBc / CAM_D;
	vec3 XYZ = M_CAT02_inv * undone;

	return XYZ / 100.0;
}

// ── OKLCH → XYZ ──

const mat3 M_OKLAB_to_LMS = mat3(
	1.0, 1.0, 1.0,
	0.3963377774, -0.1055613458, -0.0894841775,
	0.2158037573, -0.0638541728, -1.2914855480
);

const mat3 M_LMS_to_XYZ = mat3(
	 1.2270138511, -0.0405801784,  -0.0763812845,
	-0.5577999807,  1.1122568696,  -0.4214819784,
	 0.2812561490, -0.0716766787,   1.5861632204
);

vec3 oklch_to_xyz(float L, float C, float h) {
	float a = C * cos(radians(h));
	float b = C * sin(radians(h));
	vec3 lab = vec3(L, a, b);
	vec3 lms_g = M_OKLAB_to_LMS * lab;
	vec3 lms = lms_g * lms_g * lms_g;
	return M_LMS_to_XYZ * lms;
}

// ── LCH → XYZ ──

vec3 lch_to_xyz(float L, float C, float h) {
	float a = C * cos(radians(h));
	float b = C * sin(radians(h));
	// LAB → XYZ (D65)
	float fy = (L + 16.0) / 116.0;
	float fx = a / 500.0 + fy;
	float fz = fy - b / 200.0;

	const float eps = 216.0 / 24389.0;
	const float kappa = 24389.0 / 27.0;

	float xr = fx * fx * fx > eps ? fx * fx * fx : (116.0 * fx - 16.0) / kappa;
	float yr = L > kappa * eps ? pow((L + 16.0) / 116.0, 3.0) : L / kappa;
	float zr = fz * fz * fz > eps ? fz * fz * fz : (116.0 * fz - 16.0) / kappa;

	// D65 white point
	return vec3(xr * 0.95047, yr, zr * 1.08883);
}

// ── HSL → RGB (direct) ──

vec3 hsl_to_rgb(float h, float s, float l) {
	float c = (1.0 - abs(2.0 * l - 1.0)) * s;
	float hp = h / 60.0;
	float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));
	vec3 rgb;
	if      (hp < 1.0) rgb = vec3(c, x, 0.0);
	else if (hp < 2.0) rgb = vec3(x, c, 0.0);
	else if (hp < 3.0) rgb = vec3(0.0, c, x);
	else if (hp < 4.0) rgb = vec3(0.0, x, c);
	else if (hp < 5.0) rgb = vec3(x, 0.0, c);
	else               rgb = vec3(c, 0.0, x);
	float m = l - c * 0.5;
	return rgb + m;
}

// ── HSV → RGB (direct) ──

vec3 hsv_to_rgb(float h, float s, float v) {
	float c = v * s;
	float hp = h / 60.0;
	float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));
	vec3 rgb;
	if      (hp < 1.0) rgb = vec3(c, x, 0.0);
	else if (hp < 2.0) rgb = vec3(x, c, 0.0);
	else if (hp < 3.0) rgb = vec3(0.0, c, x);
	else if (hp < 4.0) rgb = vec3(0.0, x, c);
	else if (hp < 5.0) rgb = vec3(x, 0.0, c);
	else               rgb = vec3(c, 0.0, x);
	float m = v - c;
	return rgb + m;
}

// ── Main ──

void main() {
	vec2 uv = v_uv * 2.0 - 1.0;
	float dist = length(uv);

	// Anti-aliased circular mask
	float aa = fwidth(dist);
	float mask = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, dist);
	if (mask <= 0.0) discard;

	float hue = degrees(atan(uv.y, uv.x));
	if (hue < 0.0) hue += 360.0;
	float chroma = dist * u_maxChroma;

	// ── Compute linear RGB before gamut clamp ──

	vec3 raw;
	if (u_colorSpace == 0) {
		raw = xyz_to_rgb(cam02p_to_xyz(u_lightness * 100.0, chroma, hue));
	} else if (u_colorSpace == 1) {
		raw = xyz_to_rgb(oklch_to_xyz(u_lightness, chroma, hue));
	} else if (u_colorSpace == 2) {
		raw = xyz_to_rgb(lch_to_xyz(u_lightness * 100.0, chroma, hue));
	} else if (u_colorSpace == 3) {
		raw = hsl_to_rgb(hue, chroma, u_lightness);
	} else {
		raw = hsv_to_rgb(hue, chroma, u_lightness);
	}

	vec3 rgb = srgb_gamma(clamp(raw, 0.0, 1.0));

	// ── Gamut boundary (XYZ-based spaces only; HSL/HSV are always in-gamut) ──

	if (u_showGamutBoundary == 1 && u_colorSpace < 3) {
		// margin > 0: inside gamut, margin < 0: outside gamut
		float margin = min(
			min(raw.r, 1.0 - raw.r),
			min(min(raw.g, 1.0 - raw.g), min(raw.b, 1.0 - raw.b))
		);
		float grad = fwidth(margin);
		float outer = 1.0 - smoothstep(0.0, grad * 5.0, abs(margin));
		float inner = 1.0 - smoothstep(0.0, grad * 2.0, abs(margin));
		rgb = mix(rgb, vec3(0.0), outer * 0.6);
		rgb = mix(rgb, vec3(1.0), inner * 0.75);
	}

	fragColor = vec4(rgb, mask);
}
`;

// ── Overlay: dots (instanced quads with circle SDF) ──

const DOT_VERT = /* glsl */ `#version 300 es
in vec2 a_quad;         // [-1, 1] quad corner
in vec2 a_center;       // pixel center (per-instance)
in vec3 a_color;        // per-instance color (gamma-encoded, in output gamut)
in float a_radius;      // per-instance radius in pixels
out vec2 v_local;
out vec3 v_color;
out float v_radius;
uniform vec2 u_resolution;
void main() {
	v_local = a_quad;
	v_color = a_color;
	v_radius = a_radius;
	// Expand quad by 1px on each side to leave room for AA fringe
	vec2 px = a_center + a_quad * (a_radius + 1.0);
	vec2 ndc = vec2(px.x / u_resolution.x * 2.0 - 1.0, 1.0 - px.y / u_resolution.y * 2.0);
	gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

const DOT_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_local;
in vec3 v_color;
in float v_radius;
out vec4 fragColor;
void main() {
	// v_local is in expanded-quad space [-1, 1], so convert to radius units
	float rExpanded = v_radius + 1.0;
	float dPx = length(v_local) * rExpanded;
	float aa = fwidth(dPx);
	float alpha = 1.0 - smoothstep(v_radius - aa, v_radius + aa, dPx);
	if (alpha <= 0.0) discard;
	// 2px white stroke along the edge
	float strokePx = 2.0;
	float strokeEdge = v_radius - strokePx;
	float t = smoothstep(strokeEdge - aa, strokeEdge + aa, dPx);
	vec3 col = mix(v_color, vec3(1.0), t);
	fragColor = vec4(col, alpha);
}
`;

// ── Overlay: lines (CPU-extruded triangle strips with dashing in FS) ──

const LINE_VERT = /* glsl */ `#version 300 es
in vec2 a_pos;          // pre-extruded pixel position
in float a_arclen;      // cumulative arclength along centerline
out float v_arclen;
uniform vec2 u_resolution;
void main() {
	v_arclen = a_arclen;
	vec2 ndc = vec2(a_pos.x / u_resolution.x * 2.0 - 1.0, 1.0 - a_pos.y / u_resolution.y * 2.0);
	gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

const LINE_FRAG = /* glsl */ `#version 300 es
precision highp float;
in float v_arclen;
out vec4 fragColor;
uniform vec4 u_color;
uniform float u_dashOn;    // pixels of "on" per dash cycle; 0 = solid
uniform float u_dashOff;   // pixels of "off" per dash cycle
void main() {
	if (u_dashOn > 0.0) {
		float period = u_dashOn + u_dashOff;
		float t = mod(v_arclen, period);
		if (t > u_dashOn) discard;
	}
	fragColor = u_color;
}
`;

export interface OverlayDot {
	x: number; // pixel coords
	y: number;
	color: [number, number, number]; // gamma-encoded in target gamut, 0-1
	radius?: number;
}

export interface OverlayLine {
	points: { x: number; y: number }[]; // pixel coords, centerline
	color: [number, number, number, number];
	width: number;
	dashOn?: number;
	dashOff?: number;
}

function buildLineStrip(
	points: { x: number; y: number }[],
	halfWidth: number
): { pos: Float32Array; arclen: Float32Array; count: number } | null {
	const n = points.length;
	if (n < 2) return null;
	const pos = new Float32Array(n * 4);
	const arclen = new Float32Array(n * 2);
	let acc = 0;
	for (let i = 0; i < n; i++) {
		const p = points[i];
		let tx: number, ty: number;
		if (i === 0) {
			tx = points[1].x - p.x;
			ty = points[1].y - p.y;
		} else if (i === n - 1) {
			tx = p.x - points[n - 2].x;
			ty = p.y - points[n - 2].y;
			acc += Math.hypot(p.x - points[n - 2].x, p.y - points[n - 2].y);
		} else {
			const pPrev = points[i - 1];
			const pNext = points[i + 1];
			const t1x = p.x - pPrev.x;
			const t1y = p.y - pPrev.y;
			const t2x = pNext.x - p.x;
			const t2y = pNext.y - p.y;
			const l1 = Math.hypot(t1x, t1y) || 1;
			const l2 = Math.hypot(t2x, t2y) || 1;
			tx = t1x / l1 + t2x / l2;
			ty = t1y / l1 + t2y / l2;
			acc += l1;
		}
		const tl = Math.hypot(tx, ty) || 1;
		const nx = -ty / tl;
		const ny = tx / tl;
		pos[i * 4 + 0] = p.x + nx * halfWidth;
		pos[i * 4 + 1] = p.y + ny * halfWidth;
		pos[i * 4 + 2] = p.x - nx * halfWidth;
		pos[i * 4 + 3] = p.y - ny * halfWidth;
		arclen[i * 2 + 0] = acc;
		arclen[i * 2 + 1] = acc;
	}
	return { pos, arclen, count: n * 2 };
}

const COLOR_SPACE_MAP: Record<string, { index: number; maxChroma: number }> = {
	cam02p: { index: 0, maxChroma: 120 },
	oklch: { index: 1, maxChroma: 0.322 },
	lch: { index: 2, maxChroma: 100 },
	hsl: { index: 3, maxChroma: 1 },
	hsv: { index: 4, maxChroma: 1 }
};

function getWheelSpaceId(id: ColorSpaceId): string {
	if (id === 'oklab') return 'oklch';
	if (id === 'lab') return 'lch';
	if (id === 'cam02p') return 'cam02p';
	return id;
}

export class WheelGLRenderer {
	private gl: WebGL2RenderingContext;
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private vbo: WebGLBuffer;
	private uniforms: Record<string, WebGLUniformLocation>;
	private supportsP3: boolean;

	// Dot overlay
	private dotProgram: WebGLProgram;
	private dotVao: WebGLVertexArrayObject;
	private dotQuadBuf: WebGLBuffer;
	private dotInstanceBuf: WebGLBuffer;
	private dotUniforms: Record<string, WebGLUniformLocation>;

	// Line overlay
	private lineProgram: WebGLProgram;
	private lineVao: WebGLVertexArrayObject;
	private linePosBuf: WebGLBuffer;
	private lineArclenBuf: WebGLBuffer;
	private lineUniforms: Record<string, WebGLUniformLocation>;

	constructor(canvas: HTMLCanvasElement) {
		const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
		if (!gl) throw new Error('WebGL2 not supported');
		this.gl = gl;

		this.supportsP3 = 'drawingBufferColorSpace' in gl;

		const vs = this.compileShader(gl.VERTEX_SHADER, VERT);
		const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAG);

		const program = gl.createProgram()!;
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program) ?? 'Link failed');
		}
		this.program = program;
		gl.deleteShader(vs);
		gl.deleteShader(fs);

		// Full-screen quad
		const vao = gl.createVertexArray()!;
		gl.bindVertexArray(vao);
		this.vbo = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			gl.STATIC_DRAW
		);
		const loc = gl.getAttribLocation(program, 'a_position');
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
		gl.bindVertexArray(null);
		this.vao = vao;

		this.uniforms = {
			u_lightness: gl.getUniformLocation(program, 'u_lightness')!,
			u_colorSpace: gl.getUniformLocation(program, 'u_colorSpace')!,
			u_outputGamut: gl.getUniformLocation(program, 'u_outputGamut')!,
			u_maxChroma: gl.getUniformLocation(program, 'u_maxChroma')!,
			u_showGamutBoundary: gl.getUniformLocation(program, 'u_showGamutBoundary')!
		};

		// ── Dot program ──
		this.dotProgram = this.linkProgram(DOT_VERT, DOT_FRAG);
		this.dotVao = gl.createVertexArray()!;
		gl.bindVertexArray(this.dotVao);

		this.dotQuadBuf = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.dotQuadBuf);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			gl.STATIC_DRAW
		);
		const aQuad = gl.getAttribLocation(this.dotProgram, 'a_quad');
		gl.enableVertexAttribArray(aQuad);
		gl.vertexAttribPointer(aQuad, 2, gl.FLOAT, false, 0, 0);

		this.dotInstanceBuf = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.dotInstanceBuf);
		const stride = 6 * 4; // center.xy + color.rgb + radius
		const aCenter = gl.getAttribLocation(this.dotProgram, 'a_center');
		const aColor = gl.getAttribLocation(this.dotProgram, 'a_color');
		const aRadius = gl.getAttribLocation(this.dotProgram, 'a_radius');
		gl.enableVertexAttribArray(aCenter);
		gl.vertexAttribPointer(aCenter, 2, gl.FLOAT, false, stride, 0);
		gl.vertexAttribDivisor(aCenter, 1);
		gl.enableVertexAttribArray(aColor);
		gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 2 * 4);
		gl.vertexAttribDivisor(aColor, 1);
		gl.enableVertexAttribArray(aRadius);
		gl.vertexAttribPointer(aRadius, 1, gl.FLOAT, false, stride, 5 * 4);
		gl.vertexAttribDivisor(aRadius, 1);

		gl.bindVertexArray(null);
		this.dotUniforms = {
			u_resolution: gl.getUniformLocation(this.dotProgram, 'u_resolution')!
		};

		// ── Line program ──
		this.lineProgram = this.linkProgram(LINE_VERT, LINE_FRAG);
		this.lineVao = gl.createVertexArray()!;
		gl.bindVertexArray(this.lineVao);

		this.linePosBuf = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.linePosBuf);
		const aPos = gl.getAttribLocation(this.lineProgram, 'a_pos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		this.lineArclenBuf = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.lineArclenBuf);
		const aArclen = gl.getAttribLocation(this.lineProgram, 'a_arclen');
		gl.enableVertexAttribArray(aArclen);
		gl.vertexAttribPointer(aArclen, 1, gl.FLOAT, false, 0, 0);

		gl.bindVertexArray(null);
		this.lineUniforms = {
			u_resolution: gl.getUniformLocation(this.lineProgram, 'u_resolution')!,
			u_color: gl.getUniformLocation(this.lineProgram, 'u_color')!,
			u_dashOn: gl.getUniformLocation(this.lineProgram, 'u_dashOn')!,
			u_dashOff: gl.getUniformLocation(this.lineProgram, 'u_dashOff')!
		};
	}

	private linkProgram(vertSrc: string, fragSrc: string): WebGLProgram {
		const gl = this.gl;
		const vs = this.compileShader(gl.VERTEX_SHADER, vertSrc);
		const fs = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
		const program = gl.createProgram()!;
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program) ?? 'Link failed');
		}
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		return program;
	}

	render(colorSpace: ColorSpaceId, lightness: number, outputGamut: 'srgb' | 'display-p3' = 'srgb', showGamutBoundary = false) {
		const gl = this.gl;
		const wheelId = getWheelSpaceId(colorSpace);
		const space = COLOR_SPACE_MAP[wheelId];
		if (!space) return;

		if (this.supportsP3) {
			(gl as unknown as Record<string, string>).drawingBufferColorSpace =
				outputGamut === 'display-p3' ? 'display-p3' : 'srgb';
		}

		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.useProgram(this.program);
		gl.uniform1f(this.uniforms.u_lightness, lightness / 100);
		gl.uniform1i(this.uniforms.u_colorSpace, space.index);
		gl.uniform1i(this.uniforms.u_outputGamut, outputGamut === 'display-p3' ? 1 : 0);
		gl.uniform1f(this.uniforms.u_maxChroma, space.maxChroma);
		gl.uniform1i(this.uniforms.u_showGamutBoundary, showGamutBoundary ? 1 : 0);

		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
	}

	renderOverlay(size: number, dpr: number, lines: OverlayLine[], dots: OverlayDot[]) {
		const gl = this.gl;
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		const resPx = size * dpr;

		// ── Lines first (so dots sit on top) ──
		if (lines.length > 0) {
			gl.useProgram(this.lineProgram);
			gl.uniform2f(this.lineUniforms.u_resolution, resPx, resPx);
			gl.bindVertexArray(this.lineVao);
			for (const line of lines) {
				const scaledPoints =
					dpr === 1
						? line.points
						: line.points.map((p) => ({ x: p.x * dpr, y: p.y * dpr }));
				const strip = buildLineStrip(scaledPoints, (line.width * dpr) / 2);
				if (!strip) continue;
				gl.bindBuffer(gl.ARRAY_BUFFER, this.linePosBuf);
				gl.bufferData(gl.ARRAY_BUFFER, strip.pos, gl.DYNAMIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, this.lineArclenBuf);
				gl.bufferData(gl.ARRAY_BUFFER, strip.arclen, gl.DYNAMIC_DRAW);
				gl.uniform4f(
					this.lineUniforms.u_color,
					line.color[0],
					line.color[1],
					line.color[2],
					line.color[3]
				);
				gl.uniform1f(this.lineUniforms.u_dashOn, (line.dashOn ?? 0) * dpr);
				gl.uniform1f(this.lineUniforms.u_dashOff, (line.dashOff ?? 0) * dpr);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, strip.count);
			}
			gl.bindVertexArray(null);
		}

		// ── Dots (instanced) ──
		if (dots.length > 0) {
			const data = new Float32Array(dots.length * 6);
			for (let i = 0; i < dots.length; i++) {
				const d = dots[i];
				data[i * 6 + 0] = d.x * dpr;
				data[i * 6 + 1] = d.y * dpr;
				data[i * 6 + 2] = d.color[0];
				data[i * 6 + 3] = d.color[1];
				data[i * 6 + 4] = d.color[2];
				data[i * 6 + 5] = (d.radius ?? 7) * dpr;
			}
			gl.useProgram(this.dotProgram);
			gl.uniform2f(this.dotUniforms.u_resolution, resPx, resPx);
			gl.bindVertexArray(this.dotVao);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.dotInstanceBuf);
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
			gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, dots.length);
			gl.bindVertexArray(null);
		}

	}

	destroy() {
		const gl = this.gl;
		gl.deleteBuffer(this.vbo);
		gl.deleteProgram(this.program);
		gl.deleteVertexArray(this.vao);
		gl.deleteBuffer(this.dotQuadBuf);
		gl.deleteBuffer(this.dotInstanceBuf);
		gl.deleteVertexArray(this.dotVao);
		gl.deleteProgram(this.dotProgram);
		gl.deleteBuffer(this.linePosBuf);
		gl.deleteBuffer(this.lineArclenBuf);
		gl.deleteVertexArray(this.lineVao);
		gl.deleteProgram(this.lineProgram);
	}

	private compileShader(type: number, source: string): WebGLShader {
		const gl = this.gl;
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const log = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw new Error(log ?? 'Shader compile failed');
		}
		return shader;
	}
}
