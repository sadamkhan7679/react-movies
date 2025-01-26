export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export const collections = {
  users: 'users',
  ratings: 'ratings',
  comments: 'comments',
  watchlist: 'watchlist',
  trending: 'trending',
  settings: 'settings',
  lists: 'lists',
  listItems: 'list_items',
};

export const TMDB_HEADERS = {
  accept: 'application/json',
  Authorization: `Bearer ${TMDB_API_KEY}`,
};