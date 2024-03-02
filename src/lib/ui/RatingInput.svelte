<div class="rating">
	{#each { length: 10 } as _, i}
		<label class="star">
			<input type="radio" name="rating" value={i + 1} on:click={() => console.log(i + 1)} />
			<svg viewBox="0 0 32 64" width="16" height="32" xmlns="http://www.w3.org/2000/svg">
				<g id="Layer_1">
					<title>Layer 1</title>
					<path
						id="svg_1"
						d="m0,24.56067l25.65797,0l7.92851,-24.37496l7.92851,24.37496l25.65796,0l-20.75769,15.06438l7.92892,24.37496l-20.7577,-15.06479l-20.7577,15.06479l7.92892,-24.37496l-20.7577,-15.06438z"
					/>
				</g>
			</svg>
		</label>
	{/each}
</div>

<style>
	.rating {
		cursor: pointer;
		display: flex;
		width: min-content;
	}

	.star {
		fill: white;
		cursor: pointer;
		& input {
			display: none;
		}
	}

	.star:nth-child(2n) {
		transform: scale(-1, 1);
	}

	.star:has(~ .star:hover),
	.star:hover {
		fill: #40bcf4;
	}

	:not(.rating:hover) .star:has(~ .star > input:checked),
	:not(.rating:hover) .star > input:checked + svg {
		fill: #00e054;
	}
</style>
