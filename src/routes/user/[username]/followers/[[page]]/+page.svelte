<script lang="ts">
	import { page } from '$app/stores';
	import List from '$ui/List.svelte';
	import User from '$ui/User.svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<div class="col start">
	{#if data.followers?.length > 0}
		<List width="full" wrap={false} align="start">
			{#snippet head()}
					
					<span>Followers:</span>
				
					{/snippet}
			{#snippet body()}
					
					{#each data.followers as follower}
						<User user={follower} />
					{/each}
				
					{/snippet}
		</List>
	{:else}
		<h3>Not following anyone yet!</h3>
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
