<script lang="ts">
	import { page } from '$app/state';

	// The [user] layout resolves the profile, so a missing user throws from
	// there. The root boundary is the one that catches it.
	const missingUser = $derived(
		page.status === 404 &&
			page.url.pathname.startsWith('/user/') &&
			page.params.user
	);

	// Svelte only picks up a title that is one line, so build the text here.
	const title = $derived(
		missingUser ? `${page.params.user} not found` : `${page.status}`
	);
</script>

<svelte:head>
	<title>{title} · Codecritic</title>
</svelte:head>

<div class="col center">
	{#if missingUser}
		<h1 class="fg-red">No such user</h1>
		<p class="fg-dark">
			Nobody on Codecritic goes by <span class="mono fg-yellow">
				{page.params.user}
			</span>
			. The name may have changed, or the link may be wrong.
		</p>
		<div class="row">
			<a href="/users" class="btn bg-blue semibold">Find members</a>
			<a href="/" class="hov-link fg-dark">Back home</a>
		</div>
	{:else if page.status === 404}
		<h1 class="fg-red">Not found</h1>
		<p class="fg-dark">
			<span class="mono fg-yellow">{page.url.pathname}</span>
			does not exist.
		</p>
		<a href="/" class="hov-link fg-dark">Back home</a>
	{:else}
		<h1 class="fg-red">{page.status}</h1>
		<p class="fg-dark">{page.error?.message ?? 'Something went wrong.'}</p>
		<a href="/" class="hov-link fg-dark">Back home</a>
	{/if}
</div>

<style>
	div.col {
		gap: 1rem;
		margin: 4rem auto;
		max-width: 30rem;
		text-align: center;
	}

	p {
		font-size: 1.125rem;
		word-break: break-word;
	}
</style>
