@echo off

REM 确保脚本抛出遇到的错误
setlocal enabledelayedexpansion
set "npmCommand=npm run docs:build"

REM 生成静态文件
%npmCommand%

REM 进入生成的文件夹
cd docs\.vuepress\dist

git init
git add -A
git commit -m "deploy"

REM 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:lllllliuji/blogs.git master:gh-pages

cd ..
