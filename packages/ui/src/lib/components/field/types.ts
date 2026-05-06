/**
 * Shared types for field-level components (TextField, TextArea, NumberField, SearchField).
 */

/** Available field sizes matching Spectrum 2 component sizing. */
export type FieldSize = 's' | 'm' | 'l' | 'xl';

/** Label placement relative to the field. */
export type FieldLabelPosition = 'top' | 'side';

/** State passed to <Field>'s `children` snippet. */
export interface FieldState {
	id: string;
	helpTextId: string | undefined;
}

/** State passed to <Field>'s `label` snippet. */
export interface FieldLabelState {
	id: string;
}

export type { NecessityIndicator } from '../label/types.js';
