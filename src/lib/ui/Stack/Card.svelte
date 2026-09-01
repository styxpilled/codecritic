<script lang="ts">
	import { COLORS, optSubpath } from '$lib';
	import type { Stack, User } from '$lib/server/db/schema';
	import Avatar from '$ui/Avatar.svelte';
	import LikeButton from './LikeButton.svelte';

	let {
		stack,
		max = 6,
	}: {
		stack: Omit<Stack, 'author'> & {
			likes?: number;
			liked?: boolean;
			author: User;
			index: number | null;
			packages: string[];
			tags: string[];
		};
		max?: number;
	} = $props();

	const color = (value: string) =>
		COLORS[
			value.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) %
				COLORS.length
		];

	const href = $derived(
		`/user/${stack.author.username}/stack/${stack.normalizedName}/${optSubpath(stack.index)}`
	);
	const shown = $derived(stack.packages.slice(0, max).filter((v) => v));
	const rest = $derived(stack.packages.length - shown.length);
</script>

<article class="stack btn bg-light col">
	<h3 class="row">
		<Avatar user={stack.author} size="sm" />
		<a class="name fg-orange hov-line" {href}>{stack.name}</a>
	</h3>
	{#if stack.description}
		<p class="description fg-darker">{stack.description}</p>
	{/if}
	{#if stack.tags.length}
		<ul class="chips row wrap">
			{#each stack.tags as tag (tag)}
				<li>
					<span class="chip fg-dark bg-bright hov-link hov-invert">#{tag}</span>
				</li>
			{/each}
		</ul>
	{/if}
	{#if shown.length !== 0}
		<ul class="chips row wrap">
			{#each shown as pkg, i (i)}
				<li>
					<a class="chip bg-{color(pkg)} hov-invert" href="/packages/{pkg}">
						{pkg}
					</a>
				</li>
			{/each}
			{#if rest > 0}
				<li>
					<a class="chip fg-dark bg-bright hov-link" {href}>+{rest} more</a>
				</li>
			{/if}
		</ul>
	{:else if shown.length === 0}
		<p class="fg-dark">No packages yet</p>
	{/if}
	<div class="foot row space">
		<LikeButton {stack} />
		<span class="row nogap">
			<a
				class="author fg-red hov-line row gap-sm"
				href="/user/{stack.author.username}"
			>
				{#if stack.author.nickname}
					{stack.author.nickname} ({stack.author.username})
				{:else}
					{stack.author.username}
				{/if}
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
	}

	.author {
		max-width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.description {
		max-width: 100%;
		word-break: break-all;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}

	.chips {
		gap: 0.25rem;
	}

	.chip {
		display: block;
		border-radius: 0.25rem;
		padding: 0 0.25rem;
		word-break: keep-all;
		font-size: 0.875rem;
	}

	.foot {
		font-size: 0.875rem;
	}
</style>
