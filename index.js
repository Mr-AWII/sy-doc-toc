/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-11-14 12:02:16
 * @FilePath     : /index.js
 * @LastEditTime : 2024-11-02 20:46:42
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

const getCurrentNode = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    let currentEle = range.endContainer;
    // 如果是 text 节点，则向上找最近的 node 节点
    while (currentEle.nodeType === 3) {
        currentEle = currentEle.parentNode;
    }
    return currentEle.closest('div[data-node-id]');
}

const TOC_ATTR_NAME = 'custom-is-toc-list';


const buildDocToc = (docId, lute, callback) => {
    request('/api/outline/getDocOutline', {
        id: docId
    }).then(async (ans) => {
        if (!ans) {
            siyuan.showMessage('TOC: Empty', 3000, 'error');
            // protyle.insert(window.Lute.Caret, false, false); //插入特殊字符清除 slash
            callback([]);
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
        tocs.push(`{: ${TOC_ATTR_NAME}="true" }`);
        callback(tocs);
    });
}

module.exports = class TocPlugin extends siyuan.Plugin {

    lute = null;

    async onload() {
        this.lute = window.Lute.New();

        this.protyleSlash.push({
            filter: ['toc', 'outline'],
            html: this.i18n.hint,
            id: 'toc',
            callback: (protyle) => {
                buildDocToc(protyle.protyle.block.rootID, this.lute, async (tocs) => {
                    if (tocs.length === 0) {
                        siyuan.showMessage('TOC: Empty', 3000, 'error');
                        protyle.insert(window.Lute.Caret, false, false); //插入特殊字符清除 slash
                        return;
                    }
                    let md = tocs.join('\n');
                    const currentNode = getCurrentNode();
                    const nodeId = currentNode.getAttribute('data-node-id');
                    await this.insertToc(md, nodeId);
                    protyle.insert(window.Lute.Caret, false, false);
                });
            }
        });

        this.eventBus.on('click-blockicon', this.onClickBlockIconBind);

    }

    async onunload() {
        this.lute = null;
        this.eventBus.off('click-blockicon', this.onClickBlockIconBind);
    }

    onClickBlockIconBind = this.onClickBlockIcon.bind(this);

    async onClickBlockIcon({ detail }) {
        console.log(detail);
        const { blockElements, menu } = detail;
        if (blockElements.length > 1) {
            return;
        }
        const ele = blockElements[0];
        const hasTocAttr = ele.hasAttribute(TOC_ATTR_NAME);
        if (!hasTocAttr) {
            return;
        }
        menu.addItem({
            icon: 'iconList',
            label: this.i18n.updateToc,
            click: () => {
                const nodeId = ele.getAttribute('data-node-id');
                buildDocToc(nodeId, this.lute, async (tocs) => {
                    if (tocs.length === 0) {
                        siyuan.showMessage('TOC: Empty', 3000, 'error');
                        return;
                    }
                    let md = tocs.join('\n');
                    await request('/api/block/updateBlock', {
                        dataType: 'markdown',
                        data: md,
                        id: nodeId
                    });
                    siyuan.showMessage('TOC: Updated', 3000);
                });
            }
        });
    }


    async insertToc(md, nodeId) {
        await request('/api/block/insertBlock', {
            dataType: 'markdown',
            data: md,
            previousID: nodeId,
            nextID: "",
            parentID: ""
        });

        /*
        if (currentNodeContent === '') {
            await request('/api/block/updateBlock', {
                dataType: 'markdown',
                data: md,
                id: currentNodeID
            }); //这个不知道为啥有 bug https://github.com/frostime/sy-doc-toc/issues/4
        }
        */
    }
}
