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
		{selectedManager} add {pkg.name}
		<button class="">
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
	}

	.sidebar p,
	.sidebar div {
		/* background: var(--color-bg-bright); */
		width: 100%;
	}

	label:has(input:checked) {
		--bg: var(--color-bg-brightest);
		--fg: var(--color-text-darker);
	}

	@media (width >= 1200px) {
		.sidebar {
			float: right;
			/* margin-top: -3rem; */
			/* margin-left: 0.5rem; */
			max-width: calc(480px - 1rem);
		}
	}
</style>
