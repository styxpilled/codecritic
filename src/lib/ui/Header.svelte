<script lang="ts">
	import { session, supabase } from '$lib/client/stores';
	import Avatar from './Avatar.svelte';

	let search: string | null = null;
</script>

<header>
	<section>
		<h3 class="site-logo">
			<a href="/">
				<span class="logo">★☆_</span>
				<span>codecritic</span>
			</a>
		</h3>
		<nav>
			<ul>
				<li>
					{#if session !== null}
						<a href="/profile/{$session?.user.id}">
							<Avatar />
							<p>{$session?.user.id}</p>
						</a>
					{:else}
						<button
							on:click={async () => {
								const { data, error } = await $supabase.auth.signInWithOAuth({
									provider: 'github'
								});
							}}
						>
							signin
						</button>
					{/if}
				</li>
				<li>packages</li>
				<li>cli</li>
				<li>members</li>
				<li>
					<button on:click={() => (search = search === null ? '' : null)}>search</button>
				</li>
				<li>
					{#if search === null}
						log
					{:else}
						<form action="/packages/{search}">
							<input type="text" bind:value={search} />
						</form>
					{/if}
				</li>
			</ul>
		</nav>
	</section>
</header>

<style>
	header {
		background-color: var(--color-bg-bright);
		width: 100%;
	}

	section {
		margin: 0 auto;
		width: 950px;
		height: 3rem;
	}

	section,
	ul {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	ul {
		justify-content: space-around;
		gap: 1rem;

		& > li,
		& > li > * {
			text-transform: uppercase;
			font-weight: 500;
			display: flex;
			align-items: center;
			gap: 0.25rem;
		}
	}

	.site-logo {
		gap: 0.5rem;
		font-weight: 700;
	}
</style>
