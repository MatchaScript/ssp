# Component contract

Each component directory is a copyable unit. Keep its public API and required sibling-component dependencies visible inside that directory so a future registry can copy the complete dependency graph.

- Put public prop and value types in `types.ts` and export them from `index.ts`.
- Use lowercase `xs`, `s`, `m`, `l`, and `xl` size values where applicable.
- Type forwarded attributes with Svelte's element attribute types. Omit attributes the component owns, such as semantic roles and linked ARIA attributes.
- Spread consumer attributes before owned attributes. Destructure and explicitly merge extensible `class`, `style`, and event handlers instead of silently replacing either side.
- Expose a bindable `ref` when the component has one meaningful root element.
- Render one semantic element for one component role. Styling wrappers must not duplicate accessibility semantics.
- Keep `index.ts` limited to the public component and type exports. Internal state stays in the component directory.
