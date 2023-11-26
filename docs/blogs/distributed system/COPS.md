---
title: Don’t Settle for Eventual, Scalable Causal Consistency for Wide-Area Storage with COPS
date: 2023-11-14
categories:
  - distributed system
tags:
  - consistency
  - 6.824
---

Local read   
Local write  

Real world: Dynamo, Cassandra  
Eventual consistency, No order.  
Anomaly  
```
C1: put(photo), put(list)   // put a photo to storage system, add the reference to list
C2:                         get(list) get(photo) // list may contain the photo, but storage system may not
```

Lamport clock  
1. every server keeps a value called Tmax, which is the highest version number it's seen so far from anywhere else.
2. T = max(Tmax + 1, realtime), i.e. version number

Conflicting writes(Concurrent write to the same key)  
1. The last writer wins. 
2. fail to atomic increment  

Eventual consistency plus barrier  
sync(k, version number) // waits until all data center copies of key K are at least up to date as of the specified version number
put(k, v) -> version number  
```
C1: v# = put(photo), sync(photo, v#), put(list)
C2:                                             get(list), get(photo) // rather get photo before update or after update  
if other client see the data after sync, it has to see the data before the sync.
some datacenter may fail, sync may wait indefinitely, use quorum
```

client send write to local datacenter, datacenter send write to a Log server, log server pick up a order, send writes to other datacenter, does not need to wait   

COPS  
cascading dependency waits  