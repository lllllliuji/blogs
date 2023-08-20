module.exports = {
    title: "kisschang's blog",
    description: "Keep your mind sharp",
    theme: "reco",
    base: "/blogs/",
    locales: {
        "/": {
            lang: "zh-CN",
        },
    },
    themeConfig: {
        author: "kisschang",
        subSidebar: "True",
        logo: "/raft.png",
        authorAvatar: "/raft.png",
        type: "blog",
        nav: [
            {
                text: "首页",
                link: "/"
            },
            {
                text: "other",
                items: [
                    { text: "力扣", link: "https://leetcode.cn/u/lllllliuji-2/" },
                    { text: "B站", link: "https://space.bilibili.com/474291372" }
                ]
            }
        ],
        blogConfig: {
            category: {
                location: 2, // 在导航栏菜单中所占的位置，默认2
                text: "目录", // 默认文案 “分类”
            },
            tag: {
                location: 4, // 在导航栏菜单中所占的位置，默认4
                text: "Tag", // 默认文案 “标签”
            },
        },

        // sidebar: [
        //     {
        //         title: "欢迎学习",
        //         path: "/",
        //         collapsable: false,  // 是否折叠
        //         children: [{ title: "博客简介", path: "/" }],
        //     },
        //     {
        //         title: "basic",
        //         path: "/blogs/1",
        //         collapsable: true,
        //         children: [
        //             { title: "第一篇", path: "/blogs/1" },
        //             { title: "第二篇", path: "/blogs/2" },
        //         ]
        //     }
        // ]
    },
    plugins: [
        // [
        //     "sakura",
        //     {
        //         num: 20, // 默认数量
        //         show: true, //  是否显示
        //         zIndex: -1, // 层级
        //         img: {
        //             replace: false, // false 默认图 true 换图 需要填写httpUrl地址
        //         },
        //     },
        // ],
        [
            "cursor-effects",
            {
                size: 4, // size of the particle, default: 2
                shape: "star", // ['star' | 'circle'], // shape of the particle, default: 'star'
                zIndex: 999999999, // z-index property of the canvas, default: 999999999
            },
        ],
        [
            "@vuepress-reco/vuepress-plugin-bgm-player",
            {
                audios: [
                    {
                        name: "我中意",
                        artist: "魔动闪霸 / 炎明熹",
                        url: "/我中意.mp3",
                        // cover: "https://assets.smallsunnyfox.com/music/3.jpg",
                    },
                    // {
                    //     name: "팔베개",
                    //     artist: "최낙타",
                    //     url: "https://assets.smallsunnyfox.com/music/3.mp3",
                    //     cover:
                    //         "https://p1.music.126.net/qTSIZ27qiFvRoKj-P30BiA==/109951165895951287.jpg?param=200y200",
                    // },
                ],
                // 是否默认缩小
                autoShrink: true,
                // 缩小时缩为哪种模式
                shrinkMode: "float",
                // 悬浮窗样式
                floatStyle: { bottom: "20px", "z-index": "999999" },
            },
        ],
    ],
}