import cv2
import cv2.cv as cv
import numpy as np

def blend(src, blah, p_x, p_y):
  for y in range(blah.shape[0]):
    for x in range(blah.shape[1]):
      alpha = blah[y,x,3]/255.0;
      if alpha == 1.0:
        src[y+p_y,x+p_x] = blah[y,x,:3]
      elif alpha > 0.0:
        src[y+p_y,x+p_x] = src[y+p_y,x+p_x]*np.array([1-alpha, 1-alpha, 1-alpha]) + blah[y,x,:3]*np.array([alpha, alpha, alpha])

  return src

# blah = cv2.imread("blah1.png", cv.CV_LOAD_IMAGE_UNCHANGED)

# img = cv2.imread("download/12.jpg")

# blah = cv2.resize(blah, (50, 50))

# cv2.imshow('dfdf', merge(img, blah, 100, 100))

# cv2.waitKey()