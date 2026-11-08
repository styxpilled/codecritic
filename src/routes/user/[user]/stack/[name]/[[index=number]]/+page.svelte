<script lang="ts">
	import { deleteStack, getStack } from '#api/stacks.remote.ts';
	import { optSubpath } from '#lib';
	import { app } from '#lib/client/state.svelte.ts';
	import LikeButton from '#ui/Stack/LikeButton.svelte';

	let { params } = $props();

	const stack = $derived(
		await getStack({
			type: 'name',
			name: params.name,
			username: params.user,
			index: parseInt(params.index || '0'),
		})
	);

	const url = $derived(
		`/user/${stack.author.username}/stack/${stack.normalizedName}/${optSubpath(stack.index)}`
	);
	const owner = $derived(app.user?.id === stack.author.id);
</script>

<svelte:head>
	<title>'{stack.name}' by {stack.author.username} · Codecritic</title>
</svelte:head>

<article class="stack btn bg-light col start">
	<header class="row space">
		<h1>{stack.name}</h1>
		{#if owner}
			<div class="row gap">
				<a
					href="{url}edit"
					class="btn bg-cyan fg-dark hov-light upcase semibold"
				>
					edit
				</a>
				<details class="delete">
					<summary class="btn bg-red upcase semibold hov-invert">
						delete
					</summary>
					<form {...deleteStack} class="row gap-sm">
						<input
							class="hidden"
							tabindex="-1"
							{...deleteStack.fields.id.as('number')}
							value={stack.id}
						/>
						<p class="fg-dark">This cannot be undone.</p>
						<button type="submit" class="btn bg-red upcase semibold hov-invert">
							confirm
						</button>
					</form>
				</details>
			</div>
		{/if}
	</header>
	{#if stack.description}
		<p class="description">{stack.description}</p>
	{/if}
	{#if stack.tags.length}
		<ul class="tags row wrap">
			{#each stack.tags as tag (tag)}
				<li class="tag fg-dark bg-bright hov-link hov-invert">#{tag}</li>
			{/each}
		</ul>
	{/if}
	<p class="dates fg-dark">
		<span class="fg-yellow">{stack.createdAt.toLocaleDateString('en-GB')}</span>
		{#if stack.updatedAt && stack.updatedAt.getTime() !== stack.createdAt.getTime()}
			<span>· edited</span>
			<span class="fg-yellow">
				{stack.updatedAt.toLocaleDateString('en-GB')}
			</span>
		{/if}
	</p>
	<LikeButton {stack} />
</article>

<ol class="packages col start nogap">
	{#each stack.packages as pkg, i (i)}
		<li class="row">
			<span class="position fg-dark">{i + 1}</span>
			<a href="/packages/{pkg}" class="fg-blue hov-line semibold">{pkg}</a>
		</li>
	{:else}
		<li class="fg-dark">This stack has no packages.</li>
	{/each}
</ol>

<style>
	.stack {
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
	}

	header,
	.description,
	.dates {
		width: 100%;
	}

	.description {
		white-space: pre-wrap;
	}

	.tag {
		word-break: keep-all;
		border-radius: 0.25rem;
		padding: 0 0.25rem;
	}

	.delete {
		display: inline-block;
	}

	summary {
		cursor: pointer;
		list-style: none;
	}

	details[open] form {
		position: absolute;
		margin-top: 0.5rem;
		padding: 0.5rem;
		border-radius: 0.25rem;
		background-color: var(--color-bg-bright);
		right: 1rem;
	}

	.packages {
		list-style: none;
	}

	.packages li {
		width: 100%;
		padding: 0.125rem 0.5rem;
		border-bottom: 1px solid var(--color-bg-brightest);
	}

	.position {
		min-width: 2rem;
		text-align: right;
		font-size: 0.75rem;
	}
</style>
