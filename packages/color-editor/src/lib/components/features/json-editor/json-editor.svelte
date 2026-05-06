<script lang="ts">
	import type * as Monaco from 'monaco-editor';
	import { themeState } from '$lib/stores/theme.svelte';

	type Props = {
		value: string;
		onchange?: (value: string) => void;
	};

	let { value, onchange }: Props = $props();

	let container: HTMLDivElement | undefined = $state();
	let editor: Monaco.editor.IStandaloneCodeEditor | undefined;
	let monaco: typeof Monaco | undefined;

	const monacoTheme = $derived(themeState.resolvedTheme === 'dark' ? 'vs-dark' : 'vs');

	$effect(() => {
		if (monaco && editor) {
			monaco.editor.setTheme(monacoTheme);
		}
	});

	$effect(() => {
		if (!container) return;

		let _editor: Monaco.editor.IStandaloneCodeEditor | undefined;
		let cancelled = false;

		import('monaco-editor').then((m) => {
			if (cancelled) return;
			monaco = m;

			self.MonacoEnvironment = {
				getWorker(_, label) {
					if (label === 'json') {
						return new Worker(
							new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
							{ type: 'module' }
						);
					}
					return new Worker(
						new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
						{ type: 'module' }
					);
				}
			};

			_editor = m.editor.create(container!, {
				value,
				language: 'json',
				theme: monacoTheme,
				minimap: { enabled: false },
				fontSize: 13,
				lineNumbers: 'on',
				scrollBeyondLastLine: false,
				automaticLayout: true,
				tabSize: 2,
				renderLineHighlight: 'none',
				padding: { top: 12 }
			});
			editor = _editor;

			_editor.onDidChangeModelContent(() => {
				onchange?.(_editor!.getValue());
			});
		});

		return () => {
			cancelled = true;
			_editor?.dispose();
			editor = undefined;
		};
	});

	/** Imperatively replace editor content (e.g. after file import). */
	export function setValue(newValue: string) {
		editor?.setValue(newValue);
	}
</script>

<div bind:this={container} class="json-editor"></div>

<style>
	.json-editor {
		width: 100%;
		height: 100%;
		min-height: 0;
	}
</style>
