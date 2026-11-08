<script lang="ts">
	import { searchNPM } from '$api/npm.remote';
	import { createStackSchema, updateStackSchema } from '$api/schemas';
	import { createStack, updateStack } from '$api/stacks.remote';
	import { hashColor, optSubpath } from '$lib';
	import Icon from '$ui/Icon.svelte';

	type Stack = {
		id: number;
		name: string;
		normalizedName: string;
		description: string;
		index: number | null;
		packages: string[];
		tags: string[];
		author: { username: string };
	};

	let { stack }: { stack?: Stack } = $props();

	// `updateStack` has every field of `createStack`, plus `id`.
	const t = $derived((stack ? updateStack : createStack) as typeof updateStack);
	const attrs = $derived(
		stack
			? updateStack.preflight(updateStackSchema)
			: createStack.preflight(createStackSchema)
	);

	const cancelHref = $derived(
		stack
			? `/user/${stack.author.username}/stack/${stack.normalizedName}/${optSubpath(stack.index)}`
			: '/stacks'
	);

	let packages = $derived(t.fields.packages.value() || []);
	let tags = $derived(t.fields.tags.value() || []);
	let newPackage = $state('');
	const suggestedPackages = $derived(
		newPackage ? await searchNPM(newPackage) : []
	);

	// Without JavaScript the author edits the comma separated fields, so they hold
	// the current values. With JavaScript the rich lists win, and these fields must
	// stay empty, because the server prefers them when they are not empty.
	let hydrated = $state(false);
	const fallbackPackages = $derived(
		hydrated ? '' : stack?.packages.join(', ') || ''
	);
	const fallbackTags = $derived(hydrated ? '' : stack?.tags.join(', ') || '');

	$effect(() => {
		hydrated = true;
		if (!stack) return;
		if (t.fields.packages.value() === undefined)
			t.fields.packages.set(stack.packages);
		if (t.fields.tags.value() === undefined) t.fields.tags.set(stack.tags);
	});

	const move = (i: number, to: number) => {
		if (to < 0 || to >= packages.length) return;
		const next = [...packages];
		[next[i], next[to]] = [next[to], next[i]];
		t.fields.packages.set(next as string[]);
	};
</script>

<form {...attrs} class="btn bg-light fg-dark row start">
	<h1>{stack ? 'Edit Stack' : 'New Stack'}</h1>
	{#if stack}
		<input
			class="hidden"
			tabindex="-1"
			{...t.fields.id.as('number')}
			value={stack.id}
		/>
	{/if}
	<label class="name">
		<span>Name</span>
		<input
			{...t.fields.name.as('text')}
			value={stack?.name}
			placeholder="Stack name:"
		/>
	</label>
	<div class="tags js-only">
		<label for="_tags">Tags:</label>
		{@render listInput(tags, t.fields.tags, '_tags', 'Add tags:')}
		{@render list(tags, t.fields.tags, false)}
	</div>
	<div class="tags no-js">
		{#if tags.length === 0}
			<input
				class="hidden"
				tabindex="-1"
				{...t.fields.tags[0].as('text')}
				value=""
			/>
		{/if}
		<label>
			<span>Tags: (comma separated)</span>
			<input {...t.fields.tagsString.as('text')} value={fallbackTags} />
		</label>
	</div>
	<div class="pkgs js-only">
		<label for="_packages">Packages:</label>
		<div class="row">
			{@render listInput(
				packages,
				t.fields.packages,
				'_packages',
				'Add a package:'
			)}
			<span>or</span>
			<label
				class="stack-import-btn btn bg-green semibold upcase hov-invert pointer"
			>
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
							t.fields.packages.set(pkgs);
						};
						reader.readAsText(file);
					}}
				/>
			</label>
		</div>
		{@render list(packages, t.fields.packages, true)}
	</div>
	<div class="pkgs no-js">
		{#if packages.length === 0}
			<input
				class="hidden"
				tabindex="-1"
				{...t.fields.packages[0].as('text')}
				value=""
			/>
		{/if}
		<label>
			<span>Packages: (comma separated, in order)</span>
			<input {...t.fields.packagesString.as('text')} value={fallbackPackages} />
		</label>
	</div>
	<div class="desc col end">
		<label>
			<span>Description</span>
			<textarea
				{...t.fields.description.as('text')}
				value={stack?.description}
				placeholder="Stack description:"></textarea>
		</label>
	</div>
	<div class="foot row space end">
		<div class="row start">
			{#each t.fields.allIssues()?.slice(0, 1) as issue (issue)}
				<p class="issue"><em>{issue.message};</em></p>
			{/each}
		</div>
		<div class="row end">
			<a href={cancelHref} class="btn bg-red upcase semibold hov-invert">
				cancel
			</a>
			<button type="submit" class="btn bg-green upcase semibold hov-invert">
				save
			</button>
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
		onkeydown={(e) => {
			// Enter adds an item. The default action submits the form, and it happens
			// on keydown, so it is too late to stop it on keyup.
			if (e.key !== 'Enter') return;
			e.preventDefault();
			const value = e.currentTarget.value.trim();
			if (value && !items.includes(value)) {
				fields.set(items.concat([value]));
			}
			e.currentTarget.value = '';
			if (id === '_packages') newPackage = '';
		}}
		oninput={(e) => {
			if (id === '_packages') newPackage = e.currentTarget.value;
		}}
		{id}
		{placeholder}
	/>
	{#if id === '_packages'}
		<div class="package-suggestions col btn fg-dark">
			{#each suggestedPackages as pkg (pkg.name)}
				{@const color = hashColor(pkg.name)}
				<button
					type="button"
					class="btn bg-{color} fg-bright hov-invert row"
					onclick={() => {
						if (!items.includes(pkg.name)) {
							fields.set(items.concat([pkg.name]));
							newPackage = '';
							const el = document.getElementById('_packages');
							// @ts-expect-error its fine
							if (el && el?.value) el.value = '';
						}
					}}
				>
					{pkg.name}
				</button>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet list(
	items: (string | undefined)[],
	fields: typeof createStack.fields.packages,
	reorder: boolean
)}
	<ul class="row wrap">
		{#each items as pkg, i (i)}
			{#if pkg}
				{@const color = hashColor(pkg)}
				<div class="row nogap">
					{#if reorder}
						<button
							class="move fg-dark hov-light"
							type="button"
							title="Move up"
							disabled={i === 0}
							onclick={() => move(i, i - 1)}
						>
							↑
						</button>
						<button
							class="move fg-dark hov-light"
							type="button"
							title="Move down"
							disabled={i === items.length - 1}
							onclick={() => move(i, i + 1)}
						>
							↓
						</button>
					{/if}
					<button
						class="btn bg-{color} fg-bright hov-invert row"
						type="button"
						onclick={() => {
							const newItems = [...items];
							newItems.splice(i, 1);
							fields.set(newItems as string[]);
						}}
					>
						{pkg}
						<Icon id="x" size="1em" />
					</button>
					<input
						tabindex="-1"
						class="hidden bg-yellow"
						{...fields[i].as('text')}
					/>
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

	.move {
		background: none;
		border: none;
		padding: 0 0.125rem;
		cursor: pointer;
	}

	.move:disabled {
		cursor: not-allowed;
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
