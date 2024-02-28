import type { PageServerLoad } from './$types';
import { examples } from '$lib/types';

const greetOptions = [
	'using to break production',
	'scaling for 10 users',
	'making side projects in',
	'showing off on Twitter'
];

export const load: PageServerLoad = async () => {
	const message = greetOptions[Math.floor(Math.random() * greetOptions.length)];

	return { greetMessage: message, examples: examples };
};
