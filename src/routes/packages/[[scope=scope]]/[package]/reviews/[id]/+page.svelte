<script lang="ts">
	import Review from '$ui/Review.svelte';

	let { data } = $props();
</script>

<h1>
	<a href="/packages/{data.pkg.name}" class="hov-link">
		{data.pkg.name}
	</a>
</h1>
<Review review={data.review} redirectToPackage />
