<script lang="ts">
	import { getReadme } from '$api/readme.remote';
	import { toPackageName } from '$lib';
	import Readme from '$ui/Readme.svelte';

	let { params } = $props();
	const readme = $derived(await getReadme(toPackageName(params)));
</script>

<svelte:head>
	<title>{toPackageName(params)} · Codecritic</title>
</svelte:head>

<Readme html={readme.html ?? ''} />
