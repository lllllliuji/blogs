---
title: Scaling Memcache at Facebook
date: 2023-11-14
categories:
  - distributed system
tags:
  - consistency
  - 6.824
---
hot key  bottleneck db  
memcache doesn't need to know the existence of DB, cache some computed result for next read.
if you don't do something clever, data stored in the memcache will get out of sync with the data in the database.  
do not cache data indefinitely!  
The other situation in which they need to provide consistency is if a user updates their own data and reads that same data that the human knows that they just updated, it's extremely confusing for the user to see stale data.(front end delete, Mcsqueal do delete like canal)  
how do they keep mc content consistent w/ DB content?
  1. DBs send invalidates (delete()s) to all mc servers that might cache
     this is McSqueal in Figure 6
  2. writing client also invalidates mc in local cluster
     for read-your-own-writes
they ran into a number of DB-vs-mc consistency problems
  due to races when multiple clients read from DB and put() into mc
  or: there is not a single path along which updates flow in order

what were the races and fixes?

Race 1:
```
  k not in cache  
  C1 get(k), misses  
  C1 v1 = read k from DB  
    C2 writes k = v2 in DB  
    C2 delete(k)  
  C1 set(k, v1)  
  now mc has stale data, delete(k) has already happened
  will stay stale indefinitely, until k is next written
  ```
  **solved with leases** -- C1 gets a lease from mc, C2's delete() invalidates lease,
    so mc ignores C1's set
    key still missing, so next reader will refresh it from DB

Race 2:
```
  during cold cluster warm-up
  remember: on miss, clients try get() in warm cluster, copy to cold cluster
  k starts with value v1
  C1 updates k to v2 in DB
  C1 delete(k) -- in cold cluster
  C2 get(k), miss -- in cold cluster
  C2 v1 = get(k) from warm cluster, hits
  C2 set(k, v1) into cold cluster
  now mc has stale v1, but delete() has already happened
    will stay stale indefinitely, until key is next written
```
  **solved with two-second hold-off**, just used on cold clusters
    after C1 delete(), cold mc ignores set()s for two seconds
    by then, delete() will (probably) propagate via DB to warm cluster

Race 3:
```
  k starts with value v1
  C1 is in a secondary region
  C1 updates k=v2 in primary DB
  C1 delete(k) -- local region
  C1 get(k), miss
  C1 read local DB  -- sees v1, not v2!
  later, v2 arrives from primary DB
  ```
  
  **solved by "remote mark"**
    C1 delete() marks key "remote"
    get() miss yields "remote"
      tells C1 to read from *primary* region
    "remote" cleared when new data arrives from primary region

Q: aren't all these problems caused by clients copying DB data to mc?
   why not instead have DB send new values to mc, so clients only read mc?
     then there would be no racing client updates &c, just ordered writes
A:
  1. DB doesn't generally know how to compute values for mc
     generally client app code computes them from DB results,
       i.e. mc content is often not simply a literal DB record
  2. would increase read-your-own writes delay
  3. DB doesn't know what's cached, would end up sending lots
     of values for keys that aren't cached
