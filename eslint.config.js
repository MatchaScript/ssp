import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'no-undef': 'off'
		}
	},
	{
		ignores: ['**/.claude/', '**/project.inlang/', '**/src/lib/paraglide/', '**/storybook-static/']
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		},
		rules: {
			// $bindable() への代入を ESLint がフロー解析できず誤検知するため Svelte ファイルでは無効化
			'no-useless-assignment': 'off'
		}
	},
	{
		// ssp-ui is a router-agnostic component library — consumers resolve hrefs
		// at call sites, so the SvelteKit-specific resolve() rule does not apply.
		files: ['packages/ui/**/*.svelte', 'packages/ui/**/*.svelte.ts', 'packages/ui/**/*.svelte.js'],
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
);
