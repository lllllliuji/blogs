---
title: Raft
date: 2023-08-20
categories:
  - distributed system
  - consensus algorithm
tags:
  - database
  - distributed system
  - consensus algorithm
  - 6.824
# sticky: 1
---
# Raft
## 1. Raft简介
Raft是一种基于日志复制的共识算法，它把共识算法分为了三个关键的步骤（领导者选举，日志复制，安全）。Raft在功能和效率上可以媲美Paxos，但是理解起来更为简单。另外，和其他共识算法相比，Raft有以下三个优秀的特性：
* Strong leader: 日志只从leader流向其他服务器，这简化了对复制日志的管理。
* Leader election: raft使用随机的timeout来检测leader是否下线。
* Membership changes: raft使用了一种joint consensus方法使得在配置切换过程中，如果新旧两种配置各自达到一个quorum，至少有一个重合的节点，防止脑裂，这使得raft在配置切换的时候依然能够正常提供服务。
## 2. 复制状态机(replicated state machine)
共识算法通常和复制状态机一起讨论。不同服务器上的状态机针对相同的状态计算出相同的结果，并且在有些服务器宕机后依然能够正常工作。复制状态机用来解决分布式系统中的一系列容错问题。

![figure1](./../../.vuepress/public/raft/figure1.jpg#pic_center)

Replicated state machine 通常用 replicated log来实现。每个服务器都存储一系列日志，每条条日志通常包含一系列命令，状态机在这条日志提交后按序执行这些命令。所以，只需要保证了服务器日志提交的顺序相同，那么各服务器中状态机在执行日志中的命令之后，内容也就都是相同的了。

## 3. Raft共识算法
raft算法首先需要选举一个leader，然后给予leader全部的权限去管理replicated log。leader接受client的请求（一条包含多个命令的日志），然后把这个请求复制给集群的其他服务器。当成功地把这条请求复制到majority之后，就可以在状态机上执行这些命令。当leader fail或者disconnected from other server, 一个新leader会被重新选举出来。
### 3.1 raft basic
通常在raft集群中，每个节点都处于leader, candidate, follower中的一种，但是只有一节点是leader，其他节点都是follower。leader处理所有来自客户端的请求，如果客户端请求到了follower节点，那么follower会把这个请求重新发给leader。当follower没有收到leader的心跳信息超过了 elction timeout， follower自动转换位candidate，发起新一轮的选举。  

raft把时间划分为长度不同的term，每个term都开始于一次leader election，赢得选举的节点就是该term的leader，leader在该任期内处理来自客户端的请求。因为分票的情况，在一个term里，没有节点得到超过一半以上的票数，该term可能不会产生leader，raft保证每个term最多只能有一个leader产生。

在raft中，term扮演着逻辑时钟的角色，每台服务器都保存着一个变量current term, current term随着时间单调递增，服务器进行交流的时候会更新自己的current term（取大的），拥有较小term的服务器会转换为follower（不论原来的角色是leader还是follower），节点会拒绝那些来自落后节点的请求。

raft通过rpc通信，一般会有一下几种：  
* RequestVote RPC, 一般由candidate在leader election阶段发起，向集群中的其他节点拉取选票。
* ApeendEntries RPC, 由leader发起，用于日志复制。另外，心跳也是由该rpc实现，只不过entry的长度为0，如果follower在特定时间内没有收到leader的心跳，将发起新一轮的选举。
* SnapShot RPC，由leader发起，有些follower节点落后主节点太多，发送一个snapshot帮助follower快速catch up。

### 3.2 leader election
所有的服务器都以follower角色启动，只要follower能够定期地（now - lastReceive < election timeout）收到来自leader或candidate的rpc调用，服务器就会保持follower状态。leader则会定期地向所有地服务器发送heartbeat rpc，这样集群就能保持一个节点是leader，其他节点都是follower的状态了。  
当follower在指定时间内没有收到来自leader或者candidate的rpc请求，那么该节点认为此时leader已经下线，自己将发起新一轮的leader election, 选举一个新leader。  
follower发起选举时，会把自己的current term加1，并且投票给自己，然后把自己的状态置为candidate，并且并发地向集群的其它节点发起RequestVote rpc请求。选举过程以下面三种方式结束：   
* 自己拿到足够的选票赢得了选举，成为leader。
* 另外一个服务器赢得选举，并向其他节点发送心跳信息。
* 由于分票情况，一直没能选出leader，形成活锁。  

follower对于给定的term最多只能投给一个candidate，candidate在收集到majority的选票才能成为leader，这个规则保证了一个term最多只能有一个leader。follower给candidate投票是按照先到先得的原则，另外还需保证candidate的日志as least as up-to-date follower的日志。up-to-date的比较方式为，比较最后一条日志的term，如果不相等，则term大的日志more up-to-date，如果相等则index大的日志more up-to-date。（raft的日志是一个可以往后append的数组）  
在选举过程中，如果其他节点收到了足够的选票成为leader并向candidate发送心跳，如果该leader节点的term at least as large as candidate's current term, 那么candidate认为这个leader是合法的，进而转变为follower。不然，candidate会拒绝请求，继续保持candidate状态。  
candidate无法收集到半数以上的选票，在经过election timeout之后，又会发起新一轮的选举。如果分票的情况一直发生，那么整个集群将长时间选举不出一个leader，raft通过给每个节点一个随机的election timeout解决了这个问题。

### 3.3 log replication

  



