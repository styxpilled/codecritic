<script lang="ts">
	import SubNav from '#ui/SubNav.svelte';

	let { children, params } = $props();
	const base = $derived(`/user/${params.user}/reviews`);
</script>

<SubNav
	links={[
		{ label: 'recent', href: base },
		{ label: 'popular', href: `${base}/popular` },
	]}
/>
{@render children?.()}
