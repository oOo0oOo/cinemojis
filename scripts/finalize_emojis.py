import json
from pprint import pprint
import pandas as pd
import numpy as np

from collections import Counter
import os
import re
import html

EMOJIS_PATH = '../data/emojis_raw/'
MOVIES_PATH = '../data/movies.csv'

MAX_REPEAT_EMOJI_PER_MOVIE = 8

movies = pd.read_csv(MOVIES_PATH)

def clean_emojis(txt):
    # Remove all whitespace
    txt = txt.replace(' ', '').replace('\n', '').replace('\t', '')

    # Remove all alphanumeric characters
    txt = ''.join([c for c in txt if not c.isalnum()])

    # Remove all punctuation
    txt = ''.join([c for c in txt if not c in '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'])

    # Remove weird characters
    txt = re.sub(r'[️\u200d]', '', txt)

    # Remove letter emojis
    txt = re.sub(r'[🇦-🇿]', '', txt)

    # Remove all emojis whose ord() code starts with 9176
    txt = ''.join([c for c in txt if not str(ord(c)).startswith("9176")])

    # Each emoji has to appear at most MAX_REPEAT_EMOJI_PER_MOVIE times and at least twice
    unique_txt = ''.join(set(txt))
    txt = ''.join([c * min(MAX_REPEAT_EMOJI_PER_MOVIE, txt.count(c)) for c in unique_txt if txt.count(c) > 1])
    return txt

# Load all emoji files into a dictionary (filename)
emojis = {}
for filename in os.listdir(EMOJIS_PATH):
    ind = filename.split('.')[0]
    with open(EMOJIS_PATH + filename, 'r') as f:
        emojis[ind] = clean_emojis(f.read())

print(f'Loaded {len(emojis)} emoji files.')

# Get all unique emojis sorted by frequency
all_emojis = "".join(emojis.values())
freq = Counter(all_emojis)
unique_emojis = sorted(freq, key=freq.get, reverse=True)
emoji_counts = [freq[c] for c in unique_emojis]
emoji_index = {c: i for i, c in enumerate(unique_emojis)}

# Write html-encoded emojis to file
emoji_html = [f"&#{ord(emoji)};" for emoji in unique_emojis]
with open('../data/emojis.txt', 'w') as f:
    f.write('\n'.join(emoji_html))

print(f'Saved {len(unique_emojis)} unique emojis out of {len(all_emojis)} total to data/emojis.txt')

# Data representation: 2D np-array of ints (#occurences), shape n_movies x n_emojis
cinemojis = np.zeros((len(movies), len(unique_emojis)), dtype=np.float32)

max_emojis = max(emoji_counts)

for i, row in movies.iterrows():
    imdb = row['imdb']
    counter = Counter(emojis[imdb])
    for c in counter:
        emoji_id = emoji_index[c]
        # ATTENTION: ALTERING THE WEIGHTING HERE
        weighted = (counter[c] / MAX_REPEAT_EMOJI_PER_MOVIE) * (2 - emoji_counts[emoji_id] / max_emojis)
        weighted = int(weighted * 4)
        cinemojis[i, emoji_id] = weighted

cinemojis = cinemojis.astype(np.int8)

# Histogram (text)
# print(pd.Series(cinemojis.flatten()).value_counts())

# Save to file as json 2D array compressed with gzip
with open('../data/cinemojis.json', 'wb') as f:
    f.write(json.dumps(cinemojis.tolist(), separators=(',', '\n')).encode('utf-8'))
print(f'Saved {cinemojis.shape} array to ../data/cinemojis.json')