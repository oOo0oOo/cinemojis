# Copy files from data folder to static webapp folder

import shutil
import os

shutil.copy("../data/cinemojis.json", "../webapp/static/data/cinemojis.json")
shutil.copy("../data/emojis.txt", "../webapp/static/data/emojis.txt")
shutil.copy("../data/movies.csv", "../webapp/static/data/movies.csv")
shutil.copy("../data/descriptions.txt", "../webapp/static/data/descriptions.txt")

for filename in os.listdir("../data/covers/"):
    shutil.copy(f"../data/covers/{filename}", f"../webapp/static/covers/{filename}")
