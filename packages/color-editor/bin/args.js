export const DEFAULT_PORT = 4321;
export const DEFAULT_HOST = '127.0.0.1';

export const HELP = `Usage: ssp-color-editor [options]

Options:
  -p, --port <port>  Port to listen on (default: ${DEFAULT_PORT}, env PORT)
      --host <host>  Host to bind (default: ${DEFAULT_HOST}, env HOST)
      --no-open      Do not open the browser
  -h, --help         Show help`;

/**
 * Parse CLI arguments over a base taken from the environment.
 *
 * Returns `{ error }` rather than exiting so the caller owns the process, and
 * so the parsing itself stays testable.
 *
 * @param {string[]} argv
 * @param {{ PORT?: string, HOST?: string }} [env]
 * @returns {{ port: number, host: string, openBrowser: boolean, help?: true, error?: string }}
 */
export function parseArgs(argv, env = {}) {
	const result = {
		port: Number(env.PORT) || DEFAULT_PORT,
		host: env.HOST || DEFAULT_HOST,
		openBrowser: true
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];

		if (arg === '--help' || arg === '-h') return { ...result, help: true };
		else if (arg === '--no-open') result.openBrowser = false;
		else if (arg === '--port' || arg === '-p') result.port = Number(argv[++i]);
		else if (arg.startsWith('--port=')) result.port = Number(arg.slice('--port='.length));
		else if (arg === '--host') result.host = argv[++i];
		else if (arg.startsWith('--host=')) result.host = arg.slice('--host='.length);
		else return { ...result, error: `unknown option: ${arg}` };
	}

	if (!Number.isInteger(result.port) || result.port < 0 || result.port > 65535) {
		return { ...result, error: `invalid port: ${argv.join(' ')}` };
	}
	if (!result.host) {
		return { ...result, error: 'missing value for --host' };
	}

	return result;
}
