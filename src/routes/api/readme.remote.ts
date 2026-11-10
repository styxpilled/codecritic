import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { githubRepo } from '#lib';
import { $db } from '#lib/server/db/index.ts';
import { renderReadme } from '#lib/server/readme.ts';
import { getRequestEvent, query } from '$app/server';
import { getNPMPackage } from './npm.remote';

const MISSING_TTL = 1000 * 60 * 60 * 24;

const githubHeaders = (): HeadersInit => {
	const { GITHUB_CLIENT_ID: id, GITHUB_CLIENT_SECRET: secret } = env;
	return {
		'User-Agent': 'codecritic',
		Accept: 'application/vnd.github+json',
		...(id && secret && { Authorization: `Basic ${btoa(`${id}:${secret}`)}` }),
	};
};

export const getReadme = query(v.string(), async (name) => {
	const { db } = getRequestEvent().locals;
	const [cached] = await db
		.select()
		.from($db.readmes)
		.where(eq($db.readmes.name, name));
	if (cached?.value) {
		if (cached.html !== null) return cached;
		const html = await renderReadme(cached.value, cached.url);
		try {
			await db
				.update($db.readmes)
				.set({ html })
				.where(eq($db.readmes.name, name));
		} catch (e) {
			console.error(e);
		}
		return { ...cached, html };
	}
	if (cached?.expires && cached.expires > new Date()) return cached;

	const pkg = await getNPMPackage(name);
	const empty = {
		name: pkg.name,
		url: pkg.repository,
		value: '',
		html: '',
		expires: null as Date | null,
	};
	const repo = githubRepo(pkg.repository);
	if (!repo) return empty;

	const res = await fetch(`https://api.github.com/repos/${repo}/readme`, {
		headers: githubHeaders(),
	});
	if (!res.ok && res.status !== 404) {
		console.error(res.status, res.statusText, await res.text());
		return empty;
	}
	const content = res.ok
		? (await res.json<{ content?: string }>()).content
		: '';
	const value = content ? Buffer.from(content, 'base64').toString() : '';
	const readme = {
		...empty,
		value,
		html: await renderReadme(value, pkg.repository),
		expires: value ? null : new Date(Date.now() + MISSING_TTL),
	};
	await db
		.insert($db.readmes)
		.values(readme)
		.onConflictDoUpdate({ target: $db.readmes.name, set: readme });
	return readme;
});
