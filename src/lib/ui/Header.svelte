<script lang="ts">
	import { dev } from '$app/environment';
	import Icon from './Icon.svelte';
</script>

<header>
	<section class="row space">
		<h3 class="site-logo">
			<a href="/">
				<span class="logo">
					<span>★</span><span>★</span><span>_</span>
				</span>
				<span class="desktop" class:fg-red={dev}>codecritic</span>
			</a>
		</h3>
		<nav class="row" style:--gap="1rem">
			<a href="/login/github">
				<Icon class="mobile" id="user-lock" />
				<span>Sign in with GitHub</span>
			</a>
			<label class="nav-button hov-link mobile">
				<Icon id="list" />
				<input type="checkbox" name="nav-links-checkbox" />
			</label>
			<div class="nav-links row bg-light">
				<a class="hov-link" href="/packages"> packages </a>
				<a class="hov-link" href="/users">members</a>
				<a class="hov-link" href="/stacks">stacks</a>
			</div>
			<div class="search-container row" style:--gap="0">
				<label class="search-button hov-link">
					<Icon size="1.25em" id="search" />
					<input type="checkbox" name="search-checkbox" />
				</label>
				<form class="search-box" action="/search?/search">
					<input type="search" name="text" />
				</form>
			</div>
			<div class="log-btn-box">
				<button class="log-button bg-green row" style:--gap="0.25rem">
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

		@media (width <= 950px) {
			& span {
				display: none;
			}

			& :global(.mobile) {
				display: inline-flex;
			}

			& > .nav-links {
				position: absolute;
				position-anchor: --nav-anchor;
				position-area: bottom center;
				position-visibility: always;
				width: 100%;
				flex-direction: column;
				align-items: flex-end;
				max-height: 0;
				overflow: hidden;
				padding: 0 0.5rem;
				transition:
					max-height 150ms ease-in-out,
					padding 150ms ease-in-out;
			}
			&:has(> .nav-button > input:checked) > .nav-links {
				max-height: 8rem;
				padding: 0.5rem;
			}
		}
	}

	.site-logo {
		gap: 0.5rem;
		font-weight: 700;
		user-select: none;
	}

	.site-logo > a:focus-visible,
	.logo:hover {
		outline: none;
		& > span {
			animation: animate-logo 6s infinite steps(1, jump-end) calc(var(--idx) * 1s);
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
		width: 0;
		padding: 0;
	}

	.log-btn-box {
		position: relative;
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
