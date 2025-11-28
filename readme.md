# minecraft addons 文档中文翻译
minecraft基岩版文档中文翻译，文档来源：[Mojang/bedrock-samples](https://github.com/Mojang/bedrock-samples)、[bedrock-dot-dev/docs](https://github.com/bedrock-dot-dev/docs)

标准化译名参考[基岩版开发Wiki:译名标准化](https://wiki.mcbe-dev.net/p/Minecraft%E5%9F%BA%E5%B2%A9%E7%89%88%E5%BC%80%E5%8F%91Wiki:%E8%AF%91%E5%90%8D%E6%A0%87%E5%87%86%E5%8C%96)

部分翻译取自[bedrock.dev](https://bedrock.dev/zh)
## 贡献
- 此文档由[幻想边境社团](https://github.com/GensouEdge)翻译(可加入翻译组)
### 贡献者
- 特别鸣谢本项目所有[贡献者](https://github.com/GensouEdge/minecraft_be_doc_cn/graphs/contributors)
## 许可证
- 版权所有 © 2025 幻想边境
---
- 站点部分代码遵循 [AGPLv3](LICENSE) 协议
- 本文档遵循[CC-BY-NC](https://creativecommons.org/licenses/by-nc/4.0/deed.zh)协议
  >您可以复制、发行、展览、表演、放映、广播或通过信息网络传播本作品；
  >您必须按照作者或者许可人指定的方式对作品进行署名；
  >您不得为商业目的而使用本作品。
## 建议
- 本文档适合配合[MinecraftWiki](https://zh.minecraft.wiki/)和[learn.microsoft.com](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/componentlist?view=minecraft-bedrock-stable)进行查阅
## 注意
- 文档**原文**就存在些许问题

例：
  - `minecraft:equippable`中的`on_equip`和`on_unequip`的类型应该是`JSON对象`，但在文档原文中显示的类型却是`字符串`。
  - 幽默Mojang在正文中会使用`<>`例如：`definitions/entity/<entity_name>.json` 但浏览器会显示为： `definitions/entity/.json`，因为浏览器会把`<>`和其中的内容当作HTML标签而不显示在页面上。明显`<entity_name>`被当作标签屏蔽了。那么这种情况我们可以用转义符`&lt;`和`&gt;`表示`<`和`>`
  - 想帮我们找出类似的其它问题？请发[Issue](https://github.com/GensouEdge/minecraft_be_doc_cn/issues)


