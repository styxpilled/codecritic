<script lang="ts">
	export let direction = 'row';
</script>

<div class="list">
	<div class="list-info">
		<slot name="head" />
	</div>
	<div class="{direction} list-content">
		<slot name="body" />
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		align-items: center;
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
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: start;
		width: 62rem;
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
