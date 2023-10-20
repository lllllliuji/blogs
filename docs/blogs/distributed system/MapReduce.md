---
title: MapReduce
date: 2023-05-20
categories:
  - distributed system
  - distributed computation
tags:
  - distributed computation
  - 6.824
---
creating an index of all of the content
analyzing the link structure of the entire web to identify the most important pages or the most authoritative pages
run giant computation on giant data on thousand computers
hire skilled distributed system experts is a good one.
mapreduce is a frame that allows normal program to write distributed program easy
don't need to worry how to spread the work over the thousands of computer and how to organize data movement and how to cope with the inevitable failures and load balance.
just write a simple map function and a simple reduce function

input, split up to a whole bunch of different file or chunks cater to GFS(split file to fixed size)
each input file run map function output a list of k, v pairs(intermediate output)
every key runs a reduce function
```
Map(k, v):
  split v into words
  for each word in words:
    emit(word, 1)
this map function doesn't know any thing about distribution or multiple computer

Reduce(k, v):
  emit(len(v))
```

output file need network file system
run gfs server and map reduce server on same machine due to network communication

where does the input file live ?
where does the output file live ?
GFS runs on the same set of workers that run MapReduce, naturely split data into fixed size chunk
so the input can get tremendous
but 10TB data transport over network is very slow, so the mapreduce worker runs on the same set machines that run gfs


# Implement
Users specify a map function that processes a key/value pair to generate a set of intermediate key/value pairs, and a reduce function that merges all intermediate values associated with the same intermediate key  

Programs written in this functional style are automatically parallelized and executed on a large cluster of commodity machines. The run-time system takes care of the
details of partitioning the input data, scheduling the program’s execution across a set of machines, handling machine failures, and managing the required inter-machine
communication.
This allows programmers without any experience with parallel and distributed systems to easily utilize the resources of a large distributed system  

how to parallelize the computation, distribute the data, and handle
failures

map (k1,v1) → list(k2,v2)
reduce (k2,list(v2)) → list(v2) 
reduce worker need to shuffle the values with the same key, MapReduce paper use sort to get the same intermediate key.

The master keeps several data structures. For each map
task and reduce task, it stores the state (idle, in-progress,
or completed), and the identity of the worker machine
(for non-idle tasks).  


for each completed map task,
the master stores the locations and sizes of the R intermediate file regions produced by the map task.  
The information is pushed incrementally to workers that have in-progress reduce tasks.



# Fault tolerance
## worker failure
The master pings every worker periodically. If no response is received from a worker in a certain amount of
time, the master marks the worker as failed.

use re-execution as the primary mechanism for fault tolerance, wait 10 second, reissure a task to another 
## master failure
1. checkpoint, a new copy restart from last checkpointed state.
2. abort the computation.

# Locality
bandwidth is relative scarce resource. 

 The MapReduce master takes the location information of the
input files into account and attempts to schedule a map
task on a machine that contains a replica of the corresponding input data. Failing that, it attempts to schedule
a map task near a replica of that task’s input data

# backup task
When a MapReduce operation is close
to completion, the master schedules backup executions
of the remaining in-progress tasks. The task is marked
as completed whenever either the primary or the backup
execution completes. 

# Refinement
1. use hash function to partition R reduce task
2. well-designed hash function is encourage
3. combiner function to does partial merging of this data before it is sent to net work
4. side effect,provide support for atomic two-phase commits of multiple output files produced by a single task
5. Skipping Bad Records. When the master has seen more than one failure on
a particular record, it indicates that the record should be
skipped when it issues the next re-execution of the corresponding Map or Reduce task.