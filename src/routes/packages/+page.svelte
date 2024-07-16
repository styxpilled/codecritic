<script lang="ts">
	import Avatar from '$ui/Avatar.svelte';
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';
	import SimplePage from '$ui/SimplePage.svelte';
	import User from '$ui/User.svelte';

	export let data;
</script>

<SimplePage>
	<h2 class="fg-dark">
		React state management, Typescript types and slow npm installs - it's all here.
	</h2>
	<div>
		<ul class="packages">
			<List width="auto">
				<svelte:fragment slot="head">
					<span>Popular packages this week</span>
					<a href="/">TODO MORE</a>
				</svelte:fragment>
				<svelte:fragment slot="body">
					{#each data.packages as pkg}
						<Card {pkg} />
					{/each}
				</svelte:fragment>
			</List>
			<li></li>
		</ul>
	</div>
	<div class="row start space">
		<List direction="col" width="fit" wrap={false}>
			<svelte:fragment slot="head">
				<span>Popular reviews this week:</span>
			</svelte:fragment>
			<svelte:fragment slot="body">
				{#each data.reviews as review}
					<Review style="flex: 1; width: 100%; max-width: 35rem;" showPackageName={true} {review} />
				{/each}
			</svelte:fragment>
		</List>
		<div class="col">
			<List direction="col" width="fit" align="start" wrap={false}>
				<svelte:fragment slot="head">
					<span>Popular reviewers:</span>
				</svelte:fragment>
				<svelte:fragment slot="body">
					{#each data.reviewers as reviewer}
						<User user={reviewer} />
					{/each}
				</svelte:fragment>
			</List>
			<List direction="col" width="full" wrap={false}>
				<svelte:fragment slot="head">
					<span>Found an error?</span>
				</svelte:fragment>
				<svelte:fragment slot="body">
					<p class="fg-dark">
						Help keep codecritic running smoothly!
						<br />
						Report it on
						<a class="link hov-line" href="https://github.com/styxpilled/codecritic">
							our GitHub</a
						>!
					</p>
				</svelte:fragment>
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
