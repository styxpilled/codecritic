<script lang="ts">
	import StackEdit from '$ui/pages/StackEdit.svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<StackEdit stack={data.stack} />
