<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from './Avatar.svelte';
	import Icon from '@iconify/svelte';
	import { user } from '$lib/client/stores';
	import { browser, dev } from '$app/environment';
	import LiveSearchbar from './LiveSearchbar.svelte';

	let showLiveSearch = false;
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
				{#if $user}
					<li class="user-dropdown">
						<a class="user-link" href="/user/{$user.username}">
							<Avatar username={$user.username} />
							<p>{$user.username}</p>
						</a>
						<div class="user-dropdown-content">
							<form method="post" action="/logout" use:enhance>
								<button>Sign out</button>
							</form>
						</div>
					</li>
				{:else}
					<li><a href="/login/github">Sign in with GitHub</a></li>
				{/if}
				<li><a href="/packages">packages</a></li>
				<li>members</li>
				<li class="search-container">
					<label class="search-button">
						<Icon icon="octicon:search-16" />
						<input type="checkbox" name="search-checkbox" />
					</label>
					<form class="search-box" action="/search?/search">
						<input type="search" name="text" />
					</form>
					{#if browser}
						<LiveSearchbar bind:show={showLiveSearch} />
						<form
							class="log-button"
							on:submit|preventDefault={() => {
								showLiveSearch = true;
							}}
						>
							<button type="submit">Log</button>
						</form>
					{:else}
						<form class="log-button" action="/log">
							<button type="submit">Log</button>
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
		user-select: none;
	}

	.search-button {
		cursor: pointer;
		& > input {
			display: none;
		}
	}

	.log-button {
		display: block;
		overflow: hidden;
		text-align: center;
		background-color: orange;
		border-radius: 0.25rem;
	}

	.search-box {
		position: relative;
	}

	.search-box > input {
		position: absolute;
		height: 1.75rem;
		top: -14px;
	}

	.search-container {
		width: 5rem;
	}

	/* Show Log button */
	.search-container:not(:has(> label > input:checked)) {
		width: 5rem;
		transition: width 300ms;
	}

	.search-container:not(:has(> label > input:checked)) > .search-box > input {
		width: 5rem;
		top: -999px;
		transition: width 300ms;
	}

	.search-container:not(:has(> label > input:checked)) > .log-button {
		width: 5rem;
		transition: width 1ms 300ms;
	}

	/* Show search bar */
	.search-container:has(> label > input:checked) {
		width: 10rem;
		transition: width 300ms;
	}

	.search-container:has(> label > input:checked) > .search-box > input {
		transition: width 300ms;
		width: 10rem;
	}
</style>
