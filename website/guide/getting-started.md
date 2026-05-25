# API 密钥与外接配置

本教程介绍如何在灵枢 API 中创建 API 密钥，并配置到各客户端工具中使用。

## 第一步：创建 API 密钥

点击左边的 **API 密钥** → 点击 **创建 API 密钥**

![创建 API 密钥入口](/images/guide/api-key-entry.png)

![创建 API 密钥表单](/images/guide/api-key-form.png)

其他默认即可

保存好密钥

![保存密钥](/images/guide/api-key-save.png)

::: warning 重要
API 密钥创建后只显示一次，请务必妥善保存！
:::

## 第二步：外接 API

### cc-switch 下载

推荐使用 [cc-switch](https://github.com/farion1231/cc-switch) 进行一键配置。

cc-switch 是一个跨平台桌面工具，支持 Claude Code、Codex、OpenCode、openclaw、Gemini CLI 等多种 AI 工具的配置。

**下载地址：** [farion1231/cc-switch](https://github.com/farion1231/cc-switch)

下载完成之后选择你需要配置的工具。无论是 App 还是 CLI，配置文件都是一样的，修改一个都会生效。

![cc-switch 工具选择](/images/guide/cc-switch-select.png)

### cc-switch Claude 添加 API 和 URL 信息

#### 方法 1：在站点界面

![站点界面步骤1](/images/guide/claude-site-1.png)

![站点界面步骤2](/images/guide/claude-site-2.png)

![站点界面步骤3](/images/guide/claude-site-3.png)

#### 方法 2：在 cc-switch 软件

![cc-switch Claude 配置](/images/guide/claude-cc-switch.png)

::: tip 请求地址
```
https://api.red.tcp
```
:::

![cc-switch URL 配置](/images/guide/claude-cc-switch-url.png)

获取模型完成之后选择模型即可

![模型选择](/images/guide/claude-model-select.png)

### cc-switch Codex 添加 API 和 URL 信息

#### 方法 1：通过站点界面

![Codex 站点配置步骤1](/images/guide/codex-site-1.png)

![Codex 站点配置步骤2](/images/guide/codex-site-2.png)

![Codex 站点配置步骤3](/images/guide/codex-site-3.png)

#### 方法 2：通过 cc-switch 软件

![cc-switch Codex 配置](/images/guide/codex-cc-switch.png)

::: tip Codex 请求地址
Codex 的地址需要在末尾加 `/v1`：
```
https://api.tcp.red/v1
```
:::

![Codex URL 配置](/images/guide/codex-cc-switch-url.png)

### Claude 纯血版

::: info 注意
此方式只能在 Claude 官方客户端中使用，不支持外接到其他工具。
:::
