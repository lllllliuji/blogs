---
title: linear regression
date: 2024-11-07
categories:
  - deep learning
tags:
  - python
---
# 线性回归
回归（regresion）是能为一个或多个因变量之间关系建模的一类方法。在自然科学和社会科学领域，回归经常用来表示输入和输出之间的关系。
在高斯噪声的假设下，最小化均方误差等价于对线性模型的极大似然估计。



生成一个[num_example, len(w)]的数据，

``` python
loss = nn.MSELoss()
net = nn.Sequential(nn.Linear(2, 1))
trainer = torch.optim.SGD(net.parameters(), lr=0.03)
for epoch in range(n_epoch):
  for X, y in data_iter:
    loss = loss_func(net(X), y)
    trainer.zero_grad_()
    l.backward()
    trainer.step()
    
```
1. 最大化观测数据的似然。
2. 最小化传达标签的惊异。

Animator可以动态画图

防溢出，logsumexp