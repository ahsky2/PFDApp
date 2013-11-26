import cv2

def resize(img, face, w, h, ratio):
  # print img.shape, face, w, h, ratio
  img_h, img_w, _ = img.shape
  # print img_h, img_w
  face_x, face_y, face_w, face_h = face

  if (w > img_w) | (h > img_h):
    print "source image size is too small"
    return img, face

  if (w*ratio > face_w) & (h*ratio > face_h):
    n_x = face_x - int((w-face_w)/2.0)
    if n_x < 0:
      n_x = 0
    elif n_x + w > img_w:
      n_x = img_w - w

    n_y = face_y - int((h - face_h)/2.0)
    if n_y < 0:
      n_y = 0
    elif n_y + h > img_h:
      n_y = img_h - h

    r_img = img[n_y:n_y+h,n_x:n_x+w,:]
    face_x = face_x - n_x
    face_y = face_y - n_y
    r_face = [face_x, face_y, face_w, face_h]
  else:
    s_w = face_w / (w*ratio)
    s_h = face_h / (w*ratio)
    if s_w > s_h:
      scale = s_w
    else:
      scale = s_h

    n_w = int(w*scale)
    n_h = int(h*scale)

    if (n_w > img_w) | (n_h > img_h):
      s_w = img_w / w
      s_h = img_h / h
      if s_w < s_h:
        scale = s_w
      else:
        scale = s_h

    n_w = int(w*scale)
    n_h = int(h*scale)
    if (n_w < face_w) | (n_h < face_h):
      print "fail to resize"
      return img, face

    # print "scale(%f) down." % scale

    n_x = face_x - int((w*scale - face_w)/2.0)
    if n_x < 0:
      n_x = 0
    elif n_x + int(w*scale) > img_w:
      n_x = img_w - int(w*scale)

    n_y = face_y - int((w*scale - face_h)/2.0)
    if n_y < 0:
      n_y = 0
    elif n_y + int(h*scale) > img_h:
      n_y = img_w - int(h*scale)

    r_img = img[n_y:n_y+int(h*scale),n_x:n_x+int(w*scale),:]
    # print "crop image(w,h) : %d, %d" % (r_img.shape[1], r_img.shape[0])

    r_img = cv2.resize(r_img, (w,h))
    face_x = int((face_x - n_x)/scale)
    face_y = int((face_y - n_y)/scale)
    face_w = int(face_w/scale)
    face_h = int(face_h/scale)
    r_face = [face_x, face_y, face_w, face_h]

  # print r_img.shape, r_face
  return r_img, r_face
