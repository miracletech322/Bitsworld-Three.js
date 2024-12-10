import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    build: {
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, 'index.html'),
                information: path.resolve(__dirname, 'information.html'),
                play: path.resolve(__dirname, 'play.html'),
                about: path.resolve(__dirname, 'about.html'),
                login: path.resolve(__dirname, 'login.html'),
                privacyPolicy: path.resolve(__dirname, 'privacy-policy.html'),
                termsOfService: path.resolve(__dirname, 'terms-of-service.html'),
                articlesDetails: path.resolve(__dirname, 'articles-details.html'),
                explore: path.resolve(__dirname, 'explore.html'),
                1: path.resolve(__dirname, '1.html'),
                2: path.resolve(__dirname, '2.html'),
                3: path.resolve(__dirname, '3.html'),
                4: path.resolve(__dirname, '4.html'),
                5: path.resolve(__dirname, '5.html'),
                6: path.resolve(__dirname, '6.html'),
                7: path.resolve(__dirname, '7.html'),
                8: path.resolve(__dirname, '8.html'),
                9: path.resolve(__dirname, '9.html'),
                10: path.resolve(__dirname, '10.html'),
                11: path.resolve(__dirname, '11.html'),
                13: path.resolve(__dirname, '13.html')
            }
        }
    }
})
