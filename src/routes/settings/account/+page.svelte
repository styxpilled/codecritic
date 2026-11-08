<script lang="ts">
	import {
		deleteAccount,
		getSessions,
		signOutEverywhere,
	} from '#api/auth.remote.ts';
	import { confirmUsernameSchema } from '#api/schemas.ts';
	import { app } from '#lib/client/state.svelte.ts';

	const sessions = await getSessions();
	const format = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
</script>

<section class="col start bg-light round">
	<h2>Sessions</h2>
	<p class="fg-dark">
		You are signed in on {sessions.length}
		{sessions.length === 1 ? 'device' : 'devices'}.
	</p>
	<ul class="col start">
		{#each sessions as session, i (i)}
			<li class="row">
				<span>Signed in on {format.format(session.createdAt)}</span>
				{#if session.current}<span class="fg-green upcase">
						this device
					</span>{/if}
			</li>
		{/each}
	</ul>
	<form {...signOutEverywhere} class="col center">
		<button class="btn interactive-btn bg-orange semibold upcase">
			Sign out everywhere
		</button>
	</form>
</section>

<section class="col start bg-light round">
	<h2 class="fg-red">Delete account</h2>
	<p>
		Removes your profile, your reviews, your stacks and your likes. This cannot
		be undone.
	</p>
	<form {...deleteAccount.preflight(confirmUsernameSchema)} class="col start">
		<label class="col start">
			<span class="fg-dark">
				Type <b>{app.user?.username}</b>
				to confirm
			</span>
			<input
				{...deleteAccount.fields.confirm.as('text')}
				autocomplete="off"
				placeholder={app.user?.username}
			/>
		</label>
		{#each deleteAccount.fields.confirm.issues() || [] as issue (issue.message)}
			<p class="issue fg-red">{issue.message}</p>
		{/each}
		<button class="btn interactive-btn bg-red semibold upcase self-end">
			Delete my account
		</button>
	</form>
</section>

<style>
	section {
		padding: 1rem;
		gap: 0.75rem;
		width: 100%;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 1.1rem;
	}

	ul {
		gap: 0.25rem;
		font-size: 0.9rem;
	}

	li > .upcase {
		font-size: 0.7rem;
		letter-spacing: 0.1em;
	}

	label {
		gap: 0;
		width: 100%;
	}

	span {
		padding-left: 1rem;
		font-size: 0.8rem;
	}

	input {
		width: 100%;
	}

	.issue {
		padding-left: 1rem;
		font-size: 0.8rem;
	}

	button {
		font-size: 0.9rem;
	}

	form {
		width: 100%;
		gap: 0.5rem;
	}
</style>
