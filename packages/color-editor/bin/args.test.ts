import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain JS module shipped with the CLI, no declarations
import { parseArgs, DEFAULT_HOST, DEFAULT_PORT } from './args.js';

describe('parseArgs', () => {
	const cases: {
		name: string;
		argv: string[];
		env?: Record<string, string>;
		expected: Record<string, unknown>;
	}[] = [
		{
			name: 'defaults with no arguments',
			argv: [],
			expected: { port: DEFAULT_PORT, host: DEFAULT_HOST, openBrowser: true }
		},
		{
			name: 'environment overrides the defaults',
			argv: [],
			env: { PORT: '8080', HOST: '0.0.0.0' },
			expected: { port: 8080, host: '0.0.0.0', openBrowser: true }
		},
		{
			name: 'flags override the environment',
			argv: ['--port', '9000', '--host', 'localhost'],
			env: { PORT: '8080', HOST: '0.0.0.0' },
			expected: { port: 9000, host: 'localhost' }
		},
		{ name: 'short port flag', argv: ['-p', '5000'], expected: { port: 5000 } },
		{ name: 'inline port', argv: ['--port=5000'], expected: { port: 5000 } },
		{
			name: 'inline host keeps colons',
			argv: ['--host=::1'],
			expected: { host: '::1' }
		},
		{ name: 'no-open', argv: ['--no-open'], expected: { openBrowser: false } },
		{ name: 'help short-circuits', argv: ['--help'], expected: { help: true } },
		{ name: 'help wins over later options', argv: ['-h', '--nope'], expected: { help: true } },
		{
			name: 'port without a value is rejected',
			argv: ['--port'],
			expected: { error: expect.stringContaining('invalid port') }
		},
		{
			name: 'non-numeric port is rejected',
			argv: ['--port', 'abc'],
			expected: { error: expect.stringContaining('invalid port') }
		},
		{
			name: 'out-of-range port is rejected',
			argv: ['--port', '70000'],
			expected: { error: expect.stringContaining('invalid port') }
		},
		{
			name: 'fractional port is rejected',
			argv: ['--port', '80.5'],
			expected: { error: expect.stringContaining('invalid port') }
		},
		{
			name: 'host without a value is rejected',
			argv: ['--host'],
			expected: { error: 'missing value for --host' }
		},
		{
			name: 'unknown option is rejected',
			argv: ['--verbose'],
			expected: { error: 'unknown option: --verbose' }
		}
	];

	it.each(cases)('$name', ({ argv, env, expected }) => {
		expect(parseArgs(argv, env ?? {})).toMatchObject(expected);
	});

	it('does not report an error for a valid invocation', () => {
		expect(parseArgs(['--port=3000', '--no-open'], {})).not.toHaveProperty('error');
	});
});
