import time
import requests
from bs4 import BeautifulSoup
import json


def scrapCitizenMatters():
    """
    Scrape articles from Citizen Matters Bengaluru.
    """
    pageNum = 1
    while pageNum <= 5:
        url = f"https://citizenmatters.in/city/bengaluru/page/{pageNum}/"
        print(f"Scraping page {pageNum} from {url}")
        headers = {"User-Agent": "Mozilla/5.0 (compatible; ScraperBot/1.0)"}

        response = requests.get(url, headers=headers, verify=False)

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")

            print("Page Title:", soup.title.string if soup.title else "No title found")
            print("=" * 60)

            articles_data = []

            # Find the main container holding all articles
            main_container = soup.find("div", class_="archive-page")
            if not main_container:
                print("Main container not found.")
            else:
                article_list = main_container.find("div", class_="articles-post-list")
                if not article_list:
                    print("Article list not found.")
                else:
                    article_items = article_list.find_all(
                        "article", class_="post-list-item"
                    )

                    for article in article_items:
                        data = {}

                        # Title and Link
                        title_tag = article.find("h4", class_="title")
                        a_tag = title_tag.find("a") if title_tag else None
                        data["title"] = (
                            a_tag.get_text(strip=True) if a_tag else "No title"
                        )
                        data["article_link"] = (
                            a_tag["href"]
                            if a_tag and a_tag.has_attr("href")
                            else "No link"
                        )

                        # Author
                        author_tag = article.find("a", class_="author")
                        data["author"] = (
                            author_tag.get_text(strip=True)
                            if author_tag
                            else "No author"
                        )

                        # Date
                        date_tag = article.find("span", class_="post-date")
                        data["date"] = (
                            date_tag.get_text(strip=True) if date_tag else "No date"
                        )

                        articles_data.append(data)

            # Print results as JSON
            print(json.dumps(articles_data, indent=2))
            time.sleep(2)
            pageNum += 1

        else:
            print(f"Failed to retrieve the page, status code: {response.status_code}")


if __name__ == "__main__":
    scrapCitizenMatters()
else:
    print("This script is intended to be run directly, not imported as a module.")
