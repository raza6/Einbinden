import androidx.compose.desktop.Window
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CutCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.ImageBitmapConfig
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.res.imageResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import org.apache.commons.io.FileUtils
import java.awt.Toolkit
import java.io.File
import java.net.URL
import java.nio.file.Paths
import javax.imageio.ImageIO

@ExperimentalLayout
fun main() = Window(
    title = "Einbinden",
    size = IntSize(Toolkit.getDefaultToolkit().screenSize.width/2, Toolkit.getDefaultToolkit().screenSize.height/2)
) {
    MaterialTheme {
        Surface (
            color = Color(65, 68, 171)
        ) {
            mainLayout()
        }
    }



    val scr = Scraper()
    println(scr.getSeriesUrlFromLetter("azimut"))
    println(scr.getSeriesCoverFromUrl("https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html"))
    scr.getSeriesComicFromUrl("https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html")
    scr.getSeriesComicFromUrl("https://www.bedetheque.com/serie-9-BD-Spirou-et-Fantasio.html")
}

@ExperimentalLayout
@Composable
fun mainLayout() {
    var panel = remember { mutableStateOf(0) }
    Row (
        modifier = Modifier.fillMaxSize()
    ) {
        Surface (
            color = Color(67, 70, 126)
        ) {
            Column (
                modifier = Modifier.fillMaxHeight().padding(horizontal = 10.dp),
            ) {
                Text("Einbiden",
                    color = Color.White,
                    textAlign = TextAlign.Center,
                    fontSize = 1.5.em,
                    modifier = Modifier.padding(top = 6.dp, bottom = 30.dp)
                )
                Button(
                    onClick = {panel.value = 1},
                    modifier = Modifier.padding(vertical = 10.dp)
                        .align(Alignment.CenterHorizontally)
                        .width(150.dp),
                    shape = CutCornerShape(0.dp),
                    colors = ButtonConstants.defaultButtonColors(
                        backgroundColor = Color(43, 45, 112),
                        contentColor = Color.White
                    )
                ) {
                    Text("Collection")
                }
                Button(
                    onClick = {panel.value = 2},
                    modifier = Modifier.padding(vertical = 10.dp)
                        .align(Alignment.CenterHorizontally)
                        .width(150.dp),
                    shape = CutCornerShape(0.dp),
                    colors = ButtonConstants.defaultButtonColors(
                        backgroundColor = Color(43, 45, 112),
                        contentColor = Color.White
                    )
                ) {
                    Text("Ajouter")
                }
                Button(
                    onClick = {panel.value = 3},
                    modifier = Modifier.padding(vertical = 10.dp)
                        .align(Alignment.CenterHorizontally)
                        .width(150.dp),
                    shape = CutCornerShape(0.dp),
                    colors = ButtonConstants.defaultButtonColors(
                        backgroundColor = Color(43, 45, 112),
                        contentColor = Color.White
                    )
                ) {
                    Text("Export / Import")
                }
            }
        }
        rightLayout(panel)
    }
}

@ExperimentalLayout
@Composable
fun rightLayout(panel: MutableState<Int>) {
    when (panel.value) {
        2 -> searchPanel(Scraper())
        3 -> Button(
            onClick = {}
        ) {
            Text("Collection3")
        }
        else -> Button(
            onClick = {}
        ) {
            Text("Collection1")
        }
    }
}

@ExperimentalLayout
@Composable
fun searchPanel(scrap: Scraper) {
    val comicName = remember { mutableStateOf(TextFieldValue(""))}
    val seriesSearched = remember { mutableStateListOf<Series>()}

    Column (
        modifier = Modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            modifier = Modifier.align(Alignment.CenterHorizontally).widthIn(max = 300.dp),
            value = comicName.value,
            onValueChange = { comicName.value = it },
            singleLine = true,
            textStyle = TextStyle( color = Color.White ),
            label = {Text(
                text = "Rechercher une BD",
                color = Color.White
            )},
            trailingIcon = {
                Button (
                    modifier = Modifier.width(50.dp),
                    elevation = null,
                    colors = ButtonConstants.defaultButtonColors(
                        backgroundColor = Color(0, 0, 0, 50),
                        contentColor = Color.Transparent
                    ),
                    onClick = {
                        seriesSearched.clear()
                        seriesSearched += scrap.getSeriesUrlFromLetter(comicName.value.text)
                        for (series in seriesSearched) {
                            series.coverUrl = scrap.getSeriesCoverFromUrl(series.url)
                        }
                    }) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        tint = Color.White
                    )
                }
            },
            inactiveColor = Color.LightGray,
            activeColor = Color.White
        )
        FlowRow {
            seriesSearched.map {
                CardSeries(it)
            }
        }
    }
}

@Composable
fun CardSeries(currentSeries: Series) {
    Card {
        Column (Modifier.clickable(onClick = {println("sex")} )) {
            loadPicture(currentSeries.coverUrl, currentSeries.name.filter { it.isLetterOrDigit() })
        }
        //Text( text = currentSeries.coverUrl)
    }
}

@Composable
fun loadPicture(url: String, name: String) {
    val imageFile: File? = File("src/img/${name}.jpg");
    val imageImage = ImageIO.read(URL(url));
    ImageIO.write(imageImage, "jpg", imageFile);
    if (imageFile != null) {
        Image(org.jetbrains.skija.Image.makeFromEncoded(imageFile.readBytes()).asImageBitmap())
    }
}