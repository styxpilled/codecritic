<script lang="ts">
	import { version } from '$app/env';
</script>

<footer>
	<section class="fg-dark">
		<p>
			Made with
			<span class="hide-spaces">
				<a href="https://svelte.dev/" class="svelte hov-line">Svelte</a>
				<span>/</span>
				<a href="https://kit.svelte.dev/" class="svelte hov-line">Kit</a>
			</span>
		</p>
		<p>
			A <a href="https://styx.gay/" class="fg-blue hov-line">@styx</a>
			endeavour
		</p>
		<p>
			<a
				class="nojs hov-line"
				href="https://www.kryogenix.org/code/browser/everyonehasjs.html"
			>
				NoJS
			</a>
			compatible
		</p>
		<p>
			<a class="hov-line" href="https://github.com/styxpilled/codecritic">
				build hash {version}
			</a>
		</p>
		<p><a class=" hov-line" href="/privacy-notice">Privacy policy</a></p>
	</section>
</footer>

<style>
	footer {
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
				flex-wrap: wrap;
				justify-content: space-around;
				padding: 0 10px;
				gap: 0.5rem;
			}
			& > * {
				white-space: pre;
				text-align: center;
				min-width: 40vw;
			}
			& > *:nth-child(3) {
				min-width: 60vw;
				flex: 1;
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
