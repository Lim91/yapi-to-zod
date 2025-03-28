# yapi-to-zod README

vscode插件，通过yapi接口返回的数据生成`zod`接口定义文件

## Features

使用

#### 1、配置Yapi帐号信息

在`设置`=>`扩展`=>`Yapi To Zod`中配置yapi帐号信息

<img src="https://gitee.com/limya/pico-imgs/raw/master/imgs/config.png" width="600" />

#### 2、生成配置文件

使用快捷键`F1`或`cmd/ctrl+shift+p`调出命令窗口，输入`YapiToZod`，
选中`YapiToZod: 生成配置文件`命令。

<img src="https://gitee.com/limya/pico-imgs/raw/master/imgs/command.png" width="600" />


<br />

配置文件`.yapi-to-zod.js`内容：

``` js
module.exports = () => {
 return {
  /** 头部内容，可以填写导入的请求实例等 */
  header: [],
  /**
   * 生成请求内容
   * @param {object} param0
   * @param {string} param0.comment 注释内容
   * @param {string} param0.interfaceName 接口名，大驼峰
   * @param {string | undefined} reqModelName 请求参数模型名
   * @param {string | undefined} resModelName 返回数据模型名
   * @param {string} param0.apiPath 接口路径
   * @param {object} yapiData
   */
  genRequest({comment, interfaceName, hasReqDefine, hasResDefine, apiPath}, yapiData) {
   //
  }
 };
};
```

#### 3、生成接口声明文件

在目录中右键选择`YapiToZod：生成Api声明文件`命令

<img src="https://gitee.com/limya/pico-imgs/raw/master/imgs/create-api-file.png" width="400" />

填入接口id，回车创建接口声明文件

<img src="https://gitee.com/limya/pico-imgs/raw/master/imgs/image-20250328103211574.png" width="500" />
<img src="https://gitee.com/limya/pico-imgs/raw/master/imgs/image-20250328103425909.png" width="500" />
