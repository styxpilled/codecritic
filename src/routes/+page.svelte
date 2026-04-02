<script lang="ts">
	import { app } from '$lib/client/state.svelte';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
{#if app.user}
	<p>
		hello, {app.user?.username}!
	</p>
{/if}
