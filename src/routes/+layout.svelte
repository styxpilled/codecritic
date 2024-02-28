<script lang="ts">
	import Header from '$lib/ui/Header.svelte';
	import '@fontsource-variable/inter';
	import '$styles/remedy.css';
	import '$styles/app.css';
	import '$styles/color.css';
	import '$styles/static.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { session, supabase } from '$lib/client/stores.js';

	export let data;
	$: {
		$supabase = data.supabase;
		$session = data.session;
	}

	onMount(() => {
		const {
			data: { subscription }
		} = $supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== $session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
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
