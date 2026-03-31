<script lang="ts">
	import { dev } from '$app/environment';
</script>

<header>
	<section>
		<h3 class="site-logo">
			<a href="/">
				<span class="logo"
					><span class="logo-1">★</span><span class="logo-2">★</span><span class="logo-3">_</span
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
				<li><a href="/login/github">Sign in with GitHub</a></li>
			</ul>
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
</style>
