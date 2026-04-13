<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { updateProfileSchema } from '$api/schemas';
	import { getProfile, updateProfile } from '$api/user.remote';
	import { app } from '$lib/client/state.svelte';
	import Avatar from '$ui/Avatar.svelte';

	if (!app.user) error(401);
	let user = $state(await getProfile(app?.user?.username || ''));
</script>

<form
	{...updateProfile.preflight(updateProfileSchema).enhance(async ({ data, submit }) => {
		try {
			await submit();
			if (data.url && user.profile) user.profile.url = data.url;
			if (data.url && user.profile) user.profile.bio = data.bio || null;
			if (data.url) user.nickname = data.nickname || null;
		} catch (error) {
			console.error(error);
		}
	})}
	class="col start bg-light"
>
	<h2 class="row">
		<a href="/user/{user.username}" class="col">
			<Avatar size="sm" {user} />
		</a>
		User settings
	</h2>
	<label class="col start">
		<span class="fg-dark">username</span>
		<input value={user.username} disabled />
	</label>
	<label class="col start">
		<span class="fg-dark">nickname</span>
		<input {...updateProfile.fields.nickname.as('text')} value={user.nickname} />
	</label>
	<label class="col start">
		<span class="fg-dark">bio</span>
		<textarea {...updateProfile.fields.bio.as('text')} value={user?.profile?.bio || ''}></textarea>
	</label>
	<label class="col start">
		<span class="fg-dark">url</span>
		<input {...updateProfile.fields.url.as('text')} value={user?.profile?.url} />
	</label>
	{#each updateProfile.fields.url.issues() as issue (issue.message)}
		<p class="issue">{issue.message}</p>
	{/each}
	<button type="submit" class="btn bg-green semibold upcase">Save</button>
</form>

<style>
	form {
		padding: 1rem;
		width: min-content;
		margin: 0 auto;
	}

	input,
	textarea {
		width: 20rem;
	}

	label {
		gap: 0;
	}

	span {
		padding-left: 1rem;
		text-transform: uppercase;
	}

	textarea {
		height: 4lh;
	}

	form button {
		align-self: flex-end;
		font-size: 0.9rem;
		transition:
			padding 150ms ease-in-out,
			margin 150ms ease-in-out;
		&:hover,
		&:focus {
			padding: 2px calc(0.25rem + 2px);
			margin: -2px;
		}
	}

	.back {
		padding: 0.25rem;
	}
</style>
