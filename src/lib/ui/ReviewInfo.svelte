<script lang="ts">
	import type { User } from 'lucia';
	import type { Review } from '$lib/types';
	import Avatar from './Avatar.svelte';

	export let review: Review;
	export let user: User | undefined;
</script>

<Avatar size="lg" username={user?.username} />
<p>
	Version
	<span>{review.version}</span>
	Used by
	<a href="/user/{user?.nickname || ''}">{user?.nickname || user?.username || 'Loading...'}</a>
	on
	<span>{new Date(review.created_at).toLocaleDateString('en-US')}</span>
</p>

<style>
	a {
		color: red;
	}
</style>
