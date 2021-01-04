import androidx.compose.desktop.Window

fun main() = Window {
    val scr = Scraper()
    scr.getSeriesUrlFromLetter("azimut")
    scr.getSeries("https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html")
    scr.getSeries("https://www.bedetheque.com/serie-9-BD-Spirou-et-Fantasio.html")
}