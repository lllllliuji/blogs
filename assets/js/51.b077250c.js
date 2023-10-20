(window.webpackJsonp=window.webpackJsonp||[]).push([[51],{473:function(e,t,a){"use strict";a.r(t);var s=a(2),n=Object(s.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("p",[e._v("creating an index of all of the content\nanalyzing the link structure of the entire web to identify the most important pages or the most authoritative pages\nrun giant computation on giant data on thousand computers\nhire skilled distributed system experts is a good one.\nmapreduce is a frame that allows normal program to write distributed program easy\ndon't need to worry how to spread the work over the thousands of computer and how to organize data movement and how to cope with the inevitable failures and load balance.\njust write a simple map function and a simple reduce function")]),e._v(" "),t("p",[e._v("input, split up to a whole bunch of different file or chunks cater to GFS(split file to fixed size)\neach input file run map function output a list of k, v pairs(intermediate output)\nevery key runs a reduce function")]),e._v(" "),t("div",{staticClass:"language- line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("Map(k, v):\n  split v into words\n  for each word in words:\n    emit(word, 1)\nthis map function doesn't know any thing about distribution or multiple computer\n\nReduce(k, v):\n  emit(len(v))\n")])]),e._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[e._v("1")]),t("br"),t("span",{staticClass:"line-number"},[e._v("2")]),t("br"),t("span",{staticClass:"line-number"},[e._v("3")]),t("br"),t("span",{staticClass:"line-number"},[e._v("4")]),t("br"),t("span",{staticClass:"line-number"},[e._v("5")]),t("br"),t("span",{staticClass:"line-number"},[e._v("6")]),t("br"),t("span",{staticClass:"line-number"},[e._v("7")]),t("br"),t("span",{staticClass:"line-number"},[e._v("8")]),t("br")])]),t("p",[e._v("output file need network file system\nrun gfs server and map reduce server on same machine due to network communication")]),e._v(" "),t("p",[e._v("where does the input file live ?\nwhere does the output file live ?\nGFS runs on the same set of workers that run MapReduce, naturely split data into fixed size chunk\nso the input can get tremendous\nbut 10TB data transport over network is very slow, so the mapreduce worker runs on the same set machines that run gfs")]),e._v(" "),t("h1",{attrs:{id:"implement"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#implement"}},[e._v("#")]),e._v(" Implement")]),e._v(" "),t("p",[e._v("Users specify a map function that processes a key/value pair to generate a set of intermediate key/value pairs, and a reduce function that merges all intermediate values associated with the same intermediate key")]),e._v(" "),t("p",[e._v("Programs written in this functional style are automatically parallelized and executed on a large cluster of commodity machines. The run-time system takes care of the\ndetails of partitioning the input data, scheduling the program’s execution across a set of machines, handling machine failures, and managing the required inter-machine\ncommunication.\nThis allows programmers without any experience with parallel and distributed systems to easily utilize the resources of a large distributed system")]),e._v(" "),t("p",[e._v("how to parallelize the computation, distribute the data, and handle\nfailures")]),e._v(" "),t("p",[e._v("map (k1,v1) → list(k2,v2)\nreduce (k2,list(v2)) → list(v2)\nreduce worker need to shuffle the values with the same key, MapReduce paper use sort to get the same intermediate key.")]),e._v(" "),t("p",[e._v("The master keeps several data structures. For each map\ntask and reduce task, it stores the state (idle, in-progress,\nor completed), and the identity of the worker machine\n(for non-idle tasks).")]),e._v(" "),t("p",[e._v("for each completed map task,\nthe master stores the locations and sizes of the R intermediate file regions produced by the map task."),t("br"),e._v("\nThe information is pushed incrementally to workers that have in-progress reduce tasks.")]),e._v(" "),t("h1",{attrs:{id:"fault-tolerance"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#fault-tolerance"}},[e._v("#")]),e._v(" Fault tolerance")]),e._v(" "),t("h2",{attrs:{id:"worker-failure"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#worker-failure"}},[e._v("#")]),e._v(" worker failure")]),e._v(" "),t("p",[e._v("The master pings every worker periodically. If no response is received from a worker in a certain amount of\ntime, the master marks the worker as failed.")]),e._v(" "),t("p",[e._v("use re-execution as the primary mechanism for fault tolerance, wait 10 second, reissure a task to another")]),e._v(" "),t("h2",{attrs:{id:"master-failure"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#master-failure"}},[e._v("#")]),e._v(" master failure")]),e._v(" "),t("ol",[t("li",[e._v("checkpoint, a new copy restart from last checkpointed state.")]),e._v(" "),t("li",[e._v("abort the computation.")])]),e._v(" "),t("h1",{attrs:{id:"locality"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#locality"}},[e._v("#")]),e._v(" Locality")]),e._v(" "),t("p",[e._v("bandwidth is relative scarce resource.")]),e._v(" "),t("p",[e._v("The MapReduce master takes the location information of the\ninput files into account and attempts to schedule a map\ntask on a machine that contains a replica of the corresponding input data. Failing that, it attempts to schedule\na map task near a replica of that task’s input data")]),e._v(" "),t("h1",{attrs:{id:"backup-task"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#backup-task"}},[e._v("#")]),e._v(" backup task")]),e._v(" "),t("p",[e._v("When a MapReduce operation is close\nto completion, the master schedules backup executions\nof the remaining in-progress tasks. The task is marked\nas completed whenever either the primary or the backup\nexecution completes.")]),e._v(" "),t("h1",{attrs:{id:"refinement"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#refinement"}},[e._v("#")]),e._v(" Refinement")]),e._v(" "),t("ol",[t("li",[e._v("use hash function to partition R reduce task")]),e._v(" "),t("li",[e._v("well-designed hash function is encourage")]),e._v(" "),t("li",[e._v("combiner function to does partial merging of this data before it is sent to net work")]),e._v(" "),t("li",[e._v("side effect,provide support for atomic two-phase commits of multiple output files produced by a single task")]),e._v(" "),t("li",[e._v("Skipping Bad Records. When the master has seen more than one failure on\na particular record, it indicates that the record should be\nskipped when it issues the next re-execution of the corresponding Map or Reduce task.")])])])}),[],!1,null,null,null);t.default=n.exports}}]);