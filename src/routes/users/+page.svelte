<script lang="ts">
	import List from '$ui/List.svelte';
	import SimplePage from '$ui/SimplePage.svelte';
	import User from '$ui/User.svelte';

	export let data;
</script>

<SimplePage>
	<h2 class="fg-dark">10x developers, funny little guys and friends - find popular members.</h2>
	<List direction="col" wrap={false} align="start" width="full">
		<svelte:fragment slot="head">
			<span>users todo replace this</span>
			<span>more</span>
		</svelte:fragment>
		<svelte:fragment slot="body">
			{#each data.users as user}
				<User {user} />
			{/each}
		</svelte:fragment>
	</List>
</SimplePage>
