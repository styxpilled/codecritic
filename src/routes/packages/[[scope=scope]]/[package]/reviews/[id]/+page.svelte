<script lang="ts">
	import Review from '$ui/Review.svelte';

	let { data } = $props();
</script>

<h1>{data.pkg.name}</h1>
<Review review={data.review} redirectToPackage />
