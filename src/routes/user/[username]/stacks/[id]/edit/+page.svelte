<script lang="ts">
	import StackEdit from '$ui/pages/StackEdit.svelte';

	export let data;
</script>

<StackEdit stack={data.stack} />
