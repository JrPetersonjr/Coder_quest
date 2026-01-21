from PIL import Image

input_path = r"H:\AIRLOCK\Choose Your Own Code\LIVE\Quest_For_The_Code_LIVE\fav.png"
output_path = r"H:\AIRLOCK\Choose Your Own Code\LIVE\Quest_For_The_Code_LIVE\favicon_multi.ico"

icon_sizes = [
    (16, 16),
    (32, 32),
    (48, 48),
    (64, 64),
    (128, 128),
    (256, 256)
]

img = Image.open(input_path)
img.save(output_path, format="ICO", sizes=icon_sizes)
