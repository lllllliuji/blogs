---
title: computer archtecture introduction
date: 2024-11-21
categories:
  - arch
tags:
  - computer architecture
  - cs 152
---

In its broadest definition, computer architecture is the design of
the abstraction layers that allow us to implement information
processing applications efficiently using available manufacturing
technologies.  

# 体系结构设计
Technology and Applications shape Computer Architecture

## Upheaval in Computer Design
*  Most of last 50 years, Moore's Law ruled
   * Technology scaling allowed continual performance/energy
improvements without changing software model
*  Last decade, technology scaling slowed/stopped
   * Dennard (voltage) scaling over (supply voltage ~fixed)
   * Moore's Law (cost/transistor) over?
   *  No competitive replacement for CMOS anytime soon
   * Energy efficiency constrains everything
* No “free lunch” for software developers, must consider:
  * Parallel systems
  * Heterogeneous systems

# 主要的市场  
1. Mobile(smartphone/tablet)
   * >1 billion sold/year
   * Market dominated by ARM-ISA-compatible general-purpose processor in
system-on-a-chip (SoC)
   * Plus sea of custom accelerators (radio, image, video, graphics, audio,
motion, location, security, etc.)
2. Warehouse-Scale computer
    * 100,000's cores per warehouse
    * Market dominated by x86-compatible server chips
    * Dedicated apps, plus cloud hosting of virtual machines
    * Now seeing increasing
3. Embedding computing
    * Wired/wireless network infrastructure, printers
    * Consumer TV/Music/Games/Automotive/Camera/MP3
    * Internet of Things!


# 新的垂直半导体业务模型  
Instead of buying chip company's standard product, chip
customers build own differentiated designs:
*  Apple, Samsung, Qualcomm, Huawei for phones
*  Google, Amazon, Alibaba, Microsoft, for client/cloud
* Tesla, Cruize for car
* IoT products, FitBit, Apple for wearables
* End-system value/profit justifies cost of chip design
* can be >>$100M engineering cost to develop a new advanced chip!

# RISC-V is class ISA
* RISC-V is a new free, simple, clean, extensible ISA we
developed at Berkeley for education
(61C/151/251A/152/252A) and research
(ParLab/ASPIRE/ADEPT/SLICE)
  *  RISC-I/II, first Berkeley RISC implementations
  * Berkeley research machines SOAR/SPUR considered RISC-III/IV
* Both of the dominant ISAs (x86 and ARM) are too
complex to use for teaching or research
* RISC-V has taken off commercially
* RISC-V Foundation manages standard riscv.org
* Now upstream support for many tools (gcc, Linux,
FreeBSD, …)
* Nvidia is using RISC-V in all future GPUs
* Western Digital is using RISC-V in all future products
* Samsung, Qualcomm, Google, many others using RISC-V


# Chisel simulators
* Chisel is a new hardware description language we
developed at Berkeley based on Scala
  * Constructing Hardware in a Scala Embedded Language
* Labs will use RISC-V processor simulators derived from
Chisel processor designs
  *  Gives you much more detailed information than other simulators
  * Can map to FPGA or real chip layout
* You need to learn some minimal Chisel in CS152, but we'll
make Chisel RTL source available so you can see all the
details of our processors
* Can do lab projects based on modifying the Chisel RTL
code if desired
* This year, we'll be using Chipyard infrastructure for labs:
  * https://chipyard.readthedocs.io/en/latest/

# Chisel Design Flow
common steps:   
* chisel design description -> chisel complier -> verilog    

two different following steps: 
* fpga tools -> fpga emulation  
* asic tools -> gds layout

# Five great ideas
1. Abstraction(Layers of Representation/Interpretation)
2. Moore's Law (Designing through trends)
3. Principle of Locality (Memory Hierarchy)
4. Parallelism & Amdahl's law (which limits it)
5. Dependability via Redundancy

