<script lang="ts">
	import { page } from '$app/stores';
	import User from '$ui/User.svelte';

	export let data;
</script>

<div class="followers">
	<h3>Following:</h3>
	<ul>
		{#each data.following as follower}
			<li>
				<User user={follower} />
			</li>
		{/each}
	</ul>
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
