<script lang="ts">
	import { getStack } from '#api/stacks.remote.ts';
	import { app } from '#lib/client/state.svelte.ts';
	import Editor from '#ui/Stack/Editor.svelte';

	let { params } = $props();

	const stack = $derived(
		await getStack({
			type: 'name',
			name: params.name,
			username: params.user,
			index: parseInt(params.index || '0'),
		})
	);
</script>

<svelte:head>
	<title>Edit '{stack.name}' · Codecritic</title>
</svelte:head>

{#if app.user?.id === stack.author.id}
	<Editor {stack} />
{:else}
	<div class="refusal col start">
		<h1>Forbidden</h1>
		<p class="fg-dark">Only {stack.author.username} can edit this stack.</p>
		{#if !app.user}
			<a href="/login/github" class="btn bg-green upcase semibold hov-invert">
				log in
			</a>
		{/if}
	</div>
{/if}

<style>
	.refusal {
		margin: 2rem 1rem;
	}
</style>
