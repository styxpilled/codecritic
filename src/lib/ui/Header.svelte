<script lang="ts">
	import Avatar from './Avatar.svelte';
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
					<a href="/user/username">
						<Avatar />
						<p>username</p>
					</a>
				</li>
				<li>packages</li>
				<li>cli</li>
				<li>members</li>
				<li>search</li>
				<li>log</li>
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
		& > li > a {
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
