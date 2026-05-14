<script lang="ts">
	import { getStack } from '$api/stacks.remote.js';

	let { params } = $props();

	const stack = $derived(
		await getStack({
			name: params.name,
			username: params.user,
			index: parseInt(params.index || '0'),
		})
	);
</script>

<h1>{stack.name}</h1>
<p>{stack.description}</p>
{#each stack.packages as pkg (pkg)}
	{pkg}
{/each}
