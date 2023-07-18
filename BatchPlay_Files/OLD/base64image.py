import base64

with open("icons.png", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read())
    with open("./icon.txt", "w") as txt:
        txt.write(str(encoded_string))
