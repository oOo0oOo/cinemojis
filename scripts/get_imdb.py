import pandas as pd
import requests
import os

# TITLE INFO
# Set the URL of the file to download
url = "https://datasets.imdbws.com/title.basics.tsv.gz"
local_path = "../data/title.basics.tsv.gz"

if not os.path.exists(local_path):
    print("Downloading file...")
    response = requests.get(url)

    with open(local_path, "wb") as f:
        f.write(response.content)

print("Loading from disk...")
df = pd.read_csv(local_path, compression="gzip", delimiter="\t")

# Only keep some columns
df = df[["tconst", "titleType", "primaryTitle", "startYear", "genres", "isAdult", "runtimeMinutes"]]


# RATINGS
url = "https://datasets.imdbws.com/title.ratings.tsv.gz"
local_path = "../data/title.ratings.tsv.gz"

if not os.path.exists(local_path):
    print("Downloading file...")
    response = requests.get(url)

    with open(local_path, "wb") as f:
        f.write(response.content)

print("Loading from disk...")
ratings = pd.read_csv(local_path, compression="gzip", delimiter="\t")

# Merge the two DataFrames
df = df.merge(ratings, on="tconst")

# Filter out rows with any missing values
df = df.dropna()

# Save the DataFrame to disk
df.to_csv("../data/all_movies.csv", index=False)
