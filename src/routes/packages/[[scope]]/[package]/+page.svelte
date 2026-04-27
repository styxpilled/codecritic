<script lang="ts">
	import { getNPMPackage } from '$api/npm.remote.js';
	import { getReadme } from '$api/readme.remote';
	import Readme from '$ui/Readme.svelte';
	import Sidebar from './Sidebar.svelte';

	let { params } = $props();
	const readme = $derived(await getReadme(params));
	const pkg = $derived(await getNPMPackage(params));
</script>

<svelte:head>
	<title>{pkg.name} · Codecritic</title>
</svelte:head>

<Sidebar {pkg} />
<Readme readme={readme.value} url={readme.url} />
