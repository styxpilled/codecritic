<script lang="ts">
	import Avatar from '$ui/Avatar.svelte';
	import Card from '$ui/Card.svelte';
	import List from '$ui/List.svelte';
	import Review from '$ui/Review.svelte';

	export let data;
</script>

<div class="packages-page col">
	<div>
		<ul class="packages">
			<List>
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
		<List direction="col" width="fit">
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
			<List direction="col" width="full">
				<svelte:fragment slot="head">
					<span>Popular reviewers:</span>
				</svelte:fragment>
				<svelte:fragment slot="body">
					{#each data.reviewers as reviewer}
						<div class="row">
							<Avatar username={reviewer.username} />
							<div class="col start" style="gap: 0;">
								<h3 class="fg-red">
									{#if reviewer.nickname}
										{reviewer.nickname} ({reviewer.username})
									{:else}
										{reviewer.username}
									{/if}
								</h3>
								<p class="fg-dark">
									{reviewer.reviews} reviews
								</p>
							</div>
						</div>
					{/each}
				</svelte:fragment>
			</List>
			<List direction="col" width="full">
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

		<!-- <ul>
			{#each data.reviews as review}
				<Review showPackageName={true} {review} />
			{/each}
		</ul> -->
	</div>
</div>

<style>
	.packages-page {
		gap: 2rem;
	}

	ul.packages {
		display: flex;
		gap: 0.5rem;
	}

	.row.start.space {
		width: 100%;
	}
</style>
