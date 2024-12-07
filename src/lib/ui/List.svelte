<script lang="ts">
	interface Props {
		direction?: string;
		width?: 'fit' | 'full' | 'auto';
		wrap?: boolean;
		align?: 'start' | 'center';
		head?: import('svelte').Snippet;
		body?: import('svelte').Snippet;
	}

	let {
		direction = 'row',
		width = 'auto',
		wrap = true,
		align = 'center',
		head,
		body
	}: Props = $props();
</script>

<div class="list {width}">
	<div class="list-info">
		{@render head?.()}
	</div>
	<div class="{direction} {width} {align} list-content" class:wrap>
		{@render body?.()}
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
		justify-content: space-between;
		align-items: center;
		width: 64rem;
		flex-direction: column;

		&.wrap {
			flex-direction: row;
			flex-wrap: wrap;
			align-items: flex-start;
		}

		&:empty::after {
			content: 'Nothing here...';
			color: var(--color-text-dark);
		}
	}

	.list-content.start {
		align-items: flex-start;
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
