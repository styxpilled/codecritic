<script lang="ts">
	import { getContext } from 'svelte';
	import { app } from '#lib/client/state.svelte.ts';
	import type { RemoteForm, RemoteQueryUpdate } from '$app/server';

	type Form = RemoteForm<
		{
			_id: number;
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

		/** Link to the "who liked this" page. Without it the count is plain text. */
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
		href?: string;
	} = $props();

	let likes = $derived(obj.likes ?? 0);
	let liked = $derived(obj.liked ?? false);

	const groupID = getContext<number | undefined>('group-id');
	const key = groupID ? `${groupID}:${obj.id}` : obj.id;
</script>

<div class="row gap-sm">
	{#if !app.user}
		<a href="/login/github" class="fg-dark hov-light log-in">
			<span>❤︎</span>
			Like
		</a>
	{:else if app.user.id !== authorID}
		{@const form = (obj.liked ? unlike : like).for(key)}
		<form
			{...form.enhance(({ submit }) => {
				liked = !liked;
				likes = likes + (liked ? 1 : -1);

				submit()
					.updates(...(updates ?? []))
					.catch(() => {
						obj.liked = !obj.liked;
						obj.likes = likes - (obj.liked ? 1 : -1);
					});
			})}
		>
			<input class="hidden" {...form.fields._id.as('number')} value={obj.id} />
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
