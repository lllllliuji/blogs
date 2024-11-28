react 由meta开发，是一个用于构建web和原生交互界面的库。  

优势：
1. 组件化的开发方式
2. 优异的性能
3. 丰富的生态
4. 跨平台

创建react应用
``` shell
npx create-react-app react-basic
# npx node.js命令工具
# creat-react-app 固定写法，用于创建react项目
# react-basic 项目名称
```

``npm run start``, ``npm run build``分别启动和构建项目。

src文件夹只需要保留app.js,index.js两个即可，其他可以删除。  
index.js: 项目的入口，从这里开始运行。
核心逻辑： app -> index.js -> public/index.html -> root


JSX: javascript和xml的缩写。表示在JS代码中编写html模板结构，它是react中编写ui模板的方式。  
优势：html的声明式模板写法，js的可编程能力。  
JSX不是标准JS语法，浏览器本身不能识别，需要解析工具做解析才能在浏览器中运行。  

JSX中使用JS表达式  
在JSX中可以通过``大括号语法{}``识别JavaScript中的表达式，比如常见的变量
函数调用、方法调用等等。  
1. 使用引号传递字符串
2. 使用JavaScript变量
3. 函数调用和方法调用
4. 使用JavaScript对象  

注意：if语句，switch语句、变量声明属于语句，不是表达式，不能出现在{}中。  




