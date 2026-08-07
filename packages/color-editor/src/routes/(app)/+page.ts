import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

// The app has no dashboard; Create is where a session starts.
export function load() {
	redirect(307, resolve('/(app)/create'));
}
