export function match(value) {
	// @ts-expect-error that's the point
	return !isNaN(value);
}
