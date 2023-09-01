import requests
from bs4 import BeautifulSoup
import pandas as pd

import time
import os

# URL of the web page to scrape
URL = "https://www.imdb.com/title/"
COVER_FOLDER = "../data/covers/"
MOVIE_PATH = "../data/movies.csv"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0"
}

def download_cover(imdb_id):
    fpath = COVER_FOLDER + imdb_id + ".jpg"
    # Skip if we already have the cover
    if os.path.isfile(fpath):
        return False

    # Send a GET request to the URL
    response = requests.get(URL + imdb_id, headers=headers)

    # Parse the HTML content of the response using BeautifulSoup
    soup = BeautifulSoup(response.content, "html.parser")

    # Find img with class="ipc-image"
    src = soup.find("img", class_="ipc-image")["src"]

    # Download to folder
    with open(fpath, "wb") as f:
        f.write(requests.get(src).content)

    time.sleep(2)
    return True


# Iterate over the rows of the DataFrame
movies = pd.read_csv(MOVIE_PATH)
for i, row in movies.iterrows():
    imdb = row["imdb"]
    dl = download_cover(imdb)
    if dl:
        print(f"Downloaded cover for {imdb} ({i + 1} / {len(movies)})")