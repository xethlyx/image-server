<template>
    <div class="embed">
        <transition name="slidein" mode="out-in">
            <div class="embed-show" v-if="!allowed">
                <p>Your IP is not whitelisted.</p>
            </div>
            <div class="embed-show" v-else-if="newEmbedName">
                <p>Your embed was created successfully! You can now access it at:</p>
                <code>{{ newEmbedLink }}</code>

                <button class="wide" @click="back">New Embed<span class="button-arrow-container"><img src="/arrow.svg" class="button-arrow" alt="" /></span></button>
            </div>
            <form v-else>
                <input v-model="title" type="text" placeholder="Title" autocomplete="off" /><br />
                <textarea v-model="description" placeholder="Description" autocomplete="off"></textarea><br />
                <input v-model="redirect" type="url" placeholder="Redirect" autocomplete="off" /><br />
                <button class="wide" @click="submit">Make Embed<span class="button-arrow-container"><img src="/arrow.svg" class="button-arrow" alt="" /></span></button>
            </form>
        </transition>
        <div class="error" v-if="error">{{ error }}</div>
    </div>
</template>

<script lang="ts">
export default {
    data: () => ({
        allowed: false,
        title: '',
        description: '',
        redirect: '',
        error: '',
        newEmbedName: ''
    }),
    methods: {
        async submit(event: Event) {

            event.preventDefault();

            if (!(this as any).title) {
                (this as any).error = 'Title must not be blank!';
                return;
            }

            if (!(this as any).description) {
                (this as any).error = 'Title must not be blank!';
                return;
            }

            try {
                const fetched = await fetch('/api/upload/json', {
                    method: 'POST',
                    headers: {
                        ['Content-Type']: 'application/json'
                    },
                    body: JSON.stringify({
                        title: (this as any).title,
                        description: (this as any).description,
                        redirect: (this as any).redirect
                    })
                });

                (this as any).newEmbedName = await fetched.text();
                
                (this as any).title = '';
                (this as any).description = '';
                (this as any).redirect = '';
                (this as any).error = '';
            } catch (error) {
                (this as any).error = error.message;
            }
        },
        back() {
            (this as any).newEmbedName = '';
        }
    },
    computed: {
        newEmbedLink() {
            return `${document.location.origin}${(this as any).newEmbedName}`
        }
    },
    async mounted() {
        try {
            const response = await (await fetch('/api/upload/allowed', {
                method: 'POST'
            })).json();
            (this as any).allowed = response.allowed;
        } catch {
            (this as any).allowed = false;
        }
    }
}
</script>

<style scoped>
.embed {
    text-align: center;
}

.embed form, .embed-show {
    padding: 40px 15px;
    width: 90%;
    max-width: 500px;

    background-color: var(--dark-background);
    margin: 0 auto;
    margin-top: 20px;

    border-radius: 3px;

    text-align: center;
}

.embed-show code {
    display: inline-block;
    margin-top: 20px;
}

.error {
    max-width: 500px;
    padding: 20px;
    margin: 40px auto;
    background-color: var(--dark-background);
    border-radius: 3px;
}

.embed button {
    margin-top: 30px;
}
</style>