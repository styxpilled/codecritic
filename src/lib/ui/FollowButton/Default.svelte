<script lang="ts">
	import { follow, getProfile, unfollow } from '#api/user.remote.ts';
	import { app } from '#lib/client/state.svelte.ts';
	import type { FollowUser } from '#lib/types.ts';

	let { user = $bindable() }: { user: FollowUser } = $props();
	const form = $derived(
		user.userFollows ? unfollow.for(user.id) : follow.for(user.id)
	);
	let _user = $derived(user);
</script>

{#if !app.user}
	<a href="/login/github" class="follow-btn semibold upcase">
		<span class="follow btn bg-blue">Follow</span>
	</a>
{:else if app.user.id !== user.id}
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
			<span class="not-following btn bg-light fg-dark">
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
{/if}

<style>
	:global(*):hover > form > .follow-btn,
	:global(.header-fields) > form > .follow-btn {
		.not-following {
			opacity: 1;
		}
	}

	a.follow-btn {
		display: block;
		text-align: center;
		.follow {
			top: 0;
		}
	}

	.follow-btn {
		height: 1.5rem;
		width: 10rem;
		overflow: hidden;
		position: relative;

		span {
			left: 0;
			position: absolute;
			transition:
				top 250ms ease-in-out,
				opacity 100ms ease-in-out;
			width: 100%;
			display: block;
		}

		.follow {
			top: -1.5rem;
		}
		.following {
			top: 1.5rem;
		}
		.unfollow {
			top: 3rem;
		}
		.not-following {
			opacity: 0;
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
