<script lang="ts">
	import type { UserCard } from '#lib/types.ts';
	import Avatar from '#ui/Avatar.svelte';
	import { Compact } from '#ui/FollowButton/index.ts';
	import Name from './Name.svelte';

	let { user = $bindable() }: { user: UserCard } = $props();
	const base = $derived(`/user/${user.username}`);
</script>

<div class="user-row row space">
	<div class="row">
		<a href={base} aria-label="{user.username}'s profile">
			<Avatar {user} size="md" />
		</a>
		<div class="col nogap start text">
			<Name {user} />
			<div class="counts gap-lg fg-dark">
				<a href="{base}/reviews" class="hov-link">
					{user.reviews}
					reviews
				</a>
				<a href="{base}/stacks" class="hov-link">
					{user.stacks}
					stacks
				</a>
				<a href="{base}/likes" class="hov-link">
					{user.likesGiven}
					likes
				</a>
			</div>
		</div>
	</div>
	<Compact bind:user />
</div>

<style>
	.user-row {
		width: 100%;
		min-width: 0;
	}

	.text {
		min-width: 0;
		margin-top: -6px;
	}

	.counts {
		font-size: 0.875rem;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}
</style>
