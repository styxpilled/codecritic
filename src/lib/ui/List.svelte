<script lang="ts">
	import type { Package, ReviewedPackage } from '$lib/types';
</script>

<div class="list">
	<div class="list-info">
		<slot name="head" />
	</div>
	<div class="list-content">
		<slot name="body" />
	</div>
</div>

<style>
	.list-content {
		display: flex;
		gap: 0.5rem;
	}

	.list-info {
		display: flex;
		justify-content: space-between;
		text-transform: uppercase;
		font-size: 0.8rem;
		letter-spacing: 0.975px;
		border-bottom: 1px solid slategrey;
		margin-bottom: 0.5rem;
	}
</style>
