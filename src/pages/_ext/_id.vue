<template>
    <div class="content">
        <p class="info"><span class="content-type">{{ $route.params.ext }}</span> {{ $route.params.id }}</p>
        <img class="user-content" :src="`/api/content/png/${$route.params.id}`" alt="user uploaded content" v-if="$route.params.ext === 'png'" />
        <video class="user-content" muted loop autoplay v-else-if="$route.params.ext === 'anim' || $route.params.ext === 'video'">
            <source :src="`/api/content/mp4/${$route.params.id}`" type="video/mp4">
            Your browser does not support this video.
        </video>
        <div v-else-if="$route.params.ext === 'embed'">
            <h2>{{ embedName }}</h2>
            <p>{{ embedDescription }}</p>
        </div>
        <div class="timestamp" v-else-if="$route.params.ext === 'timestamp'">
            <h1>{{ new Date(Date.parse($route.params.id)).toLocaleString() }}</h1>
            <p>in your local timezone</p>
        </div>
        <div v-else>
            <p>Extension format invalid</p>
        </div>
    </div>
</template>

<script lang="ts">
import { Context } from '@nuxt/types';
import { sequelize } from '../../api';
import { NuxtHTTPInstance } from '@nuxt/http';
import { MetaPropertyCharset, MetaPropertyEquiv, MetaPropertyName, MetaPropertyMicrodata, MetaPropertyProperty } from 'vue-meta/types';

export default {
    head() {
        let title = 'Uploaded User Content';
        let defaultMeta: (MetaPropertyCharset | MetaPropertyEquiv | MetaPropertyName | MetaPropertyMicrodata | MetaPropertyProperty)[] = [];

        switch ((this as any).$route.params.ext) {
            case 'embed':
                defaultMeta.push({
                    name: 'description',
                    content: (this as any).embedDescription
                });

                title = (this as any).embedName;

                defaultMeta.push({
                    name: 'og:title',
                    content: (this as any).embedName
                });

                defaultMeta.push({
                    name: 'twitter:title',
                    content: (this as any).embedName
                });

                defaultMeta.push({
                    name: 'twitter:description',
                    content: (this as any).embedDescription
                });

                break;

            case 'anim':
            case 'png':
                let imageUrl = `/api/content/${(this as any).$route.params.ext === 'png' ? 'png' : 'gif'}/${(this as any).$route.params.id}${(this as any).$route.params.ext === 'anim' ? '.gif' : ''}`;

                defaultMeta.push({
                    name: 'og:image',
                    content: imageUrl
                });

                defaultMeta.push({
                    name: 'og:title',
                    content: 'Uploaded Image'
                });

                defaultMeta.push({
                    name: 'twitter:card',
                    content: 'summary_large_image'
                });

                defaultMeta.push({
                    name: 'twitter:image',
                    content: imageUrl
                });
                
                defaultMeta.push({
                    name: 'twitter:title',
                    content: 'Uploaded Image'
                });

                break;

            case 'video':
                let videoUrl = `/api/content/mp4/${(this as any).$route.params.id}.mp4`;

                defaultMeta.push({
                    name: 'og:video',
                    content: videoUrl
                });

                defaultMeta.push({
                    name: 'og:title',
                    content: 'Uploaded Video'
                });

                defaultMeta.push({
                    name: 'twitter:card',
                    content: 'player'
                });

                defaultMeta.push({
                    name: 'twitter:player',
                    content: videoUrl
                });

                defaultMeta.push({
                    name: 'twitter:player:stream:content_type',
                    content: 'video/mp4'
                });
                
                defaultMeta.push({
                    name: 'twitter:title',
                    content: 'Uploaded Video'
                });

                break;

            case 'timestamp':
                const prompt = 'Open this link to view ' + (new Date(Date.parse((this as any).$route.params.id))).toISOString() + ' in your timezone.';

                title = 'Timestamp';

                defaultMeta.push({
                    name: 'og:title',
                    content: 'Timestamp'
                });
                
                defaultMeta.push({
                    name: 'twitter:title',
                    content: 'Timestamp'
                });

                defaultMeta.push({
                    name: 'description',
                    content: prompt
                });

                defaultMeta.push({
                    name: 'twitter:description',
                    content: prompt
                });

                break;
        }

        return {
            title: 'Uploaded User Content',
            meta: defaultMeta
        }
    },
    data: () => ({
        embedName: '',
        embedDescription: '',
        embedRedirect: ''
    }),
    async asyncData(info: Context) {
        let internalExt = info.params.ext;
        let found = false;

        switch (internalExt) {
            case 'anim':
                internalExt = 'gif';
                break;
            case 'video':
                internalExt = 'mp4';
                break;
            case 'embed':
                internalExt = 'json';
                break;
            case 'timestamp':
                if (Number.isSafeInteger(Date.parse(info.params.id))) found = true;
                break;
        }

        if (!found) {
            try {
                found = (await (await (info.$http.get(`/api/exists/${internalExt}/${info.params.id}`))).json()).found;
            } catch (error) {
                if (error.statusCode) {
                    info.error({
                        statusCode: error.statusCode
                    });

                    return;
                }
            }
        }

        if (!found) {
            info.error({
                message: 'Not found',
                statusCode: 404
            });

            return;
        }

        if (internalExt === 'json') {
            const embed = await (await info.$http.get('/api/content/json/' + info.params.id)).json();

            let modified: {[optionName: string]: any} = { embedName: embed.title, embedDescription: embed.description };
            
            if (embed.redirect) {
                const redirectString: string = embed.redirect;
                const splitString = redirectString.split('||');
            
                modified.embedRedirect = splitString[Math.floor(Math.random() * splitString.length)];
            }

            return modified;
        }
    },
    mounted() {
        if ((this as any).$data.embedRedirect) window.location.replace((this as any).$data.embedRedirect);
    }
}
</script>

<style scoped>
.content {
    text-align: center;
}

.content .info {
    font-weight: 400;
    font-size: 12px;
    margin-top: 40px;
    margin-bottom: 20px;
}

.content-type {
    background-color: #27272b;
    padding: 3px 6px;
    margin-right: 4px;
    border-radius: 5px;
}

.user-content {
    border-radius: 3px;
    box-shadow: 0px 3px 21px 3px rgba(0,0,0,0.3);
    max-width: calc(100vw - 20px);
}

.timestamp {
    background-color: #131313;
    width: max-content;
    max-width: 95vw;
    box-sizing: border-box;
    margin: auto;
    padding: 10px 20px;
    border-radius: 3px;
}

.timestamp p {
    margin-bottom: 10px;
}
</style>