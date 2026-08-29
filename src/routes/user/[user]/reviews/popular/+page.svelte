<script lang="ts">
	import ReviewList from '../ReviewList.svelte';

	const { params } = $props();
</script>

<ReviewList username={params.user} sort="popular" />
