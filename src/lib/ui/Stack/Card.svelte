<script lang="ts">
	import { COLORS, optSubpath } from '$lib';
	import type { Stack, User } from '$lib/server/db/schema';
	import Avatar from '$ui/Avatar.svelte';
	import LikeButton from './LikeButton.svelte';

	let {
		stack,
		lines = 2,
	}: {
		stack: Omit<Stack, 'author'> & {
			likes?: number;
			liked?: boolean;
			author: User;
			index: number | null;
			packages: string[];
			tags: string[];
		};
		/** How many lines of chips each list gets. */
		lines?: number;
	} = $props();

	const color = (value: string) =>
		COLORS[
			value.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) %
				COLORS.length
		];

	const href = $derived(
		`/user/${stack.author.username}/stack/${stack.normalizedName}/${optSubpath(stack.index)}`
	);

	// A card is a third of the list, so a line of chips holds about this many
	// characters. Counting them keeps the chips inside `lines` without JS.
	const PER_LINE = 35;
	// The width of a "+9 more" chip.
	const MORE = 9;

	/** The chips that fit in `lines` lines, and how many stay behind. */
	const clip = (items: string[]) => {
		const budget = PER_LINE * lines;
		let used = 0;
		const shown: string[] = [];
		for (const [i, item] of items.entries()) {
			// The padding and the gap of a chip cost about two characters.
			const last = i === items.length - 1;
			used += item.length + 2;
			if (i > 0 && used > budget - (last ? 0 : MORE)) break;
			shown.push(item);
		}
		return { shown, rest: items.length - shown.length };
	};

	const packages = $derived(clip(stack.packages.filter((v) => v)));
	const tags = $derived(clip(stack.tags));
</script>

<article class="stack btn bg-light col">
	<h3 class="row">
		<Avatar user={stack.author} size="sm" />
		<a class="name fg-orange hov-line" {href}>{stack.name}</a>
	</h3>
	{#if stack.description}
		<p class="description fg-darker">{stack.description}</p>
	{/if}
	{#if tags.shown.length}
		<ul class="chips row wrap">
			{#each tags.shown as tag (tag)}
				<li>
					<span class="chip fg-dark bg-bright hov-link hov-invert">#{tag}</span>
				</li>
			{/each}
			{#if tags.rest > 0}
				<li>
					<a class="chip fg-dark bg-bright hov-link" {href}>
						+{tags.rest} more
					</a>
				</li>
			{/if}
		</ul>
	{/if}
	{#if packages.shown.length !== 0}
		<ul class="chips row wrap">
			{#each packages.shown as pkg, i (i)}
				<li>
					<a class="chip bg-{color(pkg)} hov-invert" href="/packages/{pkg}">
						{pkg}
					</a>
				</li>
			{/each}
			{#if packages.rest > 0}
				<li>
					<a class="chip fg-dark bg-bright hov-link" {href}>
						+{packages.rest} more
					</a>
				</li>
			{/if}
		</ul>
	{:else}
		<p class="fg-dark">No packages yet</p>
	{/if}
	<div class="foot row space">
		<LikeButton {stack} />
		<span class="row nogap">
			<a
				class="author fg-red hov-line row gap-sm"
				href="/user/{stack.author.username}"
			>
				{stack.author.username}
			</a>
			<span class="fg-dark">@</span>
			<span class="fg-green">
				{stack.createdAt.toLocaleDateString('en-GB')}
			</span>
		</span>
	</div>
</article>

<style>
	.stack {
		width: 100%;
		padding: 0.75rem;
		gap: 0.375rem;
		align-items: stretch;
		height: min-content;
		overflow: hidden;
		min-width: 0;
	}

	h3 {
		font-size: 1.125rem;
		margin: 0;
		min-width: 0;
	}

	.name {
		min-width: 0;
		/* The heading rules break every line mid-word. */
		word-break: normal;
		overflow-wrap: break-word;
	}

	.author {
		max-width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.description {
		max-width: 100%;
		overflow-wrap: break-word;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}

	.chips {
		gap: 0.25rem;
		min-width: 0;
	}

	.chips li {
		min-width: 0;
		max-width: 100%;
	}

	.chip {
		display: block;
		max-width: 100%;
		border-radius: 0.25rem;
		padding: 0 0.25rem;
		word-break: keep-all;
		font-size: 0.875rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.foot {
		font-size: 0.875rem;
	}
</style>
