---
title: MapReduce
date: 2023-11-14
categories:
  - distributed system
tags:
  - distributed transaction
  - 6.824
---
1. concurrency control
2. atomic commit

可串行化(serializablity)定义了事务执行的正确性，只要事务不使用相同的数据，它可以真正地允许并行的事务。

乐观锁：只是在最后提交的时候用到锁。  
悲观锁：整个事务过程中都需要锁。

两阶段锁为什么最后释放，因为事务可能回滚，或者看见不一致的数据。

2 phase commit。用锁来实现分布式事务，事务提交或回滚才释放锁。
关键节点持久化log。