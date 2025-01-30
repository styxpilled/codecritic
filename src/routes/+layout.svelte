<script lang="ts">
	import { user } from '$lib/client/stores';
	import Header from '$lib/ui/Header.svelte';
	import Footer from '$ui/Footer.svelte';
	import '@fontsource-variable/inter';
	import '$styles/remedy.css';
	import '$styles/app.css';
	import '$styles/color.css';
	import '$styles/static.css';
	import { browser, dev } from '$app/environment';
	import { typedKeys } from '$lib';
	import { localState, theme } from '$lib/client/state.svelte';
	import { untrack } from 'svelte';

	interface Props {
		data: any;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	$user = data.auth.user;

	if (browser) {
		document.cookie = 'js=1; Secure';
	}

	$effect(() => {
		$user = data.auth.user;
	});

	let out = $state('');
	$effect(() => {
		out = '';
		if (localState.useCustomTheme) {
			untrack(() => {
				for (const key of typedKeys(theme)) {
					out += `--${key.replaceAll('_', '-')}: ${theme[key]} !important;`;
				}
			});
		}
	});
</script>

<svelte:head>
	<title>{dev ? 'DEV' : 'codecritic'} · Social node package manager package discovery</title>
	<meta name="darkreader-lock" />
</svelte:head>

<div id="root" style={out}>
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

		@media (width <= 950px) {
			& {
				width: 100vw;
			}
		}

		min-height: calc(100dvh - 4.5rem);
	}
</style>
