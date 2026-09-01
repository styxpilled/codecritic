<script lang="ts">
	import type { RemoteForm, RemoteQueryUpdate } from '@sveltejs/kit';
	import { app } from '$lib/client/state.svelte';

	type Form = RemoteForm<
		{
			id: number;
		},
		void
	>;

	let {
		obj = $bindable(),
		href,
		authorID,
		like,
		unlike,
		updates,
	}: {
		obj: {
			id: number;
			liked?: boolean;
			likes?: number;
		};
		authorID: number;
		like: Form;
		unlike: Form;
		updates?: RemoteQueryUpdate[];
		/** Link to the "who liked this" page. Without it the count is plain text. */
		href?: string;
	} = $props();

	let likes = $derived(obj.likes ?? 0);
	let liked = $derived(obj.liked ?? false);
</script>

<div class="row gap-sm">
	{#if !app.user}
		<a href="/login/github" class="fg-dark hov-light">Log in to like</a>
	{:else if app.user.id !== authorID}
		<form
			{...(obj.liked ? unlike : like).for(obj.id).enhance(({ submit }) => {
				liked = !obj.liked;
				likes = likes + (liked ? 1 : -1);
				submit()
					.updates(...(updates ?? []))
					.catch(() => {
						obj.liked = !obj.liked;
						obj.likes = likes - (obj.liked ? 1 : -1);
					})
					.finally(() => {
						console.log('after');
					});
			})}
		>
			<input
				class="hidden"
				{...(liked ? unlike : like).fields.id.as('number')}
				value={obj.id}
			/>
			{#if liked}
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
