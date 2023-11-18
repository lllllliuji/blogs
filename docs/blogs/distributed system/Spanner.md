---
title: Spanner
date: 2023-11-18
categories:
  - distributed system
tags:
  - database
  - distributed system
  - 6.824
# sticky: 1
---
there is a copy of data near everybody who wants to use it.  

1. 2 phase commit
2. synchonize time in order to have very efficent read-only transaction.  

external consistency: if one transaction commits and after it finishes committing, another transaction starts, the second transaction need to any modification is done by the first.

data shard spread many data center.   
R/W transcation, 2 phase locking and 2 phase commit.
1. client read the data involved and require the locks from paxos groups.
2. client choose one of the paxos group act as the transaction coordinator.  
3. client sends out the updated data and the coordinator paxos group id to each paxos group involved.
4. each paxos leader send a prepare log to paxos follower, when majority response, paxos leader sends a yes to coordinator.
5. when coordinator receive leaders of all different shards whose data is involved in this transaction, if they all say yes then the coordinator can commit, otherwise can't.
6. coordinator sends a commit message to the paxos groups.
7. paxos group execute the write and release the lock.

drawbacks:  
1. coordinator fail
2. many cross data center network message, massive message intensive scheme.
3. locks and log information must persist for crash and recovery.
4. the throughput of the system may be high sinced it's sharded and it can run a lot non-conflicting transactions in parallel, but the delay of an indivisual transaction is very high.

Read only transaction  
1. read from local data center.
2. doesn't use locks, doesn't use 2 phase commit.
3. serializable.
4. external consistency, equivlent to linear consistency.

```
why read the latest value doesn't work？
tx1: W(x), W(y), Commit
tx2:                          W(x), W(y), Commit
tx3:                     R(x)                       R(y)
----------------------------------------------------------> time(t)
tx3 read x from tx1, but read y from tx2.
```

snapshot isolation  
imagine every transaction is assigned a particular time, a timestamp.  
R/W transaction, ts = commit time    
R only transcation, ts = start time  

multi-version DB  
if it's been writen a couple of times, then it has a seperate copy of that record for each of the times it's been writen, each one of them associated with the timestamp of the transaction that wrote it.  

read-only transaction does a read, it's already allocated itself a timestamp when it started so it accompanies its read request with its timestamp, and the whatever server that stores the replicas of the data that the transaction needs it's going to look into its multi-version database and find the record that's being asked for that as the highest time that's still less than the timestamp specified by the read-only transaction.  

```
t1(@10):  W(x), W(y), Commit.
t2(@20):                                  W(x), W(y), Commit.
t3:                            R(x),                          R(y)
database: 
x@10: 9, y@10: 11
x@20: 8, y@20: 12
so the t3's timestamp decide what data it should see.
------------------------------------------------------------>time
```
the problem here is that the local replica may be in the minority of the paxos followers that didn't see the latest log records. For example, local replica didn't see version-10.   

Spanner solve this by SAFE TIME.  
Each replica remembers the very last log record it's gotten from its leader to know how up to dated, so if I ask for a value as of timestamp 15 but the replica has only gotten log entries from the paxos leader after a timestamp 13, the replicas gonna make us delay, it's not gonna answer until it's gotten a log record with timestamp 15 from the leader, and this ensures that replicas don't answer a request for a given timestamp until they're guaranteed to know everything from the leader up throught that timestamp.  
对于最新的更新是15， read timestamp是20，猜测leader会给follower发送最大的update timestamp with 当前的TT interval, 如果最大的timestampe也小于read timestamp,则直接读数据。

What if clocks aren't synced ?
R/O transaction's timestamp is too large ? local replica force client wait until receiving log with timestamp higher from leader. correct but slow.    
R/O transaction's timestamp is too small? miss recent writes. not external consistency.  

Universal notion of time that called UTC.  


TRUE TIME SCHEME  
TT INTERVAL: [EARLIEST, LATEST], correct time >= EARLIEST && correct time <= LATEST.  
Start Rule  
TS = TT.now().latest  
R/O tx - start  
R/W tx - commit 

Commit Wait  (only for R/W transaction)  
Delay until TS < TT.now().earliest  

```
t0@1: W(X, 1) Commit
t1@10:                 W(X, 2) TT interval: [1, 10], poll true time machine until get a TT interval whose latest is greater than 10, Commit
t2@12:                                                    TT interval: [10, 12], R(x)
```

