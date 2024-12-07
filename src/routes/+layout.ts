import { BannerGenerator } from '$lib/client/ads.js';

export const load = async ({ data, url }) => {
	return { ...data, rand: new BannerGenerator(url.pathname) };
};
