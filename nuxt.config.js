export default {
    buildModules: ['@nuxt/typescript-build'],
    modules: ['@nuxt/http'],
    components: true,
    target: 'server',
    server: {
        port: 8880,
        host: '0.0.0.0'
    },
    head: {
        title: 'xethlyx\'s media',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { name: 'theme-color', content: '#3498db' },
            { name: 'og:site_name', content: 'xethlyx' },
            { name: 'og:type', content: 'article' },
            { name: 'twitter:site', content: '@xethlyx' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
    },
    srcDir: 'src/',
    serverMiddleware: [
        { path: '/api', handler: '~/api'}
    ],
    css: [
        '~/main.css'
    ]
}