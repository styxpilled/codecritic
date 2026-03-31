<script lang="ts">
	import { version } from '$app/environment';
</script>

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
		<p>
			build hash <a class="version hov-line" href="https://github.com/styxpilled/codecritic"
				>{version}</a
			>
		</p>
		<p><a class="version hov-line" href="/privacy-notice">Privacy policy</a></p>
	</section>
</footer>

<style>
	footer {
		/* position: absolute; */
		/* bottom: 0; */
		background-color: var(--color-bg-brighter);
		width: 100dvw;
		max-width: 100%;
	}

	section {
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		width: 950px;

		@media (width <= 950px) {
			& {
				width: 100dvw;
			}
		}
	}

	.svelte {
		color: #ff3e00;
	}

	.nojs {
		color: #ebd64d;
	}

	.version {
		color: var(--color-text-dark);
	}
</style>
