import type { PageServerLoad } from './$types';

const greetOptions = [
	'using to break production',
	'using to scale for 10 users',
	'making side projects in',
	'showing off on Twitter',
	'running up a 100k bill with'
];

export const load: PageServerLoad = async () => {
	const message = greetOptions[Math.floor(Math.random() * greetOptions.length)];

	return { greetMessage: message };
};
