---
title: Zookeeper
date: 2023-11-10
categories:
  - distributed system
tags:
  - linearizability
  - 6.824
---
全局全序  
每个客户端看到相同的顺序  
as if one copy of data, and a linear sequence of operations applied to the data.
```
**example 1**  
|===wx1===|   |===wx2===|  
       |===rx2===|  
         |=rx1=|
exists a linear order:  wx1  rx1 wx2 rx2

**example 2**  
|===wx1===|   |===wx2===|  
       |===rx2===|  
                     |=rx1=|
not linear

**example 3**  
|===wx0===|    |===wx1===|  
                 |===wx2===|
           |===rx2===|  |===rx1===|          
           |===rx1===|  |===rx2===|  
not linear  

**example 4**  
|===wx1===|   
             |===wx2===|  
                          |===rx1===|
not linera

**example 5**  
|===wx3===|     |===wx4===|  
            |==rx=======                         //request lost or reply lost or leader fail   
重传会导致不同的线性一致性问题
```
Linearizability 
1. exists one and only total order ops
2. matches real time
3. reads see perceeding write in the order


why ZK?
1. API general-purpose coord service
2. Nx - Nx performance

zk不保证线性一致性，可能返回旧数据.  
写请求是线性一致的。
任何一个客户端的请求，都会按照客户端指定的顺序来执行  

每个成功的请求会回复一个zxid， 即使切换副本，也会保证不会读到之前的数据  


zookeeper的FIFO属性
例子： 
1. 比如一个客户端在一个副本读到 index = 5的数据，但是这个副本故障了，换了另一个副本，那么接下来的读至少要从 index = 5开始. 
2. 比如一个客户端写一个一条数据 index = 5的数据，之后的读请求也必须从 index = 5开始

同步操作是一个写操作，返回最新的zxid，然后再读就可以读到“最新”的数据了。


**ready file**  
时间|write order|read order
:-:|:-:|:-:
1|delete("ready")|
2|write file1| 
3|write file2|
4|create("ready")|
5||exist("ready") 
6||read file1
7||read file2
8||exist("ready")
9|delete("ready")|
10||read file1
11|write file1|
12|write file2|
13||read file
14|create("ready")|


10-13的读会读到旧的file1和新的file2  
解决发案，建立ready file的watch，如果删除给客户端通知, 即exist("ready", watch = true)  
也就是说，先执行通知客户端，再进行删除操作。也就是，客户端读取配置读了一半，如果收到了ready file删除的通知，就可以放弃这次读，再重试读。


znode  
1. regular znodes, 一旦创建，永久存在，除非删除
2. ephemeral znodes. 如果zookeeper认为创建它的客户端挂了，它会删除这种类型的znode. 这种类型的znode与客户端会话绑定，所以客户端需要通过心跳告诉zookeeper自己还活着，这样zookeeper才不会删除客户端对应的ephemeral znodes。
3. sequential znode. 当你想要一个特定的名字创建一个文件，zookeeper实际上创建的文件名是你指定的文件名再加上一个数字。当有多个客户端创建sequential文件时，zookeeper会保证这里的数字不重合，同时也会保证这里的数字是递增的。


create(path, data, flag), path：路径，data：数据，flag：znode类型。create的语义是排他的，如果返回值是yes，说明之前该文件不存在，如果是no或者错误，说明该文件存在。

mini-transaction与数据库中的乐观锁差不多

创建非扩展锁
```
WHILE TRUE:
    IF CREATE("f", data, ephemeral=TRUE): RETURN
    IF EXIST("f", watch=TRUE):
        WAIT
```
羊群效应，需要对watch的客户端通知，非扩展锁。
如果有1000个客户端同时要获得锁文件，为1000个客户端分发锁所需要的时间也是O(n^2)
。因为每一次锁文件的释放，所有剩下的客户端都会收到WATCH的通知，并且回到循环的开始，再次尝试创建锁文件。  


创建可扩展锁
```
CREATE("f", data, sequential=TRUE, ephemeral=TRUE)
WHILE TRUE:
    LIST("f*")
    IF NO LOWER #FILE: RETURN
    IF EXIST(NEXT LOWER #FILE, watch=TRUE):
        WAIT
```
