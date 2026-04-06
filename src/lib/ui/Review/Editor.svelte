<script lang="ts">
	import RatingInput from './RatingInput.svelte';

	let { pkg } = $props();
</script>

<form class="review-editor fg-dark bg-light col start">
	<div class="row space">
		<RatingInput />
		<input type="date" value={new Date().toISOString().slice(0, 10)} />
	</div>
	<textarea placeholder="Add a review..." name="review"></textarea>
	<div class="row space">
		<label class="row">
			<span>Version</span>
			<select name="version">
				<option value={pkg.latest}>{pkg.latest}</option>
			</select>
			<span>-- TODO</span>
		</label>
		<button class="btn bg-green bold" type="submit">SAVE</button>
	</div>
</form>

<style>
	.review-editor {
		padding: 0.75rem 1rem 0.5rem;
		border-radius: 0.5rem;
		width: calc(480px - 1rem);

		@media (width <= 950px) {
			width: 100%;
		}
	}

	textarea {
		width: 100%;
		max-width: 100%;
		min-height: 3lh;
		max-height: 10lh;
		field-sizing: content;
	}

	div {
		width: 100%;
	}

	button {
		font-size: 0.9rem;
		transition:
			padding 150ms ease-in-out,
			margin 150ms ease-in-out;
		&:hover,
		&:focus {
			padding: 2px calc(0.25rem + 2px);
			margin-right: -2px;
		}
	}
</style>
