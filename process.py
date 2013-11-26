#!/usr/local/bin/python
# -*- coding: utf-8 -*-

import sys
# from pylab import imread,imshow,figure,show,subplot
from numpy import reshape,uint8,array#,zeros
from scipy.cluster.vq import kmeans,vq
# import cv
import cv2
import cv2.cv as cv
import pymeanshift as pms
import resize
from collections import Counter
import colorset as cs

resize_w = 720
resize_h = 720
face_ratio = 0.4

cascade_fn='haarcascade_frontalface_alt2.xml'

if len(sys.argv) is 1:
  print sys.argv[0], "src trg [width height face_ratio]"
  exit(-1)
elif len(sys.argv) is 3:
  src = sys.argv[1]
  trg = sys.argv[2]
elif len(sys.argv) is 5:
  src = sys.argv[1]
  trg = sys.argv[2]
  resize_w = int(sys.argv[3])
  resize_h = int(sys.argv[4])
elif len(sys.argv) is 6:
  src = sys.argv[1]
  trg = sys.argv[2]
  resize_w = int(sys.argv[3])
  resize_h = int(sys.argv[4])
  face_ratio = float(sys.argv[5])

# img = imread(src)
img = cv2.imread(src)

# face detect
# print img.shape
img_h, img_w, _ = img.shape
min_size=0
if img_w > img_h:
  min_size = img_h/3
else:
  min_size = img_w/3
# print min_size

gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# print gray_img.shape
cascade_fn='/usr/local/opt/opencv/share/OpenCV/haarcascades/haarcascade_frontalface_alt2.xml'
cascade = cv2.CascadeClassifier(cascade_fn)
rects = cascade.detectMultiScale(gray_img, scaleFactor=1.01, minNeighbors=4, minSize=(min_size, min_size), flags=cv.CV_HAAR_SCALE_IMAGE)
# print len(rects)
if len(rects) > 0:
  face = rects[len(rects)-1]

  # print img.shape, face

  r_img, r_face = resize.resize(img, face, resize_w, resize_h, face_ratio)

  # print r_img.shape, r_face

  face_x, face_y, face_w, face_h = r_face

  # cv2.rectangle(r_img, (face_x,face_y), (face_x+face_w,face_y+face_h), (255,0,0),2)


  # meanshift
  (segmented_img, labels_img, number_regions) = pms.segment(r_img, spatial_radius=9, range_radius=4.5, min_density=20)

  # kmeans
  pixels = reshape(segmented_img, (r_img.shape[0]*r_img.shape[1], r_img.shape[2]))
  centroids, _ = kmeans(pixels, 4) # four colors will be found
  qnt, _ = vq(pixels, centroids)
  centers_idx = reshape(qnt, (r_img.shape[0], r_img.shape[1]))
  # clustered_img = centroids[centers_idx]

  # set color face region
  colors = array(cs.get())
  # print colors

  m_w = int(face_w * 0.1)
  m_h = int(face_h * 0.1)

  faces_idx = centers_idx[face_y:face_y+face_h-m_h*2,face_x+m_w:face_x+face_w-m_w]
  r_faces_idx = reshape(faces_idx, faces_idx.shape[0]*faces_idx.shape[1])
  cnt = Counter(r_faces_idx).most_common()

  c_list = [0, 1, 2, 3]
  i=0
  for idx in cnt:
    c_list.remove(idx[0]);
    centroids[idx[0]] = colors[i]
    i+=1
  for idx in c_list:
    print idx, i, color[i]
    centroids[idx] = color[i]
    i+=1

  color_img = centroids[centers_idx]

  cv2.imwrite(trg, color_img)


  # n_img = zeros((face_h-m_h*2, face_w-m_w*2, 3), dtype=uint8)

  # n_img[:,:,0] = centers_idx[face_y:face_y+face_h-m_h*2,face_x+m_w:face_x+face_w-m_w] * 80
  # n_img[:,:,1] = centers_idx[face_y:face_y+face_h-m_h*2,face_x+m_w:face_x+face_w-m_w] * 80
  # n_img[:,:,2] = centers_idx[face_y:face_y+face_h-m_h*2,face_x+m_w:face_x+face_w-m_w] * 80
  # print centers_idx
  # clustered_img = centroids[centers_idx]


  # cv2.rectangle(clustered_img, (face_x,face_y), (face_x+face_w,face_y+face_h), (255,0,0),2)

  # r_img[:,:,1:] = 0
  # figure(1)
  # subplot(131)
  # imshow(img)
  # subplot(132)
  # imshow(clustered_img)
  # subplot(133)
  # imshow(n_img)
  # show()

else:
  print "No face detection."
  exit(-1)