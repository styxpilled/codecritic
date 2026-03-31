<script lang="ts">
	import { dev } from '$app/environment';
	import favicon from '$lib/assets/favicon.png';
	import Footer from '$lib/ui/Footer.svelte';
	import Header from '$lib/ui/Header.svelte';
	import '$styles/remedy.css';
	import '$styles/app.css';
	import '$styles/colors.css';
	import '$styles/static.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{dev ? 'DEV' : 'codecritic'} · Social node package manager package discovery</title>
	<meta name="darkreader-lock" />
</svelte:head>

<div id="root">
	<Header />
	<div id="main">
		{@render children?.()}
	</div>
	<Footer />
</div>

<style>
	#root {
		background-color: var(--color-bg);
	}

	#main {
		margin: 0 auto;
		padding: 1rem 0;
		width: 950px;
		min-height: calc(100dvh - 4.5rem);

		@media (width <= 950px) {
			& {
				width: 100dvw;
			}
		}
	}
</style>
