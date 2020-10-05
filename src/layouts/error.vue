<template>
	<div class="error-page">
		<div class="error">
			<h1>HTTP Error {{ error.statusCode }}</h1>
			<p class="desc" v-if="error.statusCode === 404">The page you were looking for was not found.</p>
			<p class="desc" v-else-if="error.statusCode === 400">Your request was invalid.</p>
			<p class="desc" v-else-if="error.statusCode === 403">You are not allowed to access this resource.</p>
			<p class="desc" v-else-if="error.statusCode === 500">Whoops, internal server error.</p>
		</div>
		<p class="extended-desc">Please let me know if you see this and you don't think you should've seen it, unless you're Hexcede and you're trying to break my applications again.. (I know you're reading this lol)</p>
	</div>
</template>

<script lang="ts">
export default {
	props: ['error'],
};
</script>

<style scoped>
.error {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	height: 200px;
	background-color: #131313;

	cursor: default;
}

.desc {
	opacity: 0.8;
}

.extended-desc {
	text-align: center;
	margin: 40px auto;
	max-width: 700px;
}
</style>