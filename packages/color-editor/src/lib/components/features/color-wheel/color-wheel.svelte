<script lang="ts">
	import { getWheelRenderer, type ColorSpaceId } from '$lib/types/color-space';
	import { WheelGLRenderer, type OverlayDot, type OverlayLine } from './wheel-gl';
	import { outputGamutState } from '$lib/stores/output-gamut.svelte';
	import { line as d3Line, curveBasis } from 'd3-shape';
	import { converter } from 'culori';

	interface ColorDot {
		hex: string;
		name: string;
	}

	interface ScalePath {
		name: string;
		swatches: string[];
		variant?: 'default' | 'adobe';
	}

	let {
		colorSpace,
		lightness = 70,
		dots = [],
		paths = [],
		showPaths = false,
		showHarmonyLines = false,
		showGamutBoundary = false,
		size = 320
	}: {
		colorSpace: ColorSpaceId;
		lightness?: number;
		dots?: ColorDot[];
		paths?: ScalePath[];
		showPaths?: boolean;
		showHarmonyLines?: boolean;
		showGamutBoundary?: boolean;
		size?: number;
	} = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let glRenderer: WheelGLRenderer | undefined = $state();
	let dpr = $state(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1);

	const renderer = $derived(getWheelRenderer(colorSpace));
	const mid = $derived(size / 2);

	// ── Polar → pixel coords ──

	function toXY(hex: string): { x: number; y: number } {
		const polar = renderer.extractPolar(hex);
		const hRad = (polar.h * Math.PI) / 180;
		const dist = (polar.c / 100) * mid;
		const x = dist * Math.cos(hRad) + mid;
		const y = mid - dist * Math.sin(hRad);
		return {
			x: Number.isNaN(x) ? mid : x,
			y: Number.isNaN(y) ? mid : y
		};
	}

	// ── hex → gamma-encoded color in target gamut ──

	const toP3 = converter('p3');
	const toSRGB = converter('rgb');

	function hexToGamut(hex: string): [number, number, number] {
		const c = outputGamutState.id === 'display-p3' ? toP3(hex) : toSRGB(hex);
		if (!c) return [1, 1, 1];
		const clamp = (v: number) => Math.max(0, Math.min(1, v));
		return [clamp(c.r ?? 0), clamp(c.g ?? 0), clamp(c.b ?? 0)];
	}

	// ── Sample a d3 path via a custom context ──

	class PathSampler {
		private cur: [number, number] = [0, 0];
		points: { x: number; y: number }[] = [];
		moveTo(x: number, y: number) {
			this.cur = [x, y];
			this.points.push({ x, y });
		}
		lineTo(x: number, y: number) {
			this.cur = [x, y];
			this.points.push({ x, y });
		}
		bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
			const [p0x, p0y] = this.cur;
			const steps = 12;
			for (let i = 1; i <= steps; i++) {
				const t = i / steps;
				const mt = 1 - t;
				const bx = mt * mt * mt * p0x + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x;
				const by = mt * mt * mt * p0y + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y;
				this.points.push({ x: bx, y: by });
			}
			this.cur = [x, y];
		}
		closePath() {}
	}

	function samplePath(points: { x: number; y: number }[]): { x: number; y: number }[] {
		const sampler = new PathSampler();
		d3Line<{ x: number; y: number }>()
			.x((d) => d.x)
			.y((d) => d.y)
			.curve(curveBasis)
			.context(sampler as unknown as CanvasRenderingContext2D)(points);
		return sampler.points;
	}

	// ── Derived overlay data ──

	const overlayDots = $derived<OverlayDot[]>(
		dots.map((d) => {
			const p = toXY(d.hex);
			return { x: p.x, y: p.y, color: hexToGamut(d.hex), radius: 7 };
		})
	);

	const overlayLines = $derived.by<OverlayLine[]>(() => {
		const out: OverlayLine[] = [];

		if (showHarmonyLines) {
			for (const d of dots) {
				const p = toXY(d.hex);
				out.push({
					points: [
						{ x: mid, y: mid },
						{ x: p.x, y: p.y }
					],
					color: [1, 1, 1, 0.75],
					width: 2.5,
					dashOn: 4,
					dashOff: 6
				});
			}
		}

		if (showPaths) {
			for (const scale of paths) {
				const raw = scale.swatches.map(toXY);
				const sampled = samplePath(raw);
				if (sampled.length < 2) continue;
				const variant = scale.variant ?? 'default';
				if (variant === 'adobe') {
					out.push({
						points: sampled,
						color: [0.863, 0.314, 0.275, 0.85],
						width: 1.5,
						dashOn: 5,
						dashOff: 3
					});
				} else {
					out.push({
						points: sampled,
						color: [1, 1, 1, 1],
						width: 2
					});
				}
			}
		}

		return out;
	});

	// ── Initialize WebGL renderer ──

	$effect(() => {
		if (!canvasEl) return;
		const gl = new WheelGLRenderer(canvasEl);
		glRenderer = gl;
		return () => {
			gl.destroy();
			glRenderer = undefined;
		};
	});

	// ── Track devicePixelRatio changes (zoom, multi-monitor drag) ──

	$effect(() => {
		if (typeof window === 'undefined') return;
		let mql: MediaQueryList | null = null;
		const update = () => {
			dpr = window.devicePixelRatio || 1;
			mql?.removeEventListener('change', update);
			mql = window.matchMedia(`(resolution: ${dpr}dppx)`);
			mql.addEventListener('change', update);
		};
		update();
		return () => mql?.removeEventListener('change', update);
	});

	// ── Size canvas backing store ──

	$effect(() => {
		if (!canvasEl) return;
		const px = Math.round(size * dpr);
		if (canvasEl.width !== px) canvasEl.width = px;
		if (canvasEl.height !== px) canvasEl.height = px;
	});

	// ── Render ──

	$effect(() => {
		if (!glRenderer) return;
		glRenderer.render(colorSpace, lightness, outputGamutState.id, showGamutBoundary);
		glRenderer.renderOverlay(size, dpr, overlayLines, overlayDots);
	});
</script>

<div class="color-wheel" style:--size="{size}px">
	<canvas bind:this={canvasEl} class="wheel-canvas"></canvas>
</div>

<style>
	.color-wheel {
		position: relative;
		width: var(--size);
		height: var(--size);
		flex-shrink: 0;
	}

	.wheel-canvas {
		width: var(--size);
		height: var(--size);
		border-radius: var(--corner-radius-full);
		display: block;
	}
</style>
