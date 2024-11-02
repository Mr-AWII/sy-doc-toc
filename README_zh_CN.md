为思源笔记编写的插件，通过 /toc 或 /outline 命令插入文档大纲。支持多级大纲，生成的 TOC 可点击跳转。

插入的 TOC 大纲为标题链接的列表块，如:
```md
* [标题1](siyuan://blocks/block-id-1)
  * [子标题1.1](siyuan://blocks/block-id-2)
  * [子标题1.2](siyuan://blocks/block-id-3)
* [标题2](siyuan://blocks/block-id-4)
  * [子标题2.1](siyuan://blocks/block-id-5)
```

插入的大纲列表块会自动添加 `custom-is-toc-list` 属性；鼠标点击块菜单，可以在插件菜单中「更新大纲」。
