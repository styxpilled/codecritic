<script lang="ts">
	import { follow, getProfile, unfollow } from '$api/user.remote';
	import type { User } from '$lib/server/db/schema';

	let {
		user = $bindable(),
	}: {
		user: User & {
			userFollows: boolean;
			followsUser: boolean;
			followers?: number;
		};
	} = $props();
	const form = $derived(
		user.userFollows ? unfollow.for(user.id) : follow.for(user.id)
	);
	let _user = $derived(user);
</script>

<form
	{...form.enhance(async ({ submit }) => {
		_user.userFollows = !_user.userFollows;
		if (user?.followers) {
			if (_user.userFollows) {
				user.followers += 1;
			} else {
				user.followers -= 1;
			}
		}
		await submit().updates(getProfile(user.username));
	})}
>
	<input
		{...form.fields.username.as('text')}
		value={user.username}
		class="hidden"
	/>
	<button
		class="follow-btn semibold upcase"
		class:following={_user.userFollows}
		class:not-following={!_user.userFollows}
		type="submit"
	>
		<span class="not-following btn bg-light">
			{#if _user.followsUser}
				Follows you
			{:else}
				Not following
			{/if}
		</span>
		<span class="follow btn bg-blue">Follow</span>
		<span class="following btn bg-green">
			{#if _user.followsUser}
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
		width: 10rem;
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
			/* top: 0rem; */
		}
		.following {
			top: 0;
			/* top: 0; */
			top: 1.5rem;
		}
		.unfollow {
			/* top: 1.5rem; */
			top: 3rem;
		}
		.not-following {
			top: -1.5rem;
			top: 0rem;
		}
		&.not-following {
			.follow {
				top: 1.5rem;
			}
			.following {
				top: 3rem;
			}
			&:hover {
				.follow {
					top: 0;
				}
			}
		}
		&.following {
			.not-following {
				top: -1.5rem;
			}
			.following {
				top: 0;
			}
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
