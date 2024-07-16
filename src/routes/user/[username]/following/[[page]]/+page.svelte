<script lang="ts">
	import { page } from '$app/stores';
	import List from '$ui/List.svelte';
	import User from '$ui/User.svelte';

	export let data;
</script>

<div class="col start">
	{#if data.following?.length > 0}
		<List width="full" wrap={false} align="start">
			<svelte:fragment slot="head">
				<span>Followers:</span>
			</svelte:fragment>
			<svelte:fragment slot="body">
				{#each data.following as follower}
					<User user={follower} />
				{/each}
			</svelte:fragment>
		</List>
	{:else}
		<h3>Noone's following yet!</h3>
	{/if}
	<div class="row space">
		<a
			class="btn"
			href="/user/{data.user.username}/followers/{$page.params?.page && $page.params?.page !== '0'
				? parseInt($page.params.page) - 1
				: ''}"
		>
			Previous
		</a>
		<a
			class="btn"
			href="/user/{data.user.username}/followers/{$page.params?.page
				? parseInt($page.params.page) + 1
				: 1}"
		>
			Next
		</a>
	</div>
</div>

<style>
	ul {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.followers {
		width: max-content;
	}
</style>
