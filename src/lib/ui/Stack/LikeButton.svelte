<script lang="ts">
	import { likeStack, unlikeStack } from '$api/stacks.remote';
	import { app } from '$lib/client/state.svelte';

	let {
		stack,
		href,
	}: {
		stack: {
			id: number;
			author: { id: number };
			liked?: boolean;
			likes?: number;
		};
		/** Link to the "who liked this" page. Without it the count is plain text. */
		href?: string;
	} = $props();

	const likes = $derived(stack.likes ?? 0);
</script>

<div class="row gap-sm">
	{#if !app.user}
		<a href="/login/github" class="fg-dark hov-light">Log in to like</a>
	{:else if app.user.id !== stack.author.id}
		<form
			{...(stack.liked ? unlikeStack : likeStack)
				.for(stack.id)
				.enhance(async ({ submit }) => {
					await submit();
					stack.liked = !stack.liked;
					stack.likes = likes + (stack.liked ? 1 : -1);
				})}
		>
			<input
				class="hidden"
				{...(stack.liked ? unlikeStack : likeStack).fields.id.as('number')}
				value={stack.id}
			/>
			{#if stack.liked}
				<button class="fg-dark hov-light" type="submit">
					<span class="fg-red">❤︎</span>
					 Liked
				</button>
			{:else}
				<button class="fg-dark hov-light" type="submit">
					<span>❤︎</span>
					 Like
				</button>
			{/if}
		</form>
	{/if}
	{#if likes}
		{#if href}
			<a {href} class="fg-dark hov-line">
				{likes}
				{likes === 1 ? 'like' : 'likes'}
			</a>
		{:else}
			<span class="fg-dark">
				{likes}
				{likes === 1 ? 'like' : 'likes'}
			</span>
		{/if}
	{/if}
</div>
