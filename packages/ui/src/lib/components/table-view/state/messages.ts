import {
	createStringFormatter,
	resolveDocumentLocale,
	type LocaleStrings,
	type StringFormatter
} from '$lib/utils/string-formatter/index.js';
import enUS from '../intl/en-US.json' with { type: 'json' };

const catalogue: Record<string, LocaleStrings> = {
	'en-US': enUS as LocaleStrings
};

export function getTableViewFormatter(): StringFormatter {
	return createStringFormatter(catalogue, resolveDocumentLocale());
}
