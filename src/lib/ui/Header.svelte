<script lang="ts">
	import type { Session, User } from 'lucia';
	import { enhance } from '$app/forms';
	import Avatar from './Avatar.svelte';
	import Icon from '@iconify/svelte';
	import { user } from '$lib/client/stores';
	import { dev } from '$app/environment';

	let search: string | null = null;
</script>

<header>
	<section>
		<h3 class="site-logo">
			<a href="/">
				<span class="logo">★☆_</span>
				<span>codecritic</span>
				{#if dev}
					<span style="color: red;">dev</span>
				{/if}
			</a>
		</h3>
		<nav>
			<ul>
				<li class="user-dropdown">
					{#if $user}
						<a class="user-link" href="/user/{$user.username}">
							<Avatar username={$user.username} />
							<p>{$user.username}</p>
						</a>
					{:else}
						<a href="/login/github">Sign in with GitHub</a>
					{/if}
					<div class="user-dropdown-content">
						{#if $user}
							<form method="post" action="/logout" use:enhance>
								<button>Sign out</button>
							</form>
						{/if}
					</div>
				</li>
				<li><a href="/packages">packages</a></li>
				<li>members</li>
				<li>
					<button on:click={() => (search = search === null ? '' : null)}>
						<Icon icon="octicon:search-16" />
					</button>
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

		& > li {
			text-transform: uppercase;
			height: 3rem;
			font-weight: 500;
			display: flex;
			align-items: center;
			gap: 0.25rem;
		}
	}

	.user-dropdown {
		position: relative;
	}

	.user-dropdown:hover > .user-dropdown-content {
		display: block;
	}

	.user-dropdown-content {
		display: none;
		position: absolute;
		top: 3rem;
		background-color: #383d45;
		padding: 0.5rem;
		width: 9rem;
	}

	.user-link {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.site-logo {
		gap: 0.5rem;
		font-weight: 700;
	}
</style>
