---
title: Resilient Distributed Datasets, A Fault-Tolerant Abstraction for In-Memory Cluster Computing
categories:
  - distributed system
tags:
  - distributed computation
  - 6.824
---
A successor to Map Reduce.  
It generalizes the kind of two stages of MapReduce into a complete notion of multi-step data flow graph. This is flexibility for the programmer, it's more expressive and it gives the system a lot more to chew on when it comes to optimization and dealing with failures.  


PageRank is a algorithm that Google uses for caculating how important different web search result are. 
```scala
  val lines = spark.read.textFile("in").rdd
  val links1 = lines.map(s => 
    val parts = s.split("\\s+")
    (parts[0], parts[1])
  )
  val links2 = links1.distinct()
  val links3 = links2.groupByKey()
  val links4 = links3.cache()
  val ranks = links4.mapValues(v => 1.0)

  for (i <- 1 to 10) {
    val jj = links4.join(ranks)
    val contribs = jj.values.flatMap(
      case(urls, rank) => 
        url.map(url => (url, rank / url.size))
    )
    ranks = contribs.reduceByKey(_ + _).mapValues(0.15 + 0.85 * _)
  }
  val output = ranks.collect()
  output.foreach(tup => println(s"${tup._1} hash rank: ${tup._2}."))
  /*
    in: 
      u1 u3
      u1 u1
      u2 u3
      u2 u2
      u3 u1
  */
```
 
Until the final collect, what this code is doing is generating a lineage graph and not processing the data.
![](../../.vuepress/public/spark/figure1.png#pic_center)
![](../../.vuepress/public/spark/figure2.png#pic_center)