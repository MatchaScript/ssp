import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import {
	generateSpectrumCss,
	type SpectrumConfig,
	type SpectrumTokens,
	type PaletteJson,
	type VariablesJson
} from './generate.js';

// Tokens live in src/tokens/ regardless of whether we're running from src/ or dist/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tokensDir = path.resolve(__dirname, '..', 'src', 'tokens');
const defaultTokens: SpectrumTokens = {
	semantic: JSON.parse(
		fs.readFileSync(path.join(tokensDir, 'semantic.json'), 'utf8')
	) as VariablesJson,
	palette: JSON.parse(
		fs.readFileSync(path.join(tokensDir, 'palette.json'), 'utf8')
	) as PaletteJson
};

export interface SpectrumThemeOptions {
	configPath?: string;
}

export function spectrumThemePlugin(options: SpectrumThemeOptions = {}): Plugin {
	const virtualModuleId = 'virtual:ssp/theme.css';
	const resolvedVirtualModuleId = '\0' + virtualModuleId;
	let absoluteConfigPath = '';

	return {
		name: 'vite-plugin-spectrum-theme',
		configResolved(config) {
			const configPath = options.configPath || 'spectrum.config.json';
			absoluteConfigPath = path.resolve(config.root, configPath);
		},
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		async load(id) {
			if (id !== resolvedVirtualModuleId) return;

			if (!fs.existsSync(absoluteConfigPath)) {
				this.warn(`spectrumThemePlugin: config file not found at ${absoluteConfigPath}`);
				return '';
			}

			this.addWatchFile(absoluteConfigPath);

			const configContent = await fs.promises.readFile(absoluteConfigPath, 'utf8');
			const config = JSON.parse(configContent) as SpectrumConfig;

			const finalCss = generateSpectrumCss(config, defaultTokens);

			if (config.cssOutputPath) {
				const outDir = path.dirname(absoluteConfigPath);
				const outPath = path.resolve(outDir, config.cssOutputPath);
				if (path.relative(outDir, outPath).startsWith('..')) {
					this.warn(
						`cssOutputPath "${config.cssOutputPath}" escapes the config directory — skipping file write.`
					);
				} else {
					await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
					await fs.promises.writeFile(outPath, finalCss, 'utf8');
				}
			}

			return finalCss;
		}
	};
}
