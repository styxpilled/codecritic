<script lang="ts">
	import Review from '$ui/Review.svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

{data.pkg.name} TODO
<Review review={data.review} redirectToPackage showPackageName />
