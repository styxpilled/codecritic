<script lang="ts">
	import type { User } from 'lucia';
	import type { Review } from '$lib/types';
	import Avatar from './Avatar.svelte';

	export let review: Review;
	export let user: User | undefined;
</script>

<a href="/user/{user?.username || ''}">
	<Avatar size="lg" username={user?.username} />
</a>
<p>
	<a href="/packages/{review.package}/reviews/{review.id}">
		Version
		<span>{review.version}</span>
		Used by
		<a class="link" href="/user/{user?.username || ''}"
			>{user?.nickname || user?.username || 'Loading...'}</a
		>
		on
		<span>{new Date(review.created_at).toLocaleDateString('en-US')}</span>
	</a>
</p>

<style>
	a.link {
		color: red;
	}
</style>
