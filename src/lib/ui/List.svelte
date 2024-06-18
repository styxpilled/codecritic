<script lang="ts">
	export let direction = 'row';
	export let width: 'fit' | 'full' | undefined = undefined;
</script>

<div class="list {width}">
	<div class="list-info">
		<slot name="head" />
	</div>
	<div class="{direction} {width} list-content">
		<slot name="body" />
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.list.full {
		width: 100%;
	}

	.list-info {
		display: flex;
		justify-content: space-between;
		text-transform: uppercase;
		font-size: 0.8rem;
		letter-spacing: 0.975px;
		border-bottom: 1px solid slategrey;
		margin-bottom: 0.5rem;
		width: 100%;
	}

	.list-content {
		display: flex;
		gap: 0.5rem;
		padding: 0 0.5rem;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: start;
		width: 62rem;
	}

	.list-content.fit {
		width: fit-content;
	}

	.list-content.full {
		width: 100%;
	}

	@media (width <= 65rem) {
		.list-content {
			width: 41rem;
		}
	}

	@media (width <= 43rem) {
		.list-content {
			width: 22rem;
			justify-content: center;
		}
	}
</style>
