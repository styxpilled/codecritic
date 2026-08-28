<script lang="ts">
	import { searchNPM } from '$api/npm.remote';
	import { createStackSchema } from '$api/schemas';
	import { createStack } from '$api/stacks.remote';
	import { COLORS } from '$lib';
	import Icon from '$ui/Icon.svelte';

	let packages = $derived(createStack.fields.packages.value() || []);
	let tags = $derived(createStack.fields.tags.value() || []);
	let newPackage = $state('');
	const suggestedPackages = $derived(newPackage ? await searchNPM(newPackage) : []);
	$inspect(suggestedPackages);
</script>

<form {...createStack.preflight(createStackSchema)} class="btn bg-light fg-dark row start">
	<h1>New Stack</h1>
	<label class="name">
		<span>Name</span>
		<input {...createStack.fields.name.as('text')} placeholder="Stack name:" />
	</label>
	<div class="tags js-only">
		<label for="_tags">Tags:</label>
		{@render listInput(tags, createStack.fields.tags, '_tags', 'Add tags:')}
		{@render list(tags, createStack.fields.tags)}
	</div>
	<div class="tags no-js">
		{#if tags.length === 0}
			<input class="hidden" tabindex="-1" {...createStack.fields.tags[0].as('text')} value="" />
		{/if}
		<label>
			<span>Tags: (comma separated)</span>
			<input {...createStack.fields.tagsString.as('text')} />
		</label>
	</div>
	<div class="pkgs js-only">
		<label for="_packages">Packages:</label>
		<div class="row">
			{@render listInput(packages, createStack.fields.packages, '_packages', 'Add a package:')}
			<span>or</span>
			<label class="stack-import-btn btn bg-green semibold upcase hov-invert pointer">
				<span>import</span>
				<input
					form="none"
					type="file"
					name=""
					id="stack-import"
					accept=".json"
					onchange={(e) => {
						const file = e.currentTarget?.files?.[0];
						if (!file) return;
						const reader = new FileReader();
						reader.onload = () => {
							if (typeof reader.result !== 'string') return;
							const imported = JSON.parse(reader.result || '{}');
							const pkgs: string[] = [];
							for (const pkg in imported?.dependencies) {
								if (!pkgs.includes(pkg)) {
									pkgs.push(pkg);
								}
							}
							for (const pkg in imported?.devDependencies) {
								if (!pkgs.includes(pkg)) {
									pkgs.push(pkg);
								}
							}
							createStack.fields.packages.set(pkgs);
						};
						reader.readAsText(file);
					}}
				/>
			</label>
		</div>
		{@render list(packages, createStack.fields.packages)}
	</div>
	<div class="pkgs no-js">
		{#if packages.length === 0}
			<input class="hidden" tabindex="-1" {...createStack.fields.packages[0].as('text')} value="" />
		{/if}
		<label>
			<span>Packages: (comma separated)</span>
			<input {...createStack.fields.packagesString.as('text')} />
		</label>
	</div>
	<div class="desc col end">
		<label>
			<span>Description</span>
			<textarea {...createStack.fields.description.as('text')} placeholder="Stack description:"
			></textarea>
		</label>
	</div>
	<div class="foot row space end">
		<div class="row start">
			{#each createStack.fields.allIssues()?.slice(0, 1) as issue (issue)}
				<p class="issue"><em>{issue.message};</em></p>
			{/each}
		</div>
		<div class="row end">
			<a href="/stacks" class="btn bg-red upcase semibold hov-invert">cancel</a>
			<button type="submit" class="btn bg-green upcase semibold hov-invert">save</button>
		</div>
	</div>
</form>

{#snippet listInput(
	items: (string | undefined)[],
	fields: typeof createStack.fields.packages,
	id: string,
	placeholder: string
)}
	<input
		type="text"
		onkeyup={(e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				if (!items.includes(e.currentTarget.value)) {
					fields.set(items.concat([e.currentTarget.value]));
				}
				e.currentTarget.value = '';
			}
			if (id === '_packages') {
				newPackage = e.currentTarget.value;
			}
		}}
		{id}
		{placeholder}
	/>
	{#if id === '_packages'}
		<div class="package-suggestions col btn fg-dark">
			{#each suggestedPackages as pkg (pkg.name)}
				{@const colorIndex =
					pkg.name
						.split('')
						.map((c) => c.charCodeAt(0))
						.reduce((a, b) => a + b) % COLORS.length}
				{@const color = COLORS[colorIndex]}
				<button
					class="btn bg-{color} fg-bright hov-invert row"
					onclick={() => {
						if (!items.includes(pkg.name)) {
							fields.set(items.concat([pkg.name]));
							newPackage = '';
							const el = document.getElementById('_packages');
							// @ts-expect-error its fine
							if (el && el?.value) el.value = '';
						}
					}}>{pkg.name}</button
				>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet list(items: (string | undefined)[], fields: typeof createStack.fields.packages)}
	<ul class="row wrap">
		{#each items as pkg, i (i)}
			{#if pkg}
				{const colorIndex =
					pkg
						.split('')
						.map((c) => c.charCodeAt(0))
						.reduce((a, b) => a + b) % COLORS.length}
				{const color = COLORS[colorIndex]}
				<div>
					<button
						class="btn bg-{color} fg-bright hov-invert row"
						type="button"
						onclick={() => {
							const newItems = [...items];
							newItems.splice(i, 1);
							fields.set(newItems);
						}}
					>
						{pkg}
						<Icon id="x" size="1em" />
					</button>
					<input tabindex="-1" class="hidden bg-yellow" {...fields[i].as('text')} />
				</div>
			{/if}
		{/each}
	</ul>
{/snippet}

<style>
	form {
		padding: 0.5rem 1rem;
		margin: 0 1rem;
		display: grid;
		grid-template-columns: 0.75fr 1.25fr 2fr;
		grid-template-rows: auto auto 3fr auto;
		gap: 0.5rem;
		grid-template-areas:
			'h1 h1 h1'
			'name name desc'
			'tags pkgs desc'
			'foot foot foot';
		@media (width <=950px) {
			grid-template-columns: 1fr;
			grid-template-areas: 'h1' 'name' 'desc' 'tags' 'pkgs' 'foot';
		}
	}
	h1 {
		grid-area: h1;
	}
	.name {
		grid-area: name;
	}
	.desc {
		grid-area: desc;
	}
	.tags {
		grid-area: tags;
	}
	.pkgs {
		grid-area: pkgs;
	}
	.foot {
		grid-area: foot;
	}
	input,
	textarea {
		width: 100%;
	}
	label:has(textarea) {
		width: 100%;
	}
	textarea {
		height: 8lh;
	}
	input[type='file'] {
		height: 0;
		width: 0;
		padding: 0;
		&:focus-visible {
			outline: none;
		}
	}

	label {
		display: flex;
		flex-direction: column;
		align-items: start;
	}

	ul {
		margin: 0.5rem;
	}

	.hov-invert {
		--fg: var(--color-bg);
	}

	input#_packages {
		anchor-name: --packages-suggestions;
	}

	.pkgs:focus-within {
		.package-suggestions {
			display: flex;
		}
	}

	.package-suggestions {
		display: none;
		position-anchor: --packages-suggestions;
		position: absolute;
		position-area: bottom center;
		margin-top: 2px;
		padding-top: 0.5rem;
		max-height: 10rem;
		width: 100%;
		overflow-y: scroll;
	}
</style>
