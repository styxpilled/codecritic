<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let data;

	onMount(() => {
		console.log(data);
	});
</script>

<h1>{$page.params.package}</h1>
<p class="description">{data.package.description}</p>
<!-- {data.package.} -->
<form method="post" use:enhance>
	<label>
		<span>Review</span>
		<input name="review" type="text" />
	</label>
	<label>
		<span>Version</span>
		<input name="version" type="text" value={data.package['dist-tags'].latest} />
	</label>
	<button type="submit">submit</button>
</form>
