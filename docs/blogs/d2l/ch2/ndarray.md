---
title: ndarray
date: 2024-11-02
categories:
  - deep learning
tags:
  - python
---
# 数据操作
两件重要的事情：  
1. 获取数据。
2. 将数据读入计算机后对其进行处理。


``` python 
import torch
x = torch.arange(12)    # tensor([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
print(x.shape)          # torch.Size([12])
print(x.numel())        # 12

y = x.reshape(3, 4)     
print(y)                # tensor([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]) 
```
我们不需要手动指定每个维度来改变形状。知道宽度之后，高度会被自动算出。
``` python

x.reshape(-1, 4)
```