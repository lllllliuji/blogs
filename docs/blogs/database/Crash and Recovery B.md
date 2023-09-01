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

* Uses a log sequence number(LSN) to identify log records and store LSNs in database pages to identify which operations have been appllied to a database page.
* Supports physiologial redo operations, which are physical in that the affected page is physically identified but can be logical within the page.
* Uses a dirty page table to minimize unnecessary redos during recovery. As mentioned earlier, dirty pages are those that have been updated in memory, and the disk version is not up-to-date.
* Uses a fuzzy-checkpointing scheme that records only information about dirty page and associated information and does not even require writing of dirty pages to disk. It flushes dirty pages in background, continuously, instead of writing them during checkpoints. 

## 3. Data Structures
Each log record in ARIES has a log sequence number (LSN) that uniquely identifies
the record. The number is conceptually just a logical identifier whose value is greater for log records that occur later in the log. In practice, the LSN is generated in such a way that it can also be used to locate the log record on disk. Typically, ARIES splits a log into multiple log files, each of which has a file number. When a log file grows to some limit, ARIES appends further log records to a new log file; the new log file has a file number that is higher by 1 than the previous log file. The LSN then consists of a file number and an offset within the file.  

Each page also maintains an identifier called the PageLSN. Whenever an update
operation (whether physical or physiological) occurs on a page, the operation stores
the LSN of its log record in the PageLSN field of the page. During the redo phase of
recovery, any log records with LSN less than or equal to the PageLSN of a page should
not be executed on the page, since their actions are already reflected on the page. In combination with a scheme for recording PageLSNs as part of checkpointing, which we present later, ARIES can avoid even reading many pages for which logged operations
are already reflected on disk. Thereby, recovery time is reduced significantly.  

The PageLSN is essential for ensuring idempotence in the presence of physiological
redo operations, since reapplying a physiological redo that has already been applied toa page could cause incorrect changes to a page.  

Pages should not be flushed to disk while an update is in progress, since physiological operations cannot be redone on the partially updated state of the page on disk. Therefore, ARIES uses latches on buffer pages to prevent them from being written to disk while they are being updated. It releases the buffer page latch only after the update is completed and the log record for the update has been written to the log.

Each log record also contains the LSN of the previous log record of the same transaction. This value, stored in the PrevLSN field, permits log records of a transaction to
be fetched backward, without reading the whole log. There are special redo-only log
records generated during transaction rollback, called compensation log records (CLRs)
in ARIES. These serve the same purpose as the redo-only log records in our earlier recovery scheme. In addition, CLRs serve the role of the operation-abort log records in
our scheme. The CLRs have an extra field, called the UndoNextLSN, that records the
LSN of the log that needs to be undone next, when the transaction is being rolled back.This field serves the same purpose as the operation identifier in the operation-abort
log record in our earlier recovery scheme, which helps to skip over log records that
have already been rolled back.  

The DirtyPageTable contains a list of pages that have been updated in the database
buffer. For each page, it stores the PageLSN and a field called the RecLSN, which helps
identify log records that have been applied already to the version of the page on disk.
When a page is inserted into the DirtyPageTable (when it is first modified in the buffer
pool), the value of RecLSN is set to the current end of log. Whenever the page is flushed
to disk, the page is removed from the DirtyPageTable.

A checkpoint log record contains the DirtyPageTable and a list of active transactions. For each transaction, the checkpoint log record also notes LastLSN, the LSN of
the last log record written by the transaction. A fixed position on disk also notes the
LSN of the last (complete) checkpoint log record.

## 4. Recovery algorithm
ARIES recovers from a system crash in three passes.    
  • Analysis pass: This pass determines which transactions to undo, which pages were
dirty at the time of the crash, and the LSN from which the redo pass should start.  
  • Redo pass: This pass starts from a position determined during analysis and performs a redo, repeating history, to bring the database to a state it was in before the
crash.  
  • Undo pass: This pass rolls back all transactions that were incomplete at the timeof crash.
#### 4.1 Analysis Pass
The analysis pass finds the last complete checkpoint log record and reads in the DirtyPageTable from this record. It then sets RedoLSN to the minimum of the RecLSNs of the pages in the DirtyPageTable. If there are no dirty pages, it sets RedoLSN to the LSN of the checkpoint log record. The redo pass starts its scan of the log from RedoLSN. All
the log records earlier than this point have already been applied to the database pages on disk. The analysis pass initially sets the list of transactions to be undone, undo-list, to the list of transactions in the checkpoint log record. The analysis pass also reads
from the checkpoint log record the LSNs of the last log record for each transaction in
undo-list.  

The analysis pass continues scanning forward from the checkpoint. Whenever it
finds a log record for a transaction not in the undo-list, it adds the transaction to undolist. Whenever it finds a transaction end log record, it deletes the transaction from
undo-list. All transactions left in undo-list at the end of analysis have to be rolled back
later, in the undo pass. The analysis pass also keeps track of the last record of each
transaction in undo-list, which is used in the undo pass.

The analysis pass also updates DirtyPageTable whenever it finds a log record for
an update on a page. If the page is not in DirtyPageTable, the analysis pass adds it to
DirtyPageTable and sets the RecLSN of the page to the LSN of the log record.

### 4.2 Redo pass
The redo pass repeats history by replaying every action that is not already reflected in
the page on disk. The redo pass scans the log forward from RedoLSN. Whenever it
finds an update log record, it takes this action:    
  * If the page is not in DirtyPageTable or if the LSN of the update log record is less
than the RecLSN of the page in DirtyPageTable, then the redo pass skips the log
record.  
  * Otherwise the redo pass fetches the page from disk, and if the PageLSN is less than
the LSN of the log record, it redoes the log record.


Note that if either of the tests is negative, then the effects of the log record have
already appeared on the page; otherwise the effects of the log record are not reflected on
the page. Since ARIES allows non-idempotent physiological log records, a log record
should not be redone if its effect is already reflected on the page. If the first test is
negative, it is not even necessary to fetch the page from disk to check its PageLSN.

### 4.3 Undo pass and Transaction Rollback
The undo pass is relatively straightforward. It performs a single backward scan of the
log, undoing all transactions in undo-list. The undo pass examines only log records of
transactions in undo-list; the last LSN recorded during the analysis pass is used to find
the last log record for each transaction in undo-list.

Whenever an update log record is found, it is used to perform an undo (whether
for transaction rollback during normal processing, or during the restart undo pass).
The undo pass generates a CLR containing the undo action performed (which must
be physiological). It sets the UndoNextLSN of the CLR to the PrevLSN value of the
update log record.

If a CLR is found, its UndoNextLSN value indicates the LSN of the next log record
to be undone for that transaction; later log records for that transaction have already
been rolled back. For log records other than CLRs, the PrevLSN field of the log record
indicates the LSN of the next log record to be undone for that transaction. The next
log record to be processed at each stop in the undo pass is the maximum, across all
transactions in undo-list, of next log record LSN.

### 4.4 Other features
Among other key features that ARIES provides are:
*  Nested top actions: ARIES allows the logging of operations that should not be undone even if a transaction gets rolled back; for example, if a transaction allocates a
page to a relation, even if the transaction is rolled back, the page allocation should
not be undone since other transactions may have stored records in the page. Such
operations that should not be undone are called nested top actions. Such operations can be modeled as operations whose undo action does nothing. In ARIES,
such operations are implemented by creating a dummy CLR whose UndoNextLSN
is set such that transaction rollback skips the log records generated by the operation.
*  Recovery independence: Some pages can be recovered independently from others
so that they can be used even while other pages are being recovered. If some pagesof a disk fail, they can be recovered without stopping transaction processing on
other pages.
* Savepoints: Transactions can record savepoints and can be rolled back partially up
to a savepoint. This can be quite useful for deadlock handling, since transactions
can be rolled back up to a point that permits release of required locks and then
restarted from that point.
Programmers can also use savepoints to undo a transaction partially, and then
continue execution; this approach can be useful to handle certain kinds of errors
detected during the transaction execution.
* Fine-grained locking: The ARIES recovery algorithm can be used with index
concurrency-control algorithms that permit tuple-level locking on indices, instead
of page-level locking, which improves concurrency significantly.
* Recovery optimizations: The DirtyPageTable can be used to prefetch pages during
redo, instead of fetching a page only when the system finds a log record to be
applied to the page. Out-of-order redo is also possible: Redo can be postponed on a
page being fetched from disk and performed when the page is fetched. Meanwhile,
other log records can continue to be processed.  


In summary, the ARIES algorithm is a state-of-the-art recovery algorithm, incorporating a variety of optimizations designed to improve concurrency, reduce logging
overhead, and reduce recovery time.
