---
title: Zookeeper
date: 2023-11-10
categories:
  - distributed system
tags:
  - 6.824
---
全局全序  
每个客户端看到相同的顺序  
as if one copy of data, and a linear sequence of operations applied to the data.

x0 wx1 wx2  
rx1 rx2  
rx2 rx1
wx1 -> rx1 -> wx2 -> rx2 -> wx2