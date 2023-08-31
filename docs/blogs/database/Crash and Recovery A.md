---
title: Crash and Recovery part A 
date: 2023-05-20
categories:
  - database
tags:
  - database
  - crash and recovery
  - cmu 15-445
sticky: 1
---
# Crash and Recovery in Database
## 1. Prerequisites
***Steal policy***:  Whether the DBMS allows an uncommitted txn to
overwrite the most recent committed value of an
object in non-volatile storage.  
**Steal**: Allowed  
**No-Steal**: Not Allowed  

***Force Policy***: Whether the DBMS requires that all updates made by a txn are reflected on non-volatile storage before the txn can commit.  
**Force**: Required  
**No-Force**: Not required

## 2. No-Steal + Force VS Steal + No-Force
### 2.1 No-Steal + Force
This approach is the easiest to implement:  
* Never have to undo changes of an aborted txn because the changes were not written to disk  
* Never have to redo changes of a committed txn because all the changes are guaranteed to be written to disk at commit time (assuming atomic hardware writes).


**Drawbacks**: cannot support write sets that exceed the amount of physical memory available.

### 2.2 Steal + No-Force  
Almost every DBMS uses NO-FORCE + STEAL(see later).  
Best runtime performance but worst recovery performance.


## 3. Shadow Paging
Instead of copying the entire database, the DBMS copies pages on write to create two versions:
* Master: Contains only changes from committed txns.
* Shadow: Temporary database with changes made from uncommitted txns.
To install updates when a txn commits, overwrite the root so it points to the shadow, therebyswapping the master and shadow.  

**Buffer Pool Policy**: NO-STEAL + FORCE  
**DrawBacks**:  
* Copying the entire page table is expensive:  
    * Use a page table structured like a B+tree (LMDB).
    * No need to copy entire tree, only need to copy paths in the tree that lead to updated leaf nodes.
* Commit overhead is high:  
  * Flush every updated page, page table, and root.
  *  Data gets fragmented (bad for sequential scans).
  *  Need garbage collection.
  *  Only supports one writer txn at a time or txns in a batch.  

## 4. Sqlite(pre-2010)
When a txn modifies a page, the DBMS copies the original page to a
separate journal file before overwriting master version.Called "rollback mode".  
After restarting, if a journal file exists, then the DBMS restores it to undo changes from uncommitted txns.

## 5. Write-Ahead Log
Maintain a log file separate from data files that contains the changes that txns make to database.
* Assume that the log is on stable storage.
* Log contains enough information to perform the necessary undo and redo actions to restore the database.  
DBMS must write to disk the log file records that correspond to changes made to a database object before it can flush that object to disk.  

**Buffer Pool Policy**: STEAL + NO-FORCE

***Protocol***:  
* The DBMS stages all a txn's log records in volatile storage (usually backed by buffer pool).  
* All log records pertaining to an updated page are written to non-volatile storage before the page itself is over-written in non-volatile storage.
* A txn is not considered committed until all its log records have been written to stable storage.

***Detail***: 
* Write a $<BEGIN>$ record to the log for each txn to mark its starting point.
* When a txn finishes, the DBMS will:
    *  Write a $<COMMIT>$ record on the log
    * Make sure that all log records are flushed before it returns an acknowledgement to application.
* Each log entry contains information about the change to a single object:  
    * Transaction Id
    * Object Id
    * Before Value (UNDO)
    * After Value (REDO)

***Implement***:   
* Flushing the log buffer to disk every time a txn commits will become a bottleneck.
* The DBMS can use the group commit optimization to batch multiple log flushes together to amortize overhead.  
  * When the buffer is full, flush it to disk.
  * Or if there is a timeout (e.g., 5 ms).

## 6. Log Scheme
**Physical Logging**
* Record the byte-level changes made to a specific page.
* Example: git diff  
  
**Logical Logging**
* Record the high-level operations executed by txns.
* Example: UPDATE, DELETE, and INSERT queries.  
  
**Physiological Logging**
* Hybrid approach with byte-level changes for a single tuple identified by page id + slot number.
* Does not specify organization of the page.

***Physical VS Logical Logging***  
* Logical logging requires less data written in each log record than physical logging.
* Difficult to implement recovery with logical logging if you have concurrent txns running at lower isolation levels.  
  * Hard to determine which parts of the database may have been modified by a query before crash.
  * Also takes longer to recover because you must re-execute
every txn all over again.

## 7. Log-Structured Systems
Log-structured DBMSs do not have dirty pages.
* Any page retrieved from disk is immutable.  

The DBMS buffers log records in in-memory
pages (MemTable). If this buffer is full, it must be flushed to disk. But it may contain changes uncommitted txns.

These DBMSs still maintain a separate WAL to
recreate the MemTable on crash.

## 8. Checkpoint
The WAL will grow forever.  
 After a crash, the DBMS must replay the entire log, which will take a long time.  
The DBMS periodically takes a checkpoint where it flushes all buffers out to disk.
* This provides a hint on how far back it needs to replay
the WAL after a crash.

***Protocal***:   
* Pause all queries.
* Flush all WAL records in memory to disk.
* Flush all modified pages in the buffer pool to disk.
* Write a <CHECKPOINT> entry to WAL and flush to disk.
* Resume queries.

**Recovery**:
* In the redo phase, the system replays updates of all transactions by scanning the log forward from the last checkpoint.
  *  The list of transactions to be rolled back, undo-list, is initially set to the list L in the $<checkpoint \ L>$ log record.
  *  Whenever a normal log record of the form $<T_i, X_j, V_1, V_2>$, or a redo-only log record of the form $<T_i, X_j, V_2>$ is encountered, the operation is redone; that is, the value $V_2$ is written to data item $X_j$.
  *  Whenever a log record of the form $<T_i \ start>$ is found, $T_i$ is added to undo-list.
  * Whenever a log record of the form $<T_i \ abort>$ or $<T_i \ commit>$ is found, $T_i$ is removed from undo-list.
* In the undo phase, the system rolls back all transactions in the undo-list. It performs rollback by scanning the log backward from the end.
  * Whenever it finds a log record belonging to a transaction in the undo-list, it performs undo actions just as if the log record had been found during the rollback of a failed transaction.
  *  When the system finds a $<T_i \ start>$ log record for a transaction $T_i$ in undolist, it writes a $<T_i \ abort>$ log record to the log and removes $T_i$ from undolist.
   *  The undo phase terminates once undo-list becomes empty, that is, the system has found $<T_i \ start>$ log records for all transactions that were initially in undo-list.

After the undo phase of recovery terminates, normal transaction processing can resume.

**DrawBacks**:  
* requires that all updates to the database be temporarily suspended while the checkpoint is in progress.
* the DBMS must stall txns when it takes a checkpoint to ensure a consistent snapshot.
* Scanning the log to find uncommitted txns can take a long time.






