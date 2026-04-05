import { query } from '$app/server';
import { $fetch, stripGit, toPackageName } from '$lib';
import * as v from 'valibot';
import { getNPMPackage } from './npm.remote';
import { error } from '@sveltejs/kit';

export const getReadme = query(
	v.object({
		scope: v.optional(v.string()),
		package: v.string()
	}),
	async (name) => {
		// const npmInfo = searchNPM();
		// const cookies = getRequestEvent().cookies;
		const pkg = await getNPMPackage(name);
		const repo = stripGit(pkg.repository);
		const readme = {
			name: toPackageName(name),
			value: '',
			url: repo,
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
		};
		const readmeData = await $fetch<{ content: string }>(
			`https://api.github.com/repos/${repo.substring(repo.indexOf('github.com') + 11)}/readme`,
			null,
			fetch,
			{
				headers: {
					'User-Agent': 'codecritic'
				}
			}
		);
		if (readmeData === null) error(404);
		if (readmeData !== undefined && readmeData.content) {
			const buff = Buffer.from(readmeData.content, 'base64');
			readme.value = buff.toString();
		}

		return readme;
	}
);
