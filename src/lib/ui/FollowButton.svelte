<script lang="ts">
	import { follow, unfollow } from '$api/user.remote';
	import type { User } from '$lib/server/db/schema';

	let {
		user = $bindable(),
	}: {
		user: User & {
			userFollows: boolean;
			followsUser: boolean;
		};
	} = $props();
	const form = user.userFollows ? unfollow.for(user.id) : follow.for(user.id);
</script>

<form
	{...form.enhance(async ({ submit }) => {
		user.userFollows = !user.userFollows;
		await submit();
	})}
>
	<input
		{...form.fields.username.as('text')}
		value={user.username}
		class="hidden"
	/>
	<button
		class="follow-btn semibold upcase"
		class:following={user.userFollows}
		class:not-following={!user.userFollows}
	>
		<span class="follow btn bg-blue">
			{#if user.followsUser}
				Follows you
			{:else}
				Follow
			{/if}
		</span>
		<span class="following btn bg-green">
			{#if user.followsUser}
				Mutuals
			{:else}
				Following
			{/if}
		</span>
		<span class="unfollow btn bg-red">Unfollow</span>
	</button>
</form>

<style>
	.follow-btn {
		height: 1.5rem;
		width: 8rem;
		overflow: hidden;
		position: relative;

		span {
			left: 0;
			position: absolute;
			transition: top 250ms ease-in-out;
			width: 100%;
			display: block;
		}

		.follow {
			top: -1.5rem;
		}
		.following {
			top: 0;
		}
		.unfollow {
			top: 1.5rem;
		}
		&.not-following {
			.follow {
				top: 0;
			}
			.following {
				top: 1.5rem;
			}
		}
		&.following {
			&:hover {
				.following {
					top: -1.5rem;
				}

				.unfollow {
					top: 0rem;
				}
			}
		}
	}
</style>
