<script lang="ts">
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<Review review={data.review} />
