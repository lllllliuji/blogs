---
title: Chain Replication with Apportioned Queries
date: 2023-11-10
categories:
  - distributed system
tags:
  - 6.824
---

1. 通过复制实现了容错
2. 通过以链复制API请求的方式，提供了与Raft相比不一样的属性。

CRAQ可以从任意副本执行读请求，同时也保留线性一致性。

旧的chain replication，
有一系列节点，一个Head, 一个tail。
写请求发送给Head, head复制给next，直到tail也成功执行，由tail通知客户端是否成功。  
读请求发送给tail。

故障恢复：
1. head fail: head的下一个节点可以成为新的head，并不需要任何其他操作，因为请求要么传递到了旧head的下一个节点，要么没有。
2. tail fail: tail的前一个节点可以成为新的tail，并不需要任何其他操作。
3. 中间节点fail: 移除故障节点（N），N->prev重发最近的请求到N->next。

假如head和head的后继节点网络分区了，那么head可能认为自己既是head又是tail，head的后继则会认为自己是新的leader。自此，脑裂产生。  

传统chain replication不能抵抗网络分区，也不能抵抗脑裂。需要一个外部权威(External Authority)来决定谁是活的，谁挂了，并确保所有参与者都认可哪些节点组成一条链，谁是Head, 谁是tail, 这些链的定义。这个外部权威通常称为Configuration Manager，基于Raft或者Paxos。

有了Configuration Manager之后，即使head和head的后继节点网络分区了，但是在收到新的配置信息之前，会一直重发信息。

当有一个慢的副本时，会拖累整个系统的能力。

