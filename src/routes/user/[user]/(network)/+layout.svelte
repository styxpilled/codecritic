<script lang="ts">
	import SubNav from '$ui/SubNav.svelte';

	let { children, params } = $props();
	const base = $derived(`/user/${params.user}`);
</script>

<SubNav
	links={[
		{ label: 'following', href: `${base}/following` },
		{ label: 'followers', href: `${base}/followers` },
		{ label: 'mutuals', href: `${base}/mutuals` },
	]}
/>
{@render children?.()}
