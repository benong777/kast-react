export const BASE_URL = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;

export const AUTH_HEADER = {
  Authorization: `Bearer ${import.meta.env.VITE_PAT}`,
  'Content-Type': 'application/json',
}
