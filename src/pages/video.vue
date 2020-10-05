<template>
    <div class="embed">
        <transition name="slidein" mode="out-in">
            <div class="embed-show" v-if="!allowed">
                <p>Your IP is not whitelisted.</p>
            </div>
            <div class="embed-show" v-else-if="newVideoName">
                <p>Your video was created successfully! You can now access it at:</p>
                <code>{{ newEmbedLink }}</code>

                <button class="wide" @click="back">New Embed<span class="button-arrow-container"><img src="/arrow.svg" class="button-arrow" alt="" /></span></button>
            </div>
            <form v-else>
                <input id="file" type="file" placeholder="Title" autocomplete="off" ref="file-upload" accept=".mp4"/><br />
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
        error: '',
        newVideoName: ''
    }),
    methods: {
        async submit(event: Event) {

            event.preventDefault();

            const formData = new FormData();

            if ((this as any).$refs['file-upload'].files.length === 0) {
                (this as any).error = 'No files uploaded.';
                return;
            }
            formData.set('data', (this as any).$refs['file-upload'].files[0])

            try {
                const fetched = await fetch('/api/upload/video-noconvert', {
                    method: 'POST',
                    body: formData
                });

                (this as any).newVideoName = await fetched.text();
                
                (this as any).error = '';
            } catch (error) {
                (this as any).error = error.message;
            }
        },
        back() {
            (this as any).newVideoName = '';
        }
    },
    computed: {
        newEmbedLink() {
            return `${(this as any).newVideoName}`
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