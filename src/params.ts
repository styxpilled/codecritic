import { defineParams } from '@sveltejs/kit/params';

function matchNaN(value: string) {
	// @ts-expect-error that's the point
	return !isNaN(value);
}

function matchNumber(value: string) {
	return /^(0|[1-9]\d*)$/.test(value);
}

function matchScope(value: string) {
	return /^@/.test(value);
}

export const params = defineParams({
	NaN: (param) => (matchNaN(param) ? param : undefined),
	number: (param) => (matchNumber(param) ? param : undefined),
	scope: (param) => (matchScope(param) ? param : undefined),
});
