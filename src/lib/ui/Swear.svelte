<script lang="ts">
	export let length = 8;

	const characters = '▀░&%▒▅#@0▒'.split('');
	const generateKeyframes = () => {
		let output = '<style>';
		for (let index = 0; index < length; index++) {
			output += `@keyframes censor-${index} {
      ${Array.from({ length: 5 }, (x, i) => {
				return `${i * 20}% {
          content: '${characters[Math.floor(Math.random() * characters.length)]}';
        }`;
			}).join('')}
      }`;
			output += `
      .letter-${index}::before {
		    content: '${characters[Math.floor(Math.random() * characters.length)]}';
	    }`;
		}
		output += '</style>';
		return output;
	};
</script>

<svelte:head>
	{@html generateKeyframes()}
</svelte:head>

<span class="swear">
	{#each { length } as _, i}
		<span class="letter letter-{i}" style:--index="censor-{i}"></span>
	{/each}
</span>

<style>
	.swear {
		font-family: monospace;
	}

	.swear:hover .letter::before {
		animation: var(--index) 300ms;
	}
</style>
