from collections import Counter
import re
from pprint import pprint

# Summarize the movie "Avatar" (2009) using exclusively 20 emojis. No text explanation.

# GPT-4 (25$ total)
gpt4 = '''👽🌎🌳💙🐉💀🔫🔥🚁💥🌿🍃💪🚶🏾‍♂️💕💔😭🪶☀️🟦🌌
🚀👨🔀🧝‍♂️💑🌳🌍👽🏞️💘🔫🚁⛺🌲💥💔🌱💕🚀🛸
🔬🧑‍🦼➡️🔁👨‍🎤🔵🌳🌿🦜👽❤️👩‍🦰🔵🌍🏞🔥🚀💣🏹👫🌍✌️
👨‍🚀🚀🌠🌌➡️🌍🌴🐉👥🔀🧔🏻🔵🌲🏞️💕👱‍♀️🔵🏹⚔️🔥➡️☮️
👨‍🚀🚀🛸🌍➡️👽🌕🌳🌲🦖🏞️💑❤️⚔️✊🔫🔥💔⚰️➡️👽🦋💙'''


# GPT-3.5 (0.8$ total)
gpt3 = '''🌏💙👽🌳🌾🌿🌱🔫🚁💥⚔️💔💑💫✨🌅🐉🐴🐉🤝🌳
🌍🌳🔵🔫👽💙✨💥👥💔💔🔮💪🌿❤️💀🚁🌋💥💕
🌍🚀🌿🌳🌍🧑‍🚀🌿🐉💻🪐🦾🌍💙🌀💔🚁🔥👽🔥🌾
🌍💙🌳🚀🧑‍🚀🌺🌿🐉💥⚔️😢💔🌾🏞️🦎🏹🌌💫✨🤝
🌍👽🪐🌳🏞️💙🚁🧑‍🚀🌍🌿🌱🏞️🗿💀🔫🔥💣🤼🌍✨🙌'''

# Remove any non-emoji characters using regex
templ = re.compile(r'(\U0001F600-\U0001F64F)')
gpt4 = templ.sub('', gpt4)
gpt3 = templ.sub('', gpt3)

gpt4 = gpt4.strip().replace('\n', '').replace('\t', '').replace(' ', '')
gpt3 = gpt3.strip().replace('\n', '').replace('\t', '').replace(' ', '')

gpt4 = re.sub(r'[️\u200d]', '', gpt4)
gpt3 = re.sub(r'[️\u200d]', '', gpt3)

# Split the string into characters
gpt4 = list(gpt4)
gpt3 = list(gpt3)

# Create a dictionary with the emojis as keys and the number of times they appear as values
gpt4 = Counter(gpt4)
gpt3 = Counter(gpt3)

# Print the results
pprint(gpt4)
pprint(gpt3)