<script lang="ts">
	import { dev } from '$app/environment';
	import favicon from '$lib/assets/favicon.png';
	import Footer from '$lib/ui/Footer.svelte';
	import Header from '$lib/ui/Header.svelte';
	import '@fontsource-variable/inter';
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
		background: linear-gradient(
			oklab(from var(--color-bg) calc(l * 0.9) a b),
			var(--color-bg) 400px
		);
	}

	#main {
		margin: 0 auto;
		padding: 1rem 0;
		width: 950px;
		min-height: calc(100dvh - 4.5rem);

		/* background-color: red; */
		@media (width <= 950px) {
			& {
				width: 100dvw;
			}
		}
	}
</style>
