<script lang="ts">
	import List from '$ui/List.svelte';

	export let data;
</script>

<List width="full">
	<svelte:fragment slot="head">
		<span>Stacks</span>
	</svelte:fragment>
	<svelte:fragment slot="body">
		{#each data.stacks as stack}
			<a class="fg-yellow" href="/user/{data.user.username}/stacks/{stack.id}">{stack.name}</a>
		{/each}
	</svelte:fragment>
</List>
