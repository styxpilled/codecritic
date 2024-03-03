<script lang="ts">
	import { user } from '$lib/client/stores';
	import Header from '$lib/ui/Header.svelte';
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

<div id="root">
	<Header />
	<div id="main">
		<slot />
	</div>
</div>

<style>
	/* #root {
		height: 100%;
	} */

	#main {
		margin: 0 auto;
		padding: 30px 0;
		width: 1200px;
	}
</style>
