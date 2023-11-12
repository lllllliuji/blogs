---
title: Cloud Replicated DB Aurora
date: 2023-11-12
categories:
  - distributed system
tags:
  - 6.824
---
VMM(virtural machine monitor)
EC2(elastic cloud compute )  
EBS(elastic block store)
EBS volume: 一个EBS volume看起来就像是一个普通的硬盘一样，但却是由一对互为副本EBS服务器实现，每个EBS服务器本地有一个硬盘。两个EBS服务器采用链式复制。每个EBS volume只能被一个EC2实例使用。  
EC2和两个EBS运行在同一个AZ(availablity zone)  
RDS(relational database service)  

mirrored mysql网络传输了大量的无用数据，拖慢了性能。
不拷贝数据页，拷贝日志。  
Fast replication. 

Quorum系统背后的思想是通过复制构建容错的存储系统，并确保即使有一些副本故障了，读请求还是能看到最近的写请求的数据。  
Quorum可以剔除慢的系统。