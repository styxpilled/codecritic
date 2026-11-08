<script lang="ts">
	import { getReviewLikes } from '#api/reviews.remote.ts';
	import { toPackageName } from '#lib';
	import Avatar from '#ui/Avatar.svelte';
	import List from '#ui/List.svelte';

	let { params } = $props();
	const users = $derived(
		await getReviewLikes({
			type: 'name',
			author: params.user,
			package: toPackageName(params),
			index: parseInt(params.index || '0'),
		})
	);
</script>

<List>
	{#each users as user (user.id)}
		<div>
			<Avatar {user} />
			{user.username}
		</div>
	{/each}
</List>
