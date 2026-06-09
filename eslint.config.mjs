// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config'

export default createConfigForNuxt().append({
    rules: {
        'vue/html-self-closing': [
            'warn',
            {
                html: {
                    void: 'always',
                    normal: 'always',
                    component: 'always',
                },
                svg: 'always',
                math: 'always',
            },
        ],
    },
})