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
							<Avatar size="sm" username={$user.username} />
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
							on:submit|preventDefault={() => {
								showLiveSearch = true;
							}}
						>
							<button class="log-button bg-green" type="submit">Log</button>
						</form>
					{:else}
						<form class="log-button bg-green" action="/log">
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
		background-color: var(--color-bg-bright);
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
		padding: 0 0.5rem;
		border-radius: 0.25rem;
	}

	/* Thank you firefox */
	/* "baseline" yeah right except that one thing */
	@supports (color: hsl(from white h s l)) {
		.log-button:hover {
			animation: shift 10s linear infinite forwards;
		}

		@keyframes shift {
			0% {
				background-color: lab(from var(--color-green) l a b);
			}

			8% {
				background-color: lab(from var(--color-orange) l a b);
			}

			24% {
				background-color: lab(from var(--color-yellow) l a b);
			}

			40% {
				background-color: lab(from var(--color-red) l a b);
			}

			56% {
				background-color: lab(from var(--color-purple) l a b);
			}

			72% {
				background-color: lab(from var(--color-blue) l a b);
			}

			88% {
				background-color: lab(from var(--color-cyan) l a b);
			}

			100% {
				background-color: lab(from var(--color-green) l a b);
			}
		}
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
