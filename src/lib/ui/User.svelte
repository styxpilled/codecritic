<script lang="ts">
	import type { User } from '$lib/types';
	import Avatar from './Avatar.svelte';

	export let user: User;
</script>

<div class="box">
	<div class="row">
		<Avatar username={user.username} size="sm" />
		<h4 class="fg-red hov-line">
			<a href="/user/{user.username}">
				{#if user.nickname}
					{user.nickname} ({user.username})
				{:else}
					{user.username}
				{/if}
			</a>
		</h4>
		<p></p>
	</div>
</div>

<style>
	div.box {
		width: 20rem;
	}
</style>
