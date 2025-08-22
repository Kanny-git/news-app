"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import getGNewsArticles from "./_libs/gnews";
import { trimText, formatDate } from "./utils/utils";
import styles from "./page.module.css";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";

type Article = {
  image?: string;
  title: string;
  url: string;
  description?: string;
  publishedAt?: string;
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState("breaking-news");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

useEffect(() => {
  const stored = localStorage.getItem("bookmarks");
  if (stored) {
    setBookmarks(JSON.parse(stored));
  }
}, []);

  useEffect(() => {
    setLoading(true); // Start loading
    getGNewsArticles(category)
      .then((data: Article[]) => {
      console.log("Fetched articles:", data);
      setArticles(data);
      })
      .catch((err: unknown) => console.error("Error fetching GNews:", err))
      .finally(() => setLoading(false)); // End loading
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    getGNewsArticles("search", searchQuery) 
      .then((data: Article[]) => setArticles(data))
      .catch((err: unknown) => console.error("Search error:", err))
      .finally(() => setLoading(false));
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
  }

  const toggleBookmark = (article: Article) => {
  let updated: Article[];
  const isBookmarked = bookmarks.some((a) => a.url === article.url);

  if (isBookmarked) {
    updated = bookmarks.filter((a) => a.url !== article.url);
  } else {
    updated = [...bookmarks, article];
  }

  setBookmarks(updated);
  localStorage.setItem("bookmarks", JSON.stringify(updated));
};

  const categories = [
    { key: "breaking-news", label: "Breaking News" },
    { key: "business", label: "Business" },
    { key: "technology", label: "Technology" },
    { key: "sports", label: "Sports" },
    { key: "health", label: "Health" },
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.logo}>logo</div>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            <FontAwesomeIcon icon={faSearch}/>
          </button>
        </form>
        <button>
          <FontAwesomeIcon icon={faUser} />
        </button>
        <button onClick={toggleTheme} className={styles.themeBtn}>
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </button>
      </nav>

      <h1 className={styles.mainTitle}>
        {categories.find((cat) => cat.key === category)?.label}
      </h1>

      {/* Category buttons */}
      <div className={styles.catButtons}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`${styles.catButton} ${category === cat.key ? styles.active : ""}`}>
            {cat.label}
          </button>
        ))}
      </div>
       {/* Modal for article details */}
        {selectedArticle && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <button onClick={() => setSelectedArticle(null)} className={styles.closeBtn}>
                ✖
              </button>
              <h2>{selectedArticle.title}</h2>
              <Image
                src={selectedArticle.image || "/fallback.jpg"}
                alt={selectedArticle.title}
                width={500}
                height={300}
                className={styles.modalImage}
                unoptimized
              />
              <p className={styles.modalDescription}>
                {selectedArticle.description || "No description available"}
              </p>
              <p>{selectedArticle?.publishedAt ? formatDate(selectedArticle.publishedAt) : "No date"}</p>
              <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer">
                Read full article
              </a>
            </div>
          </div>
        )}


      {/* Loading state */}
      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <>
          <div className={styles.gridContainer}>
            {/* Main Large Article */}
            {articles[0] && (
                <div className={styles.mainArticle}>
                  <button onClick={() => toggleBookmark(articles[0])} className={styles.bookmark}>
                    <FontAwesomeIcon icon={bookmarks.some((a) => a.url === articles[0].url)
                    ? solidBookmark : regularBookmark}
                  />
                </button>
                <Image
                  src={articles[0].image || "/fallback.jpg"}
                  alt={articles[0].title}
                  className={styles.mainImage}
                  width={1000}
                  height={1000}
                  unoptimized
                />
                <div className={styles.mainOverlay}>
                  <h2 className={styles.mainTitleOverlay}>{articles[0].title}</h2>
                    <div className={styles.link}>
                      <button onClick={() => setSelectedArticle(articles[0])}>see more</button>
                      <p>{articles[0]?.publishedAt ? formatDate(articles[0].publishedAt) : "No date"}</p>
                    </div> 
                </div>
              </div>
            )}

            {/* Two smaller stacked articles */}
            <div className={styles.smallArticlesContainer}>
              {articles.slice(1, 3).map((article, idx) => (
                <div key={idx} className={styles.smallArticle}>
                  <button onClick={() => toggleBookmark(article)} className={styles.bookmark}>
                    <FontAwesomeIcon icon={bookmarks.some((a) => a.url === article.url)
                      ? solidBookmark : regularBookmark}
                  />
                </button>
                  <Image
                    src={article.image || "/fallback.jpg"}
                    alt={article.title}
                    className={styles.smallImage}
                    width={200}
                    height={200}
                    unoptimized
                  />
                  <div className={styles.smallOverlay}>
                    <h3 className={styles.smallTitleOverlay}>
                      {trimText(article.title ?? "", 40)}
                    </h3>
                    <div className={styles.link}>
                      <Link href={article.url}>see more</Link>
                      <p>{article?.publishedAt ? formatDate(article.publishedAt) : "No date"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
              
          {/* More Articles */}
          <div className={styles.moreArticlesGrid}>
            {articles.slice(3).map((article, id) => (
              <div key={id} className={styles.moreArticleCard}>

                <button onClick={() => toggleBookmark(article)} className={styles.bookmark}>
                  <FontAwesomeIcon icon={bookmarks.some((a) => a.url === article.url)
                    ? solidBookmark : regularBookmark}
                  />
                </button>

                <Image
                  src={article.image || "/fallback.jpg"}
                  alt={article.title}
                  width={400}
                  height={250}
                  className={styles.moreArticleImage}
                  unoptimized
                />
                <div className={styles.moreArticleContent}>
                  <h3 className={styles.moreArticleTitle}>
                    {trimText(article.title ?? "", 30)}
                  </h3>
                  <p className={styles.moreArticleDescription}>
                    {trimText(article.description ?? "", 60)}
                  </p>
                  <div className={styles.link}>
                    <Link href={article.url}>see more</Link>
                    <p>{article?.publishedAt ? formatDate(article.publishedAt) : "No date"}</p>
                  </div> 
                </div>
              </div>
            ))}
            </div>
            <h2 className={styles.sectionTitle}>Bookmarks</h2>
<div className={styles.moreArticlesGrid}>
  {bookmarks.length === 0 ? (
    <p>No bookmarks yet</p>
  ) : (
    bookmarks.map((article, id) => (
      <div key={id} className={styles.moreArticleCard}>
        <h3>{article.title}</h3>
        <Link href={article.url}>see more</Link>
      </div>
    ))
  )}
</div>
        </>
      )}
    </div>
  );
}
