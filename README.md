Plugin for SiYuan Notes that inserts a document outline via the `/toc` or `/outline` command. Supports multi-level outlines, and the generated TOC is clickable for navigation.

The inserted TOC outline is a list block of header links, such as:
```md
* [Title 1](siyuan://blocks/block-id-1)
  * [Subtitle 1.1](siyuan://blocks/block-id-2)
  * [Subtitle 1.2](siyuan://blocks/block-id-3)
* [Title 2](siyuan://blocks/block-id-4)
  * [Subtitle 2.1](siyuan://blocks/block-id-5)
```