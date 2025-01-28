<script lang="ts">
	import Avatar from '$ui/Avatar.svelte';
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';
	import SimplePage from '$ui/SimplePage.svelte';
	import User from '$ui/User.svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<SimplePage>
	<h2 class="fg-dark">
		React state management, Typescript types and slow npm installs - it's all here.
	</h2>
	<div>
		<ul class="packages">
			<List width="auto">
				{#snippet head()}
					<span>Popular packages this week</span>
					<a class="hov-link" href="/">TODO MORE</a>
				{/snippet}
				{#snippet body()}
					{#each data.packages as pkg}
						<Card {pkg} />
					{/each}
				{/snippet}
			</List>
			<li></li>
		</ul>
	</div>
	<div class="row start space">
		<List direction="col" width="full" wrap={false}>
			{#snippet head()}
				<span>Popular reviews this week:</span>
			{/snippet}
			{#snippet body()}
				{#each data.reviews as review}
					<Review style="flex: 1; width: 100%; max-width: 35rem;" showPackageName={true} {review} />
				{/each}
			{/snippet}
		</List>
		<div class="col">
			<List direction="col" width="fit" align="start" wrap={false}>
				{#snippet head()}
					<span>Popular reviewers:</span>
				{/snippet}
				{#snippet body()}
					{#each data.reviewers as reviewer}
						<User user={reviewer} />
					{/each}
				{/snippet}
			</List>
			<List direction="col" width="full" wrap={false}>
				{#snippet head()}
					<span>Found an error?</span>
				{/snippet}
				{#snippet body()}
					<p class="fg-dark">
						Help keep codecritic running smoothly!
						<br />
						Report it on
						<a class="link hov-line" href="https://github.com/styxpilled/codecritic">
							our GitHub</a
						>!
					</p>
				{/snippet}
			</List>
		</div>
	</div>
</SimplePage>

<style>
	ul.packages {
		display: flex;
		gap: 0.5rem;
	}

	.row.start.space {
		width: 100%;

		@media (width <= 950px) {
			& {
				width: 90%;
				flex-direction: column;
			}
		}
	}
</style>
