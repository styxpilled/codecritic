<script lang="ts">
	import { user } from '$lib/client/stores';
	import Header from '$lib/ui/Header.svelte';
	import Footer from '$ui/Footer.svelte';
	import '@fontsource-variable/inter';
	import '$styles/remedy.css';
	import '$styles/app.css';
	import '$styles/color.css';
	import '$styles/static.css';

	export let data;

	$: {
		$user = data.auth.user;
	}
</script>

<svelte:head>
	<title>codecritic · Social node package manager package discovery</title>
</svelte:head>

<div id="root">
	<Header />
	<div id="main">
		<slot />
	</div>
	<Footer />
</div>

<style>
	#main {
		margin: 0 auto;
		padding: 30px 0;
		width: 1200px;
		min-height: calc(100dvh - 4.5rem);
	}
</style>
