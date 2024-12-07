<script lang="ts">
	import type { BannerGenerator } from '$lib/client/ads';

	let {
		rand
	}: {
		rand: BannerGenerator;
	} = $props();

	const banner = rand.getAd();
</script>

<div class="banner bg-light">
	<p class="title">{banner.title}</p>
	<p class="fg-dark">{banner.text}</p>
</div>

<style>
	.banner {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		margin: 0.5rem 0;
	}

	.title {
		font-size: 1.25rem;
	}
</style>
