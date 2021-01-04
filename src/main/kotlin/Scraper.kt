import it.skrape.core.fetcher.HttpFetcher
import it.skrape.core.htmlDocument
import it.skrape.extract
import it.skrape.extractIt
import it.skrape.selects.*
import it.skrape.selects.html5.*
import it.skrape.skrape
import java.text.SimpleDateFormat

class Scraper {
    fun getSeriesUrlFromLetter(letters: String) {
        val extracted: List<String> = skrape(HttpFetcher) {
            request {
                url = "https://www.bedetheque.com/bandes_dessinees_${letters}.html"
            }

            extract {
                htmlDocument {
                    ul {
                        withClass = "nav-liste"
                        li {
                            findAll {
                                a {
                                    map {
                                        span {
                                            withClass = "libelle"
                                            eachText
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        print(extracted);
    }

    data class Series(
            var name: String = "",
            var comics: List<Comic> = listOf()
    )

    fun getSeries(urlSearch: String) {
        val extracted = skrape(HttpFetcher) {
            request {
                url = urlSearch.replace(".html", "__10000.html")
            }

            extractIt<Series> {
                it ->
                htmlDocument {
                    it.name = h1 {
                        a {
                            findFirst {
                                ownText
                            }
                        }
                    }
                    //println(this.toString())

                    var comics = mutableListOf<Comic>()
                    ul {
                        withClass = "liste-albums"
                        li {
                            withAttributeKey = "itemscope"
                            findAll {
                                this.map {
                                    //println(comics)
                                    //println("/////////////////////////")
                                    var currentComic = Comic()
                                    var htmlstring = it.toString()
                                    htmlDocument(htmlstring) {
                                        relaxed = true
                                        h3 {
                                            a {
                                                findFirst {
                                                    currentComic.name = this.attributes["title"]
                                                }
                                            }
                                        }

                                        div {
                                            withClass = "couv"
                                            img {
                                                findFirst {
                                                    currentComic.cover = this.attributes["src"]
                                                }
                                            }
                                        }
                                        div {
                                            withClass = "album-main"
                                            div {
                                                withClass = "ratingblock"
                                                strong {
                                                    findFirst {
                                                        currentComic.stars = if (ownText.isNullOrBlank()) null else ownText.toDouble()
                                                    }
                                                }
                                            }
                                            span {
                                                withAttribute = "itemprop" to "author"
                                                findAll {
                                                    for (item in this) {
                                                        currentComic.authorScenario?.add(item.ownText.replace(",", ""))
                                                    }
                                                }
                                            }
                                            span {
                                                withAttribute = "itemprop" to "illustrator"
                                                findAll {
                                                    for (i in 0 until this.size-1) {
                                                        currentComic.authorDrawing?.add(this[i].ownText.replace(",", ""))
                                                    }
                                                }
                                            }
                                            span {
                                                withAttribute = "itemprop" to "illustrator"
                                                findLast {
                                                    currentComic.authorColor?.add(ownText.replace(",", ""))
                                                }
                                            }
                                            meta {
                                                withAttribute = "itemprop" to "datePublished"
                                                findFirst {
                                                    currentComic.legalDeposit = SimpleDateFormat("yyyy-MM-dd").parse(this.attributes["content"])
                                                }
                                            }
                                            span {
                                                withAttribute = "itemprop" to "isbn"
                                                findFirst {
                                                    currentComic.isbn = ownText.replace("-", "")
                                                }
                                            }
                                            span {
                                                withAttribute = "itemprop" to "numberOfPages"
                                                findFirst {
                                                    currentComic.pages = if (ownText.isNullOrBlank()) null else ownText.toInt()
                                                }
                                            }
                                            span {
                                                withAttribute = "itemprop" to "publisher"
                                                findFirst {
                                                   currentComic.editor = ownText
                                                }
                                            }
                                            li {
                                                a {
                                                    findAll {
                                                        for (link in this) {
                                                            if (link.hasAttribute("href")
                                                                    and link.attribute("href").startsWith("https://www.bedetheque.com/search/albums?RechCollection")) {
                                                                currentComic.collection = link.ownText
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        div {
                                            withClass = "autres"
                                            p {
                                                a {
                                                    findAll {
                                                        for (link in this) {
                                                            if (link.hasAttribute("href")
                                                            and link.attribute("href").endsWith("#reed")) {
                                                                currentComic.otherEd = link.attribute("href")
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    comics.add(currentComic)
                                }
                            }
                        }
                    }
                    it.comics = comics
                }
            }
        }

        println(extracted);
    }
}