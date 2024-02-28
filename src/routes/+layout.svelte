<script lang="ts">
	import Header from '$lib/ui/Header.svelte';
	import '@fontsource-variable/inter';
	import '$styles/remedy.css';
	import '$styles/app.css';
	import '$styles/color.css';
	import '$styles/static.css';
</script>

<div id="root">
	<Header />
	<div id="main">
		<slot />
	</div>
</div>

<style>
	#root {
		background-color: #181a1b;
		height: 100%;
	}

	#main {
		margin: 0 auto;
		padding: 30px 0;
		width: 950px;
	}
</style>
