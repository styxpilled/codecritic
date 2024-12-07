<footer>
	<section>
		<p>
			Made with <a href="https://svelte.dev/" class="svelte hov-line">Svelte</a>/<a
				href="https://kit.svelte.dev/"
				class="svelte hov-line">Kit</a
			>
		</p>
		<p>A <a href="https://styx.gay/" class="fg-blue hov-line">@styx</a> endeavour</p>
		<p>
			<a class="nojs hov-line" href="https://www.kryogenix.org/code/browser/everyonehasjs.html"
				>NoJS</a
			> compatible (hopefully)
		</p>
	</section>
</footer>

<style>
	footer {
		background-color: var(--color-bg-bright);
		width: 100%;
	}

	section {
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		width: 950px;

		@media (width <= 950px) {
			& {
				width: 100vw;
			}
		}
	}

	.svelte {
		color: #ff3e00;
	}

	.nojs {
		color: #ebd64d;
	}
</style>
