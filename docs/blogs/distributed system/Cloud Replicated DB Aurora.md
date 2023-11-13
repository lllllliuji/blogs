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
不拷贝数据页，拷贝日志。放弃通用存储，采用应用定制存储系统(Application specific).
只需Quorum回复即可。
Fast replication. 

Quorum系统背后的思想是通过复制构建容错的存储系统，并确保即使有一些副本故障了，读请求还是能看到最近的写请求的数据。  
相比Chain Replication，Quorum可以剔除暂时故障、失联或者慢的服务器。  
Quorum系统可以调整读写的性能。通过调整Read Quorum和Write Quorum，可以使得系统更好的支持读请求或者写请求。
当Write Quorum = 副本总数时，写就是不可容错的，当Read Quorum = 副本总数时，读就是不可容错的。


存储服务器会在内存中缓存一个旧版本的page和一系列来自于数据库服务器有关修改这个page的Log条目。据库服务器会记录这里的数字，或者说记录每个存储服务器收到的最高连续的Log条目号。这样的话，当一个数据库服务器需要执行读操作，它只会挑选拥有最新Log的存储服务器，然后只向那个服务器发送读取page的请求。所以，数据库服务器执行了Quorum Write，但是却没有执行Quorum Read。