<script lang="ts">
	import List from '$ui/List.svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<List width="full">
	{#snippet head()}
	
			<span>Stacks</span>
		
	{/snippet}
	{#snippet body()}
	
			{#each data.stacks as stack}
				<a class="fg-yellow" href="/user/{data.user.username}/stacks/{stack.id}">{stack.name}</a>
			{/each}
		
	{/snippet}
</List>
