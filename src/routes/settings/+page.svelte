<script lang="ts">
	import { enhance } from '$app/forms';
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
			<p>Theme:</p>
			<p class="test"></p>
		</div>
	</div>
	<!-- <div class="col box">Favourite packages:</div> -->
</div>

<style>
	.test::before {
		content: var(--color-bg);
	}
	/* --color-bg: #181a1b;
	--color-bg-bright: #21252b;
	--color-bg-brighter: #282c34;
	--color-bg-brightest: #404859;

	--color-text: #dcdfe4;
	--color-text-darker: hsl(220, 13%, 80%);
	--color-text-dark: hsl(220, 13%, 55%);

	--fg: var(--color-text);

	--color-red: #e06c75;
	--color-orange: #d19a66;
	--color-yellow: #e5c07b;
	--color-green: #98c379;
	--color-cyan: #56b6c2;
	--color-blue: #61afef;
	--color-purple: #c678dd; */

	.col {
		align-items: flex-start;
	}

	.row {
		align-items: flex-start;
	}

	label {
		display: flex;
		flex-direction: column;
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
