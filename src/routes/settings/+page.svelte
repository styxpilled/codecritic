<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { typedKeys } from '$lib';
	import { defaultDarkTheme, localState, theme } from '$lib/client/state.svelte';
	import { user } from '$lib/client/stores';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<div class="row">
	<div class="col box">
		<h2>Account settings</h2>
		<label>
			<span class="fg-dark">Username:</span>
			<input type="text" value={$user?.username} disabled />
		</label>
		<label>
			<span>Nickname:</span>
			<input type="text" value={$user?.nickname} />
		</label>
		<label>
			<span class="fg-dark">GitHub ID:</span>
			<input type="text" value={$user?.github_id} disabled />
		</label>
		<h3>Profile</h3>
		<form use:enhance action="/settings?/updateProfile" method="post">
			<label>
				<span>Bio:</span>
				<textarea placeholder="Add a bio!" name="bio" value={data.profile.bio}></textarea>
			</label>
			<label>
				<span>URL:</span>
				<input
					type="text"
					placeholder="Add a link to your page!"
					name="url"
					value={data.profile.url}
				/>
			</label>
			<div>
				<p>Links:</p>
				{#if data.profile.links}
					{#each data.profile.links as link}
						<input type="text" value={link} />
					{/each}
				{/if}
				<button class="btn fg-blue"><LucidePlus /> add_link()</button>
			</div>
			<div class="row end"><button type="submit" class="btn bg-green">Save</button></div>
		</form>
	</div>
	<div class="col box">
		<h2>Interface settings</h2>
		<div>
			<label class="row">
				Enable custom theme:
				<input type="checkbox" bind:checked={localState.useCustomTheme} />
			</label>
			<button
				class="btn bg-red"
				disabled={!browser}
				onclick={() => {
					for (const key of typedKeys(defaultDarkTheme)) {
						theme[key] = defaultDarkTheme[key];
					}
				}}
			>
				Clear theme
			</button>
			{#snippet renderTheme()}
				{#each typedKeys(theme) as k}
					<label>
						<span class="row">
							<span class="theme-picker" style="background: {theme[k]};"> </span>
							<span class="key-name">{k}</span>
						</span>
						<input
							type="text"
							disabled={!localState.useCustomTheme || !browser}
							bind:value={theme[k]}
						/>
					</label>
				{/each}
			{/snippet}
			<noscript><p>This feature requires Javascript! Sorry!</p></noscript>
			{@render renderTheme()}
		</div>
	</div>
	<!-- <div class="col box">Favourite packages:</div> -->
</div>

<style>
	.theme-picker {
		width: 1rem;
		height: 1rem;
		margin: 2px;
		border: 1px solid black;
		padding-left: 0.5rem;
	}

	span.row {
		align-items: center;
	}

	.col {
		align-items: flex-start;
	}

	.row {
		align-items: flex-start;
	}

	label {
		display: flex;
		flex-direction: column;

		&.row {
			align-items: center;
			flex-direction: row;
		}
	}

	textarea {
		height: 4rem;
		width: 25rem;
		color: var(--color-text-darker);
		transition: height 250ms ease-in-out;
	}

	textarea:focus-visible {
		height: 10rem;
	}
</style>
