---
title: cnn
date: 2024-11-10
categories:
  - deep learning
tags:
  - python
---
利用相邻像素之间的关联性，网络就能够更好地理解图像的内容，得到更有效的模型。这种先验知识就是卷积神经网络（CNN）提出的基础之一。

利用先验知识，减少模型的复杂度，更好地训练。

$$
\begin{aligned}
 \left[\mathbf{H}\right]_{i, j} &= [\mathbf{U}]_{i, j} + \sum_k \sum_l[\mathsf{W}]_{i, j, k, l}  [\mathbf{X}]_{k, l}\\ 
&=  [\mathbf{U}]_{i, j} +\sum_a \sum_b [\mathsf{V}]_{i, j, a, b}  [\mathbf{X}]_{i+a, j+b}.
\end{aligned}
$$



利用平移不变性和局部性完成mlp至cnn的数学推导。  
利用平移不变性
$$
[\mathbf{H}]_{i, j} = u + \sum_a\sum_b [\mathbf{V}]_{a, b} [\mathbf{X}]_{i+a, j+b}.
$$
利用局部性  
$$
[\mathbf{H}]_{i, j} = u + \sum_{a = -\Delta}^{\Delta} \sum_{b = -\Delta}^{\Delta} [\mathbf{V}]_{a, b}  [\mathbf{X}]_{i+a, j+b}.
$$
不同channel之间不共享参数。


考虑通道  
$$
[\mathsf{H}]_{i,j,d} = \sum_{a = -\Delta}^{\Delta} \sum_{b = -\Delta}^{\Delta} \sum_c [\mathsf{V}]_{a, b, c, d} [\mathsf{X}]_{i+a, j+b, c},
$$
可以把隐藏表示想象为一系列具有二维张量的通道（channel）。 这些通道有时也被称为特征映射（feature maps），因为每个通道都向后续层提供一组空间化的学习特征。 直观上可以想象在靠近输入的底层，一些通道专门识别边缘，而一些通道专门识别纹理。


[卷积]( 
https://www.zhihu.com/question/22298352/answer/228543288)

* 图像的平移不变性使我们以相同的方式处理局部图像，而不在乎它的位置。
* 局部性意味着计算相应的隐藏表示只需一小部分局部图像像素。
* 在图像处理中，卷积层通常比全连接层需要更少的参数，但依旧获得高效用的模型。
* 卷积神经网络（CNN）是一类特殊的神经网络，它可以包含多个卷积层。
* 多个输入和输出通道使模型在每个空间位置可以获取图像的多方面特征。


互相关运算。

学习卷积核。卷积核是学习得来的，互相关运算和卷积的结果相同。  

 在卷积神经网络中，对于某一层的任意元素
，其感受野（receptive field）是指在前向传播期间可能影响
计算的所有元素（来自所有先前层）。


经过多层卷积神经网络之后，输出维度减少，会丢失很多边界信息。**填充**可以解决这个问题。  


有时，我们可能希望大幅降低图像的宽度和高度。例如，如果我们发现原始的输入分辨率十分冗余。**步幅**则可以在这类情况下提供帮助。

