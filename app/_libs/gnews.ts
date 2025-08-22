export default async function getGNewsArticles(category: string, query?: string) {
  const API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
  let url = "";

  if (category === "search" && query) {
    url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=ja&apikey=${API_KEY}`;
  } else {
    url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=ja&apikey=${API_KEY}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.error("GNews fetch failed:", res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  // GNews returns `articles` array
  return data.articles.map((a: any) => ({
    title: a.title,
    url: a.url,
    image: a.image,
    description: a.description,
    publishedAt: a.publishedAt
  }));
}