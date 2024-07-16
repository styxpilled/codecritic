<script lang="ts">
	import Review from '$ui/Review.svelte';

	export let data;
</script>

{data.pkg.name} TODO
<Review review={data.review} redirectToPackage showPackageName />
