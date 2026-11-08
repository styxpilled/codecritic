<script lang="ts">
	import type { UserCard } from '$lib/types';
	import Avatar from '$ui/Avatar.svelte';
	import { Compact } from '$ui/FollowButton';
	import Favorites from './Favorites.svelte';
	import Name from './Name.svelte';

	let { user = $bindable() }: { user: UserCard } = $props();
	const base = $derived(`/user/${user.username}`);
</script>

<article class="card btn col start">
	<div class="row gap-lg">
		<Avatar {user} size="lg">
			{#snippet link(avatar)}
				<a href={base} aria-label="{user.username}'s profile">
					{@render avatar()}
				</a>
			{/snippet}
			{#snippet badge()}
				<Compact bind:user />
			{/snippet}
		</Avatar>
		<div class="col nogap text">
			<Name {user} />
			<div class="counts row fg-dark">
				<a href="{base}/reviews" class="hov-link">
					<span class="">{user.reviews}</span>
					reviews
				</a>
				<a href="{base}/stacks" class="hov-link">
					<span class="">{user.stacks}</span>
					stacks
				</a>
			</div>
		</div>
	</div>
	<Favorites packages={user.favorites} />
</article>

<style>
	.card {
		width: 100%;
		padding: 0.75rem;
		gap: 0.5rem;
		align-items: stretch;
		min-width: 0;
	}

	.text {
		min-width: 0;
		flex: 1;
	}

	.counts {
		font-size: 0.875rem;
	}
</style>
