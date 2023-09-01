import pandas as pd


# Read in the movies csv file
# Define column types
movies = pd.read_csv('../data/all_movies.csv')

# Keep only movies
movies = movies[movies['titleType'] == 'movie']

# Convert startYear to integer
movies['startYear'] = movies['startYear'].astype(int, errors='ignore')

# Filter out rows with non-numeric startYear values
movies = movies[pd.to_numeric(movies['startYear'], errors='coerce').notnull()]

# Convert startYear to integer
movies['startYear'] = movies['startYear'].astype(int)

# Filter for movies released btw 1920 and 2020 (GPT training data)
movies = movies[movies['startYear'] >= 1920]
movies = movies[movies['startYear'] <= 2020]

# Remove movies with unwanted genres (genre str contains any of the strings in to_remove)
to_remove = ['Documentary', 'Short', 'Adult', 'News', 'Reality-TV', 'Talk-Show', 'Game-Show']
movies = movies[~movies['genres'].str.contains('|'.join(to_remove))]

# Remove movies with genre '\\N'
movies = movies[movies['genres'] != '\\N']

# Remove all isAdult == 1
movies = movies[movies['isAdult'] == 0]

# Convert runtimeMinutes to integer
movies['runtimeMinutes'] = movies['runtimeMinutes'].astype(int, errors='ignore')

# Filter out rows with non-numeric runtimeMinutes values
movies = movies[pd.to_numeric(movies['runtimeMinutes'], errors='coerce').notnull()]

movies['runtimeMinutes'] = movies['runtimeMinutes'].astype(int)

# Remove all movies with less than 30 minutes runtime
movies = movies[movies['runtimeMinutes'] >= 30]

# Count the number of movies per genre
# genres = movies['genres'].str.split(',', expand=True).stack()
# print(genres.value_counts())

# Only keep 1000 most voted
movies = movies.sort_values(by='numVotes', ascending=False).head(1000)

# Keep only tconst>imdb, primaryTitle>title, startYear>year
movies = movies[['tconst', 'primaryTitle', 'startYear']]
movies.columns = ['imdb', 'title', 'year']

# Remove the index
movies.reset_index(drop=True, inplace=True)

# Save the DataFrame to disk
movies.to_csv("../data/movies.csv", index=False)