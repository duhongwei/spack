# Spack #
`spack` 是一个打包工具。
`spack` 实现文件级缓存，速度极快。比如一个项目有100个文件。第一次编译spack会缓存每个文件的编译结果。第二次编译的时候，只做增量编译。如果你只修改的了一个文件，就只会对这一个文件做编译，所以速度极快。

## 应用场景 ##
量体裁衣的个性化定制。spack不是一个通用的打包工具，从一开始就有很明显的个性化色彩。

从开发成本上来说，开发一款打包工具成本会比较高，但是后面的维护升级成本很低，可以随心所欲。无论有什么样的离奇需求，都可以很容易实现。

相信我并不孤独，也许你也有这样的想法，象鸟儿一样自由自在的无拘无束的飞翔。

`spack`是根据我接触过的项目自然演变而成的，刚好满足我的项目的需求，不多，也不少。如果你的项目类型和我的刚好差不多，可以直接使用。如果不一样，spack可以作为一个参考，你也可以定制属于你自己的开发工具。

## 快速开始 ##
如果要在`spack`的基础上做修改首先需要了解`spack`。

spack作为一个非通用个性化打包工具，并没有发布模块，所以需要clone到本地。

``` bash
clone https://github.com/duhongwei/spack.git spack
sudo npm link
```
执行 `sudo npm link`后，就可以在全局使用 `spack 命令了` 
clone一个示例项目,然后用`spack`编译

``` bash
clone https://github.com/duhongwei/spack-vue-template spack-vue
cd spack-vue
spack
```
默认以开发方式运行在 `3000` 端口

开发完成后发布 `spack pro` ，生成好的文件会放在 `dist` 目录

## 深入了解 ##

有了感性认识后，可以对spack做一个深入了解。可以重点了解`spack`的设计思想，而不是代码本身，因为思想是通用的。

为了方便了解，我特意写了一个文档。
[https://duhongwei.gitbooks.io/spack/content/](https://duhongwei.gitbooks.io/spack/content/)
