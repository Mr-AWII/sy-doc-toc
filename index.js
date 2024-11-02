/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-11-14 12:02:16
 * @FilePath     : /index.js
 * @LastEditTime : 2024-11-02 14:46:25
 * @Description  : A minimal plugin for SiYuan, relies only on nothing but pure index.js.
 *                 Refer to https://docs.siyuan-note.club/zh-Hans/guide/plugin/five-minutes-quick-start.html
 */
// index.js
const siyuan = require('siyuan');

async function request(url, data) {
    let response = await siyuan.fetchSyncPost(url, data);
    let res = response.code === 0 ? response.data : null;
    return res;
}

module.exports = class TocPlugin extends siyuan.Plugin {

    async onload() {
        const lute = window.Lute.New();

        this.protyleSlash.push({
            filter: ['toc', 'outline'],
            html: this.i18n.hint,
            id: 'toc',
            callback: (protyle) => {
                // const element = protyle.protyle.element;
                request('/api/outline/getDocOutline', {
                    id: protyle.protyle.block.rootID
                }).then((ans) => {
                    if (!ans) {
                        siyuan.showMessage('TOC: Empty', 3000, 'error');
                        protyle.insert(window.Lute.Caret, false, false); //插入特殊字符清除 slash
                        return;
                    }
                    const iterate = (data) => {
                        let toc = [];
                        for (let item of data) {
                            let text = item.name || item.content;
                            text = lute.BlockDOM2Md(text);
                            text = text.trim();
                            toc.push(`${'  '.repeat(item.depth)} * [${text}](siyuan://blocks/${item.id})`);
                            console.debug(toc[toc.length - 1]);
                            if (item.count > 0) {
                                let subtocs = iterate(item.blocks ?? item.children);
                                toc = toc.concat(subtocs);
                            }
                        }
                        return toc;
                    }
                    let tocs = iterate(ans);
                    let md = tocs.join('\n');
                    protyle.insert(md, true);

                    setTimeout(() => {
                        protyle.reload();
                    }, 1000)
                });
            }
        });
    }
}
