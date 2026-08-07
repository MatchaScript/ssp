import {
	generateSpectrumCss,
	type SpectrumConfig,
	type SpectrumTokens
} from '@matchalatte/ssp-theme/generate';
import semantic from '@matchalatte/ssp-theme/tokens/semantic.json';
import palette from '@matchalatte/ssp-theme/tokens/palette.json';

// JSON imports infer literal-narrow types that conflict with the loose
// runtime shape ssp-theme consumes, so widen at the boundary.
const tokens = { semantic, palette } as unknown as SpectrumTokens;

export function buildSpectrumCss(config: SpectrumConfig): string {
	return generateSpectrumCss(config, tokens);
}

export function downloadSpectrumCss(config: SpectrumConfig, filename = 'spectrum.css') {
	const css = buildSpectrumCss(config);
	const blob = new Blob([css], { type: 'text/css' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
