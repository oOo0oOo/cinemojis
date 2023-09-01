import requests
import os

# Download emoji description file
URL = "https://unicode.org/Public/emoji/15.0/emoji-test.txt"

# Path to save the file
EMOJI_PATH = "../data/emojis.txt"
DESC_PATH = "../data/descriptions_raw.txt"
OUTPUT_PATH = "../data/descriptions.txt"

# Download the file
if not os.path.exists(DESC_PATH):
    response = requests.get(URL)
    if response.status_code != 200:
        raise Exception("Could not download file")
    with open(DESC_PATH, "wb") as f:
        f.write(response.content)

# Read the file and all emojis
with open(DESC_PATH, "r") as f:
    raw_descriptions = f.read()

with open(EMOJI_PATH, "r") as f:
    raw_emojis = f.read()

# Convert html escaped emojis to unicode
emojis = raw_emojis.split("\n")
emojis = [chr(int(e[2:-1])) for e in emojis if e != ""]

# Search description in txt file
descriptions = []
for emoji in emojis:
    ind = raw_descriptions.find(emoji)
    if ind == -1:
        descriptions.append("")
        continue
    desc = raw_descriptions[ind:].split("\n")[0]

    # Remove everything before the letter E
    desc = desc[desc.find("E"):]
    desc = desc.split(" ")[1:]
    desc = " ".join(desc).replace(":", "").replace("’", " ")
    descriptions.append(desc.lower())

# Save descriptions
with open(OUTPUT_PATH, "w") as f:
    f.write("\n".join(descriptions))

print("Saved descriptions to data/descriptions.txt")