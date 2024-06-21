<div class="banner">
	<div>
		<p>Tired of long bundle times?</p>
		<svg style="height: 0; width: 0;">
			<defs>
				<linearGradient id="banner1-gradient">
					<stop offset="40%" stop-color="#fbc250" />
					<stop offset="60%" stop-color="#fea700" />
				</linearGradient>
			</defs>
		</svg>
	</div>
	<div class="icon">
		<LucideBox />
	</div>
	<p>Try Vercel's new Blazingly Fast bundler!</p>
</div>

<style>
	.banner {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		text-align: center;
		padding: 1rem;
		height: 16rem;
		width: 16rem;
		aspect-ratio: 1/1;
		font-family: 'Inter Variable';
		font-weight: 500;
		border-radius: 0.5rem;
		cursor: pointer;
		user-select: none;
		text-transform: uppercase;
		background-color: var(--color-bg-bright);
	}

	p {
		--bg-size: 400%;
		--color-one: hsl(15 90% 55%);
		--color-two: hsl(40 95% 55%);
		background: linear-gradient(90deg, var(--color-one), var(--color-two), var(--color-one)) 0 0 /
			var(--bg-size) 100%;
		color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
		animation: move-bg 8s infinite linear;
		animation-play-state: paused;
	}

	.banner:hover p {
		animation-play-state: running;
	}

	@keyframes move-bg {
		to {
			background-position: var(--bg-size) 0;
		}
	}

	.icon {
		font-size: 4rem;
	}

	.icon > :global(svg path) {
		stroke: url(#banner1-gradient);
	}
</style>
