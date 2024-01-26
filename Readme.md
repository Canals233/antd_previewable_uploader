**一个基于ant design的支持粘贴上传,查重,预览的图片视频上传，非破坏性重写UI实现友好的上传预览体验的react组件**

1. 优化Upload后**图片和视频预览，非破坏性替换UI**，图片视频可以横向切换预览，对不能预览的情况，比如视频除了MP4,Ogg，WebM这几种格式外的情况，浏览器不能播放则可以提供**一个提示**让用户转变格式后上传，或后续进行服务端转码

2. 通过onChange调整上传逻辑，可控制上传文件的类型，大小等等进行上传限制

3. 对需要二次上传的情况，即既需要旧的展示（纯URL数组）也需要新上传内容的情况，兼容化处理，让新旧内容的**增删改查同步**，保证了现实的一致性
4. 支持图片的粘贴上传，对同页面中有**多个上传组件**的情况进行处理，根据鼠标是否hover控制粘贴

https://github.com/Canals233/antd_previewable_uploader/blob/main/gitimage/%E5%9B%BE%E7%89%87.png?raw=true

https://github.com/Canals233/antd_previewable_uploader/blob/main/gitimage/%E6%9C%80%E7%BB%88%E6%95%88%E6%9E%9C.png?raw=true

https://github.com/Canals233/antd_previewable_uploader/blob/main/gitimage/%E8%A7%86%E9%A2%91.png?raw=true

详细说明地址： [一步步实现一个粘贴，查重，滑动预览的图片和视频上传组件 - 掘金 (juejin.cn)](https://juejin.cn/spost/7328273660790439988)

