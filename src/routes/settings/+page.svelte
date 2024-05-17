<script lang="ts">
	import { enhance } from '$app/forms';
	import { user } from '$lib/client/stores';

	export let data;
</script>

<div class="row">
	<div class="col box">
		<h2>Account settings</h2>
		<label>
			<span>Username:</span>
			<input type="text" value={$user?.username} disabled />
		</label>
		<label>
			<span>Nickname:</span>
			<input type="text" value={$user?.nickname} />
		</label>
		<label>
			<span>GitHub ID:</span>
			<input type="text" value={$user?.githubId} disabled />
		</label>
		<h3>Profile</h3>
		<form use:enhance action="/settings?/updateProfile" method="post">
			<label>
				<span>Bio:</span>
				<input type="text" placeholder="Add a bio!" name="bio" value={data.profile.bio} />
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
			<p>Links:</p>
			{#if data.profile.links}
				{#each data.profile.links as link}
					<input type="text" value={link} />
				{/each}
			{/if}
			<button class="btn fg-blue"><LucidePlus /> add_link()</button>
		</form>
	</div>
	<div class="col box">Favourite packages:</div>
</div>

<style>
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
</style>
