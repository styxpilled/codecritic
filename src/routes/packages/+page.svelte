<script lang="ts">
	import { getPopularPackages } from '$api/packages.remote';
	import { getGlobalPopularReviews } from '$api/reviews.remote';
	import { getPopularUsers } from '$api/user.remote';
	import Avatar from '$ui/Avatar.svelte';
	import List from '$ui/List.svelte';
	import Package from '$ui/Package';
	import Reviews from '$ui/Reviews.svelte';

	let popularPackagesPromise = $derived(getPopularPackages({}));
	let popularReviewsPromise = $derived(getGlobalPopularReviews({ limit: 6 }));
	const recentPopularUsersPromise = $derived(getPopularUsers({ recent: true }));
	let popularPackages = $derived(await popularPackagesPromise);
	let popularReviews = $derived(await popularReviewsPromise);
	const recentPopularUsers = $derived(await recentPopularUsersPromise);
</script>

<p class="fg-dark">Here's what everyone is making side projects in:</p>

<List>
	{#snippet head()}
		<span>popular packages</span>
	{/snippet}
	{#each popularPackages as pkg (pkg.name)}
		<Package {pkg} />
	{/each}
</List>

<div class="popular-reviews">
	<List columns={2} style="">
		{#snippet head()}
			<span>popular reviews</span>
		{/snippet}
		{#each popularReviews as review (review.id)}
			<Reviews {review} showUser user={review.author} />
		{/each}
	</List>
	<List columns={1}>
		{#snippet head()}
			<span>popular reviewers</span>
		{/snippet}
		{#each recentPopularUsers as user (user.id)}
			<div class="row center">
				<a href="/user/{user.username}">
					<Avatar {user} />
				</a>
				<div class="col fg-dark start nogap">
					<a href="/user/{user.username}" class="fg-red hov-line">
						{user.nickname || user.username}
					</a>
					<div class="row">
						<span>{user.likes} likes</span>
						<span>{user.reviews} reviews</span>
					</div>
				</div>
			</div>
		{/each}
	</List>
</div>

<style>
	p {
		margin: 2rem calc(min(4rem, 10vw));
		font-size: 1.5rem;
		text-align: center;
	}

	.popular-reviews {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: 4rem;
		@media (width <= 950px) {
			display: block;
		}
	}
</style>
