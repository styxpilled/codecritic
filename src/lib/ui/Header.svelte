<script lang="ts">
	import { signOut } from '$api/auth.remote';
	import { dev } from '$app/environment';
	import { app } from '$lib/client/state.svelte';
	import Avatar from './Avatar.svelte';
	import Icon from './Icon.svelte';
</script>

<header>
	<section class="row space">
		<h3 class="site-logo">
			<a href="/">
				<span class="logo">
					<span>★</span>
					<span>★</span>
					<span>_</span>
				</span>
				<span class="desktop" class:fg-red={dev}>codecritic</span>
			</a>
		</h3>
		<nav class="row nogap" style:gap="1rem">
			{#if app.user}
				<div class="user-button col" style:gap="0">
					<a class="row hov-link desktop" href="/user/{app.user.username}">
						<Avatar size="xs" user={app.user} />
						<span>{app.user.username}</span>
					</a>
					<button class="mobile" popovertarget="user-links">
						<Avatar size="xs" user={app.user} />
					</button>
					<div class="user-links bg-light col start" id="user-links" popover>
						<a href="/" class="hov-link">Home</a>
						<a href="/user/{app.user.username}" class="hov-link">Profile</a>
						<a href="/user/{app.user.username}/reviews" class="hov-link">
							Reviews
						</a>
						<a href="/user/{app.user.username}/stacks" class="hov-link">
							Stacks
						</a>
						<hr />
						<a href="/settings" class="hov-link">Settings</a>
						<form {...signOut} class="logout">
							<button class="btn lg bg-red">Sign out</button>
						</form>
					</div>
				</div>
			{:else}
				<a href="/login/github">
					<Icon class="mobile" id="user-lock" />
					<span>Sign in with GitHub</span>
				</a>
			{/if}
			<button
				id="nav-button"
				popovertarget="nav-links"
				class="nav-button hov-link mobile"
			>
				<Icon id="list" class="closed" />
				<Icon id="x" class="open" />
			</button>
			<div
				class="nav-links row bg-light"
				id="nav-links"
				popover
				style:gap="1rem"
			>
				<p class="row">
					<Icon size="1.25em" id="package" class="mobile" />
					<a class="hov-link" href="/packages">packages</a>
				</p>
				<p class="row">
					<Icon size="1.25em" id="user" class="mobile" />
					<a class="hov-link" href="/users">members</a>
				</p>
				<p class="row">
					<Icon size="1.25em" id="layers" class="mobile" />
					<a class="hov-link" href="/stacks">stacks</a>
				</p>
			</div>
			<div class="search-container row" style:gap="0">
				<label class="search-button hov-link">
					<Icon size="1.25em" id="search" class="closed" />
					<Icon size="1.25em" id="x" class="open" />
					<input
						type="checkbox"
						name="search-checkbox"
						oninput={() => {
							document.getElementById('search-input')?.focus();
						}}
					/>
				</label>
				<form class="search-box" action="/search">
					<input type="search" name="query" id="search-input" />
				</form>
			</div>
			<div class="log-btn-box">
				<button class="log-button bg-green row" style:gap="0.25rem">
					<span class="">Log</span>
				</button>
			</div>
		</nav>
	</section>
</header>

<style>
	header {
		background-color: var(--color-bg-brighter);
		width: 100%;
	}

	section {
		margin: 0 auto;
		width: 950px;
		height: 3rem;
		@media (width <= 950px) {
			& {
				width: 100dvw;
				padding: 0rem 1rem;
			}
		}
	}

	nav {
		justify-content: space-around;
		anchor-name: --nav-anchor;
		& > *:not(.search-container) {
			text-transform: uppercase;
			font-weight: 700;
			font-size: 0.75rem;
			letter-spacing: 0.15em;
		}

		& > #nav-links[popover] {
			position: static;
		}

		& > #nav-button {
			& > :global(.open) {
				display: none;
			}
			&:has(+ [popover]:popover-open) {
				& > :global(.open) {
					display: block;
				}
				& > :global(.closed) {
					display: none;
				}
			}
		}

		@media (width <= 950px) {
			& span {
				display: none;
			}

			& :global(.mobile) {
				display: inline-flex;
			}

			& > #nav-links[popover] {
				width: 100%;
				flex-direction: column;
				align-items: flex-start;
				max-height: 0;
				padding: 0 1rem;
				position-anchor: --nav-anchor;
				position: absolute;
				position-area: bottom center;
				position-area: y-end span-all;
				box-shadow: 0 2rem 2rem #0008;
				font-size: 1rem;
				position-visibility: always;
				overflow: hidden;
				transition:
					max-height 150ms ease-in-out,
					padding 150ms ease-in-out;
			}
			& > #nav-links:popover-open {
				display: flex;
				max-height: 10rem;
				padding: 1rem;
			}
		}
	}

	.user-button {
		anchor-name: --user-anchor;
		position: relative;
		z-index: 10;
	}

	.user-button:has(> a:focus) > .user-links,
	.user-button:has(> a:hover) > .user-links,
	.user-links[popover]:hover,
	.user-links:focus-within,
	.user-links:popover-open {
		display: flex;
		padding: 1rem;
		max-height: 100%;
		pointer-events: all;
	}

	.user-links {
		position-visibility: always;
		position-anchor: --user-anchor;
		z-index: -1;
		overflow: hidden;
		max-height: 0;
		pointer-events: none;
		width: calc(100% + 2rem);
		padding: 0 1rem;
		position-area: block-end center;
		transition:
			max-height 150ms ease-in-out,
			padding 150ms ease-in-out;
		@media (width <= 950px) {
			position-area: block-end span-inline-end;
			margin-left: -1rem;
			width: max-content;
		}

		& > * {
			white-space: pre;
		}
	}

	.site-logo {
		gap: 0.5rem;
		font-weight: 700;
		user-select: none;
	}

	.site-logo > a:focus {
		outline: none;
	}
	.site-logo > a:focus-visible > .logo,
	.logo:hover {
		outline: none;
		& > span {
			animation: animate-logo 6s infinite steps(1, jump-end)
				calc(var(--idx) * 1s);
			--idx: 0;
			&:nth-child(2) {
				--idx: 1;
			}
			&:nth-child(3) {
				--idx: 2;
			}
		}
	}

	@keyframes animate-logo {
		0% {
			color: var(--color-green);
		}

		16.5% {
			color: var(--color-orange);
		}

		33% {
			color: var(--color-yellow);
		}

		49.5% {
			color: var(--color-red);
		}

		66% {
			color: var(--color-purple);
		}

		82.5% {
			color: var(--color-blue);
		}

		100% {
			color: var(--color-cyan);
		}
	}

	.search-box > input {
		width: 4rem;
		visibility: hidden;
		padding: 0;
		transition:
			width 150ms,
			padding 150ms;
		margin-right: -4rem;
	}

	.search-button {
		cursor: pointer;
		& :global(.open) {
			display: none;
		}
	}

	.search-button:has(> input:checked) {
		& :global(.closed) {
			display: none;
		}
		& :global(.open) {
			display: block;
		}
		& + .search-box > input {
			margin-left: 0.25rem;
			padding: 0 0.5rem;
			visibility: visible;
			margin-right: 0;
			width: 10rem;
			height: auto;
		}
	}

	.search-container:has(> .search-button > input:checked) {
		margin-right: -1rem;
		& + * {
			max-width: 0;
		}
	}

	.log-btn-box {
		position: relative;
		overflow: hidden;
		transition: max-width 150ms;
		/* padding-right: 2px; */
		max-width: 4.125rem;
	}
	button.log-button {
		padding: 0 0.5rem 0 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0em;
		font-size: 0.9rem;
		margin: 2px;
		border-radius: 0.25rem;
		transition:
			margin 150ms ease-in-out,
			padding 150ms ease-in-out;
		box-shadow:
			inset 1px 1px 0.125rem #fff4,
			inset -1px -1px 0.125rem #0002;
		&::before,
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			transform: translate(-50%, -50%);
			left: 14px;
			display: block;
			height: 12px;
			width: 2px;
			background: var(--fg);
		}
		&::after {
			height: 2px;
			width: 12px;
		}
	}

	@supports (color: hsl(from white h s l)) {
		.log-button {
			animation: animate-logo 10s linear infinite alternate forwards;
			animation-play-state: paused;
			background-color: currentColor;
			span {
				display: inline-flex;
				color: var(--color-bg-brighter);
			}
		}

		.log-button:hover,
		.log-button:focus-visible {
			animation-play-state: running;
			outline: none;
			padding: 0.125rem 0.625rem 0.125rem 1.625rem;
			margin: 0;
		}
	}
</style>
