import { error, redirect as kitRedirect } from '@sveltejs/kit';

export const ok = (body?: unknown, cache?: 'short' | 'long') => {
	return new Response(JSON.stringify(body ?? {}), {
		status: 200,
		headers: {
			'Cache-Control': cache
				? cache === 'short'
					? 'max-age=60, stale-while-revalidate=60'
					: 'max-age=900, stale-while-revalidate=1800'
				: 'no-cache'
		}
	});
};

// REDIRECTION RESPONSES 3xx
export const redirect = (url: string) => kitRedirect(303, url);
// CLIENT ERROR RESPONSES 4xx
export const badRequest = (body?: App.Error) => error(400, body);
export const unauthorized = (body?: App.Error) => error(401, body);
export const forbidden = (body?: App.Error) => error(402, body);
export const notFound = (body?: App.Error) => error(404, body);
export const conflict = (body?: App.Error) => error(409, body);
export const tooManyRequests = (body?: App.Error) => error(429, body);
// SERVER ERROR RESPONSES 5xx
export const serverError = (body?: App.Error) => error(500, body);
export const serviceUnavailable = (body?: App.Error) => error(503, body);

// export const handleLoginRedirect = (
// 	url: URL,
// 	message = 'You must be logged in to access this page.'
// ) => {
// 	const redirectTo = url.pathname + url.search;
// 	return `/welcome/signin?redirectTo=${redirectTo}&message=${message}`;
// };
