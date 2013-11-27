from random import randint

color_sets = [
  ['#FFF9DC', '#FB006D', '#FEDA0A', '#0D6AD5'],
  ['#FFEDD5', '#FB0022', '#F3FF0B', '#1293FF'],
  ['#FFECD3', '#41CC37', '#F1190D', '#1883FE'],
  ['#FFF8E0', '#1A1A1A', '#FA005F', '#FDFF26'],
  ['#FEE0E6', '#30C627', '#FB0008', '#FFFF0A'],
  ['#FFFFFF', '#FB0006', '#128DAA', '#47E996'],
  ['#E2A081', '#1295FF', '#FEF917', '#249016'],
  ['#FFF3DC', '#FEF70B', '#1C9CF2', '#FB0063'],
  ['#FEE7CF', '#DD0050', '#1FB029', '#FCFF09'],
  ['#F29C96', '#FB4C07', '#4B872E', '#FDDF09'],
  ['#E6AF61', '#FB1708', '#EEE040', '#2B96D5'],
  ['#FFFFFF', '#FB001B', '#1DAE29', '#1165B8'],
  ['#FFFFC6', '#E0004A', '#FDDD10', '#23B40E'],
  ['#F8FFE3', '#F8FFE3', '#45D2DC', '#FB007A'],
  ['#FEF9EC', '#FB0015', '#269012', '#F1FF0B'],
  ['#FFFFFF', '#1677BB', '#FEE920', '#FB002C'],
  ['#FFFFFF', '#FA0008', '#FDB539', '#F1FF0B'],
  ['#FFFCE4', '#ACFF09', '#FB486A', '#FFFF0A'],
  ['#FFFCE4', '#FDA60A', '#F10DD5', '#F8FF0A'],
  ['#FFFFFF', '#FEF70B', '#B20004', '#2AAC1C'],
  ['#FCD0D3', '#E6C645', '#177828', '#FB0062'],
  ['#503F3F', '#FD6708', '#FEFF0A', '#FB0077'],
  ['#FFFBDB', '#111111', '#FB0006', '#F3FF0B'],
  ['#FBF9EA', '#FBF9EA', '#F61B8B', '#FDB70D']
]

def hex2bgr(value):
    value = value.lstrip('#')
    lv = len(value)
    ret =  list(int(value[i:i+lv/3], 16) for i in range(0, lv, lv/3))
    ret.reverse()
    return ret

def bgr2hex(bgr):
    bgr.reverse()
    return ('#%02x%02x%02x' % bgr).upper()

def get():
    print randint(0, len(color_sets)-1)
    color_set = color_sets[randint(0, len(color_sets)-1)]
    rgb_color_set = []
    # print rgb_color_set
    for color in color_set:
      rgb_color_set.append(hex2bgr(color))

    return rgb_color_set