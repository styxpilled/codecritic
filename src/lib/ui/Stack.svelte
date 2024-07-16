<script lang="ts">
	import type { Stack } from '$lib/types';
	import Avatar from './Avatar.svelte';

	export let stack: Stack & { packages?: number };
</script>

<div class="stack col start">
	<h3 class="fg-yellow hov-line">
		<a
			href={typeof stack.author === 'string'
				? `/user/${stack.author}/stacks/${stack.id}`
				: `/user/${stack.author.username}/stacks/${stack.id}`}
		>
			{stack.name}
		</a>
	</h3>
	{#if typeof stack.author !== 'string'}
		<div class="row">
			<Avatar username={stack.author.username} size="sm" />
			<span class="fg-purple">stack by</span>
			<a class="fg-red hov-line" href="/user/{stack.author.username || ''}">
				{stack.author.nickname || stack.author.username || 'Loading...'}<span class="fg-text"
					>;</span
				>
			</a>
		</div>
	{/if}

	<p class="fg-dark">{stack.description}</p>
	{#if stack.packages}
		<div class="row">
			<p class="fg-green">"{stack.packages}"</p>
			<p class="fg-yellow">packages</p>
		</div>
	{/if}
</div>

<style>
	.stack {
		background-color: var(--color-bg-bright);
		padding: 0.5rem;
		border-radius: 0.5rem;
	}
</style>
