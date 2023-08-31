---
title: Crash and Recovery part B
date: 2023-05-20
categories:
  - database
tags:
  - database
  - crash and recovery
  - cmu 15-445
  - ARIES
# sticky: 1
---
# Algorithm for Recovery and Isolation Exploiting Semantics
## 1. Main Ideas
* Write-Ahead Logging:  
  * Any change is recorded in log on stable storage before the
database change is written to disk.
  * Must use STEAL + NO-FORCE buffer pool policies.  
  
* Repeating History During Redo:  
  * On DBMS restart, retrace actions and restore database to
exact state before crash.
* Logging Changes During Undo:
  * Record undo actions to log to ensure action is not
repeated in the event of repeated failures.
## 2. Log Sequence Number
We need to extend our log record format from last class to include additional info.  
Every log record now includes a globally unique
***log sequence number*** (**LSN**).   
* LSNs represent the physical order that txns make changes
to the database.  

Various components in the system keep track of
LSNs that pertain to them…  

|Name| Location | Definition |
|:-|:-|:-|
|flushedLSN| Memory | Last LSN in log on disk|
|pageLSN| $page_x$| Newest update to $page_x$|
|recLSN| $page_x$| Oldest update to $page_x$ since it was last flushed|
|lastLSN| $T_i$| Latest record of txn $T_i$|
|MasterRecord| Disk| LSN of latest checkpoint|

Each data page contains a ***pageLSN*** (the LSN of the most recent update to that page).  
System keeps track of ***flushedLSN*** (the max LSN flushed so far).
Before the DBMS can write page x to disk, it must flush the log at least to the point where $pageLSN_x\le fushedLSN$.


