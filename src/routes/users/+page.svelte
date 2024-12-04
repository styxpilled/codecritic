<script lang="ts">
	import List from '$ui/List.svelte';
	import SimplePage from '$ui/SimplePage.svelte';
	import User from '$ui/User.svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<SimplePage>
	<h2 class="fg-dark">10x developers, funny little guys and friends - find popular members.</h2>
	<List direction="col" wrap={false} align="start" width="full">
		{#snippet head()}
			
				<span>users todo replace this</span>
				<span>more</span>
			
			{/snippet}
		{#snippet body()}
			
				{#each data.users as user}
					<User {user} />
				{/each}
			
			{/snippet}
	</List>
</SimplePage>
