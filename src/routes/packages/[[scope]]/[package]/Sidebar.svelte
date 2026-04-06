<script lang="ts">
	import Icon from '$ui/Icon.svelte';
	import ReviewEditor from '$ui/Review/Editor.svelte';

	type Props = {
		pkg: any;
	};

	let { pkg }: Props = $props();
	const managers = ['npm', 'pnpm', 'bun', 'deno', 'yarn'];
	let selectedManager = $state('npm');
</script>

<div class="sidebar col start">
	<div class="row">
		{#each managers as manager (manager)}
			<label class="btn pointer hov-light fg-dark bg-bright">
				{manager}
				<input
					class="hidden"
					type="radio"
					name="install"
					value={manager}
					bind:group={selectedManager}
				/>
			</label>
		{/each}
	</div>
	<p class="btn lg fg-dark bg-light row space">
		{#each managers as manager (manager)}
			<span class="command" data-manager={manager}>{manager} add {pkg.name}</span>
		{/each}
		<span class="copy-feedback btn bg-green">Copied!</span>
		<button
			class="copy-btn hov-light js-only"
			onclick={async () => {
				await navigator.clipboard.writeText(`${selectedManager} add ${pkg.name}`);
			}}
		>
			<Icon size="1.25em" id="copy" />
		</button>
	</p>
	<div class="links col start gap-sm">
		<p class="semibold fg-dark">Repository</p>
		<p class="btn lg fg-dark bg-light hov-link">{pkg.repository}</p>
		<p class="semibold fg-dark">Homepage</p>
		<p class="btn lg fg-dark bg-light">
			<a class="hov-link" href={pkg.homepage}>{pkg.homepage}</a>
		</p>
	</div>
	<ReviewEditor {pkg} />
</div>

<style>
	.sidebar {
		display: flex;
		margin-bottom: 1rem;
	}

	.sidebar p,
	.sidebar div {
		width: 100%;
	}

	.command {
		display: none;
	}

	.sidebar:has([value='npm']:checked) [data-manager='npm'],
	.sidebar:has([value='pnpm']:checked) [data-manager='pnpm'],
	.sidebar:has([value='bun']:checked) [data-manager='bun'],
	.sidebar:has([value='deno']:checked) [data-manager='deno'],
	.sidebar:has([value='yarn']:checked) [data-manager='yarn'] {
		display: block;
	}

	label:has(input:checked) {
		--bg: var(--color-bg-brightest);
		--fg: var(--color-text-darker);
	}

	.copy-feedback {
		position-anchor: --copy-anchor;
		position-area: top center;
		position: absolute;
		margin-bottom: 0.25rem;
		display: none;
		transition: display 0.5s allow-discrete;
		&:has(+ button:active) {
			display: block;
		}
	}

	.copy-btn {
		anchor-name: --copy-anchor;
	}

	@media (width >= 1200px) {
		.sidebar {
			float: right;
			margin-top: -5rem;
			max-width: calc(480px - 1rem);
		}
	}
</style>
