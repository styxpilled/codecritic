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
	}

	textarea {
		width: 100%;
		height: 3lh;
	}

	div {
		width: 100%;
	}

	button {
		font-size: 0.9rem;
	}
</style>
