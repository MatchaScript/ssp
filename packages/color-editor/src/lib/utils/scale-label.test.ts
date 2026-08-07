import { describe, expect, it } from 'vitest';
import { stripScaleName } from './scale-label';

describe('stripScaleName', () => {
	const cases: { name: string; valueName: string; scaleName: string; expected: string }[] = [
		{
			name: 'strips the name and separator',
			valueName: 'blue 100',
			scaleName: 'blue',
			expected: '100'
		},
		{
			name: 'strips without a separator',
			valueName: 'blue100',
			scaleName: 'blue',
			expected: '100'
		},
		{
			name: 'matches case-insensitively',
			valueName: 'Blue 100',
			scaleName: 'blue',
			expected: '100'
		},
		{
			name: 'leaves an unrelated name alone',
			valueName: 'red 100',
			scaleName: 'blue',
			expected: 'red 100'
		},
		{
			name: 'only strips a prefix, not a substring',
			valueName: 'light blue 100',
			scaleName: 'blue',
			expected: 'light blue 100'
		},
		{
			name: 'tolerates an empty scale name',
			valueName: 'blue 100',
			scaleName: '',
			expected: 'blue 100'
		},
		// Names are user-editable: regex metacharacters used to throw or over-match.
		{
			name: 'treats an unbalanced paren literally',
			valueName: 'blue( 100',
			scaleName: 'blue(',
			expected: '100'
		},
		{
			name: 'does not let a dot match any character',
			valueName: 'blue 100',
			scaleName: 'b.ue',
			expected: 'blue 100'
		},
		{
			name: 'does not let a quantifier apply',
			valueName: 'bluee 100',
			scaleName: 'blue+',
			expected: 'bluee 100'
		}
	];

	it.each(cases)('$name', ({ valueName, scaleName, expected }) => {
		expect(stripScaleName(valueName, scaleName)).toBe(expected);
	});
});
