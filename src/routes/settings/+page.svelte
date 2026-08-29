<script lang="ts">
	import { updateProfileSchema } from '$api/schemas';
	import { getProfile, updateProfile } from '$api/user.remote';
	import { app } from '$lib/client/state.svelte';

	const user = await getProfile(app.user?.username || '');
</script>

<form
	{...updateProfile.preflight(updateProfileSchema)}
	class="col start bg-light round"
>
	<label class="col start">
		<span class="fg-dark">username</span>
		<input value={user.username} disabled />
		<small class="fg-dark">Your username comes from GitHub.</small>
	</label>
	<label class="col start">
		<span class="fg-dark">nickname</span>
		<input
			{...updateProfile.fields.nickname.as('text')}
			placeholder="Give yourself a coool nickname!"
			value={user.nickname}
		/>
	</label>
	{@render issues(updateProfile.fields.nickname.issues())}
	<label class="col start">
		<span class="fg-dark">bio</span>
		<textarea
			{...updateProfile.fields.bio.as('text')}
			maxlength="255"
			placeholder="Share something about yourself!"
			value={user.profile?.bio || ''}></textarea>
	</label>
	{@render issues(updateProfile.fields.bio.issues())}
	<label class="col start">
		<span class="fg-dark">url</span>
		<input
			{...updateProfile.fields.url.as('text')}
			placeholder="Shout-out your website!"
			value={user.profile?.url || ''}
		/>
	</label>
	{@render issues(updateProfile.fields.url.issues())}
	<button type="submit" class="btn interactive-btn bg-green semibold upcase">
		Save
	</button>
</form>

{#snippet issues(list: { message: string }[] | undefined)}
	{#each list || [] as issue (issue.message)}
		<p class="issue fg-red">{issue.message}</p>
	{/each}
{/snippet}

<style>
	form {
		padding: 1rem;
		gap: 0.75rem;
		width: 100%;
	}

	label {
		gap: 0;
		width: 100%;
	}

	input,
	textarea {
		width: 100%;
	}

	textarea {
		height: 4lh;
	}

	span,
	small {
		padding-left: 1rem;
	}

	span {
		text-transform: uppercase;
	}

	small {
		font-size: 0.75rem;
	}

	.issue {
		padding-left: 1rem;
		font-size: 0.8rem;
	}

	button {
		align-self: flex-end;
		font-size: 0.9rem;
	}
</style>
