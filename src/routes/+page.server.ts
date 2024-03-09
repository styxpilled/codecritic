import type { PageServerLoad } from './$types';

const greetOptions = [
	'using to break production',
	'using to scale for 10 users',
	'using instead of Rust',
	'making side projects in',
	'showing off on Twitter',
	'running up a 100k bill with',
	'TypeError: undefined is not a function',
	'rewriting their codebases with',
	'being forced to use at work'
];

export const load: PageServerLoad = async () => {
	const message = greetOptions[Math.floor(Math.random() * greetOptions.length)];

	return { greetMessage: message };
};
