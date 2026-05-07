#!/usr/bin/env node
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import sirv from 'sirv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = resolve(__dirname, '..', 'build');

if (!existsSync(buildDir)) {
	console.error(`[ssp-color-editor] build directory not found at ${buildDir}`);
	process.exit(1);
}

const args = process.argv.slice(2);
let port = Number(process.env.PORT) || 4321;
let host = process.env.HOST || '127.0.0.1';
let openBrowser = true;

for (let i = 0; i < args.length; i++) {
	const a = args[i];
	if (a === '--port' || a === '-p') port = Number(args[++i]);
	else if (a.startsWith('--port=')) port = Number(a.split('=')[1]);
	else if (a === '--host') host = args[++i];
	else if (a.startsWith('--host=')) host = a.split('=')[1];
	else if (a === '--no-open') openBrowser = false;
	else if (a === '--help' || a === '-h') {
		console.log(
			`Usage: ssp-color-editor [options]\n\n` +
				`Options:\n` +
				`  -p, --port <port>  Port to listen on (default: 4321, env PORT)\n` +
				`      --host <host>  Host to bind (default: 127.0.0.1, env HOST)\n` +
				`      --no-open      Do not open the browser\n` +
				`  -h, --help         Show help`
		);
		process.exit(0);
	}
}

if (!Number.isFinite(port) || port < 0 || port > 65535) {
	console.error(`[ssp-color-editor] invalid port: ${port}`);
	process.exit(1);
}

const handler = sirv(buildDir, {
	single: 'index.html',
	dev: false,
	etag: true,
	gzip: true,
	brotli: true
});

const server = createServer(handler);
const startPort = port;
const maxAttempts = 20;

function start(p, attempt = 0) {
	const onError = (err) => {
		if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
			console.warn(`[ssp-color-editor] port ${p} in use, trying ${p + 1}...`);
			server.removeListener('error', onError);
			start(p + 1, attempt + 1);
		} else {
			console.error(`[ssp-color-editor] failed to listen on ${host}:${p}`, err);
			process.exit(1);
		}
	};
	server.once('error', onError);
	server.listen(p, host, () => {
		server.removeListener('error', onError);
		const url = `http://${host}:${p}`;
		console.log(`[ssp-color-editor] listening on ${url}`);
		if (openBrowser) tryOpen(url);
	});
}

function tryOpen(url) {
	const platform = process.platform;
	let cmd, cmdArgs;
	if (platform === 'darwin') {
		cmd = 'open';
		cmdArgs = [url];
	} else if (platform === 'win32') {
		cmd = 'cmd';
		cmdArgs = ['/c', 'start', '""', url];
	} else {
		cmd = 'xdg-open';
		cmdArgs = [url];
	}
	try {
		const child = spawn(cmd, cmdArgs, { stdio: 'ignore', detached: true });
		child.on('error', () => {});
		child.unref();
	} catch {
		// best-effort; ignore
	}
}

const shutdown = () => {
	server.close(() => process.exit(0));
	setTimeout(() => process.exit(0), 1000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start(startPort);
