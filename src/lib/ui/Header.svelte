<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from './Avatar.svelte';
	import { user } from '$lib/client/stores';
	import { browser, dev } from '$app/environment';
	import LiveSearchbar from './LiveSearchbar.svelte';

	let showLiveSearch = false;
</script>

<header>
	<section>
		<h3 class="site-logo">
			<a href="/">
				<span class="logo"
					><span class="logo-1">★</span><span class="logo-2">☆</span><span class="logo-3">_</span
					></span
				>
				<span>codecritic</span>
				{#if dev}
					<span class="fg-red">dev</span>
				{/if}
			</a>
		</h3>
		<nav>
			<ul>
				{#if $user}
					<li class="user-dropdown">
						<a class="user-link hov-link" href="/user/{$user.username}">
							<Avatar size="xs" username={$user.username} />
							<p>{$user.username}</p>
						</a>
						<div class="user-dropdown-content">
							<a href="/settings">Settings</a>
							<form method="post" action="/logout" use:enhance>
								<button>Sign out</button>
							</form>
						</div>
					</li>
				{:else}
					<li><a href="/login/github">Sign in with GitHub</a></li>
				{/if}
				<li class="hov-link"><a href="/packages">packages</a></li>
				<li class="hov-link"><a href="/users">members</a></li>
				<li class="hov-link"><a href="/stacks">stacks</a></li>
				<li class="search-container">
					<label class="search-button hov-link">
						<LucideSearch />
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

		@media (width <= 950px) {
			& {
				width: 100vw;
			}
		}
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

		& > li:not(.search-container) {
			text-transform: uppercase;
			height: 3rem;
			font-weight: 600;
			display: flex;
			align-items: center;
			font-size: 0.75rem;
			letter-spacing: 0.15em;

			@media (width <= 950px) {
				& {
					font-size: 0.5rem;
				}
			}
		}
	}

	.user-dropdown {
		position: relative;
	}

	.user-dropdown:hover > .user-dropdown-content {
		display: flex;
		flex-direction: column;
		align-items: center;
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

		@media (width <= 950px) {
			& {
				font-size: 0.5rem;
			}
		}
	}

	/* Doesn't work in Chrome for some reason! We love browsers! */
	.logo:hover {
		animation: animate-logo 5s linear infinite forwards;
		--color-logo-1: var(--color-red);
		--color-logo-2: var(--color-orange);
		--color-logo-3: var(--color-yellow);

		& .logo-1 {
			color: var(--color-logo-1);
		}

		& .logo-2 {
			color: var(--color-logo-2);
		}

		& .logo-3 {
			color: var(--color-logo-3);
		}
	}

	@keyframes animate-logo {
		0% {
			--color-logo-1: var(--color-red);
			--color-logo-2: var(--color-orange);
			--color-logo-3: var(--color-yellow);
		}
		14% {
			--color-logo-1: var(--color-purple);
			--color-logo-2: var(--color-red);
			--color-logo-3: var(--color-orange);
		}
		28% {
			--color-logo-1: var(--color-blue);
			--color-logo-2: var(--color-purple);
			--color-logo-3: var(--color-red);
		}
		42% {
			--color-logo-1: var(--color-cyan);
			--color-logo-2: var(--color-blue);
			--color-logo-3: var(--color-purple);
		}
		56% {
			--color-logo-1: var(--color-green);
			--color-logo-2: var(--color-cyan);
			--color-logo-3: var(--color-blue);
		}
		70% {
			--color-logo-1: var(--color-yellow);
			--color-logo-2: var(--color-green);
			--color-logo-3: var(--color-cyan);
		}
		85% {
			--color-logo-1: var(--color-orange);
			--color-logo-2: var(--color-yellow);
			--color-logo-3: var(--color-green);
		}
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
		.log-button {
			animation: shift 10s linear infinite forwards;
			animation-play-state: paused;
		}

		.log-button:hover {
			animation-play-state: running;
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
		display: flex;
		align-items: center;
		gap: 0.25rem;
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
