import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getRequestEvent, query } from '$app/server';
import { $fetch, stripGit } from '$lib';
import { $db } from '$lib/server/db';
import { renderReadme } from '$lib/server/readme';
import { getNPMPackage } from './npm.remote';

export const getReadme = query(v.string(), async (name) => {
	const { db } = getRequestEvent().locals;
	const [possibleReadme] = await db
		.select()
		.from($db.readmes)
		.where(eq($db.readmes.name, name));
	if (possibleReadme) {
		if (possibleReadme.html !== null) return possibleReadme;
		const html = await renderReadme(
			possibleReadme.value ?? '',
			possibleReadme.url
		);
		await db
			.update($db.readmes)
			.set({ html })
			.where(eq($db.readmes.name, name));
		return { ...possibleReadme, html };
	}
	const pkg = await getNPMPackage(name);
	if (!pkg.repository) error(404);
	const repo = stripGit(pkg.repository);
	const readme = {
		name: name,
		value: '',
		html: '',
		url: repo,
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
	};

	const readmeData = await $fetch<{ content: string }>(
		`https://api.github.com/repos/${repo.substring(repo.indexOf('github.com') + 11)}/readme`,
		null,
		fetch,
		{
			headers: {
				'User-Agent': 'codecritic',
			},
		}
	);
	if (readmeData === null) error(404);
	if (readmeData !== undefined && readmeData.content) {
		const buff = Buffer.from(readmeData.content, 'base64');
		readme.value = buff.toString();
		readme.html = await renderReadme(readme.value, readme.url);
		await db
			.insert($db.readmes)
			.values([
				{
					name: pkg.name,
					url: pkg.repository,
					value: readme.value,
					html: readme.html,
				},
			])
			.onConflictDoNothing();
	}

	return readme;
});
