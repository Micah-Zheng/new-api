import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '灵枢 API',
  description: '下一代 LLM 网关和 AI 资产管理系统',
  base: '/new-api/',

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
  ],

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/Calcium-Ion/new-api' },
          { text: 'Docker Hub', link: 'https://hub.docker.com/r/CalciumIon/new-api' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Calcium-Ion/new-api' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present 灵枢 API',
    },

    search: {
      provider: 'local',
    },

    outline: {
      label: '目录',
      level: [2, 3, 4],
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    lastUpdated: {
      text: '最后更新',
    },
  },
})
