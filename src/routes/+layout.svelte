<script lang="ts">
	// @ts-expect-error font
	import '@fontsource-variable/inter';
	import { app } from '$lib/client/state.svelte';
	import { dev } from '$app/environment';
	import favicon from '$lib/assets/favicon.png';
	import Footer from '$lib/ui/Footer.svelte';
	import Header from '$lib/ui/Header.svelte';
	// sort-imports-ignore
	import '$styles/remedy.css';
	import '$styles/app.css';
	import '$styles/colors.css';
	import '$styles/static.css';

	let { children, data } = $props();
	// svelte-ignore state_referenced_locally
	app.user = data.auth.user;
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
		/* height: max-content; */
		/* background: red; */
		/* outline: 1px solid red; */
		/* outline-offset: 0; */

		/* background-color: red; */
		@media (width <= 950px) {
			& {
				width: 100dvw;
			}
		}
	}
</style>
