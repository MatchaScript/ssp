// Multi-part components — namespace exports
export * as Accordion from './components/accordion/index.js';
export * as ActionBar from './components/action-bar/index.js';
export * as ActionButtonGroup from './components/action-button-group/index.js';
export * as Avatar from './components/avatar/index.js';
export * as Combobox from './components/combobox/index.js';
export * as Dialog from './components/dialog/index.js';
export * as Disclosure from './components/disclosure/index.js';
export * as ListView from './components/list-view/index.js';
export * as Menu from './components/menu/index.js';
export * as Picker from './components/picker/index.js';
export * as RadioGroup from './components/radio-group/index.js';
export * as SegmentedControl from './components/segmented-control/index.js';
export * as SelectBoxGroup from './components/select-box/index.js';
export * as SideNav from './components/side-nav/index.js';
export * as TableView from './components/table-view/index.js';
export * as Tabs from './components/tabs/index.js';
export * as ToggleGroup from './components/toggle-group/index.js';
export * as Tooltip from './components/tooltip/index.js';

// Single components — flat re-exports (no colliding names)
export * from './components/action-button/index.js';
export * from './components/badge/index.js';
export * from './components/checkbox/index.js';
export * from './components/color-picker/index.js';
export * from './components/date-field/index.js';
export * from './components/divider/index.js';
export * from './components/label/index.js';
export * from './components/meter/index.js';
export * from './components/number-field/index.js';
export * from './components/progress-bar/index.js';
export * from './components/progress-circle/index.js';
export * from './components/range-slider/index.js';
export * from './components/slider/index.js';
export * from './components/switch/index.js';
export * from './components/textarea/index.js';
export * from './components/textfield/index.js';
export * from './components/time-field/index.js';
export * from './components/toggle-button/index.js';

// Selective re-exports — drop Root / short aliases (Props, Variant, Size) to avoid collisions
// Per-component imports (e.g. '@ssp/ui/components/button') still expose all aliases.
export {
	Button,
	type ButtonRootProps,
	type Variant as ButtonVariant,
	type Treatment as ButtonTreatment,
	type Size as ButtonSize,
	type StaticColor as ButtonStaticColor
} from './components/button/index.js';

export {
	Card,
	type CardProps,
	type Variant as CardVariant,
	type Size as CardSize,
	type Density as CardDensity
} from './components/card/index.js';

export { SearchField, type SearchFieldProps } from './components/search-field/index.js';

export {
	StatusLight,
	type StatusLightSize,
	type StatusLightSemanticVariant,
	type StatusLightVariant,
	type StatusLightRootProps
} from './components/status-light/index.js';

// Field — selective to avoid NecessityIndicator collision with label
export {
	Field,
	HelpText,
	type FieldSize,
	type FieldLabelPosition,
	type FieldState,
	type FieldLabelState
} from './components/field/index.js';

// Icon — export component + types only; lucide icons available via '@ssp/ui/components/icon'
export {
	Icon,
	type IconProps,
	type IconNode,
	type IconSize,
	type IconColor
} from './components/icon/index.js';
