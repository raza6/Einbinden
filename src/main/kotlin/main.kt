import androidx.compose.animation.expandHorizontally
import androidx.compose.desktop.Window
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CutCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import java.awt.Toolkit

fun main() = Window(
    title = "Einbinden",
    size = IntSize(Toolkit.getDefaultToolkit().screenSize.width/2, Toolkit.getDefaultToolkit().screenSize.height/2)
) {
    MaterialTheme (

    ) {
        Surface (
            color = Color(65, 68, 171)
                ) {
            mainLayout()
        }
    }

    val scr = Scraper()
    scr.getSeriesUrlFromLetter("azimut")
    scr.getSeries("https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html")
    scr.getSeries("https://www.bedetheque.com/serie-9-BD-Spirou-et-Fantasio.html")
}

@Composable
fun mainLayout() {
    var panel: MutableState<Int> = mutableStateOf(0)
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

@Composable
fun rightLayout(panel: MutableState<Int>) {
    when (panel.value) {
        2 -> Button(
            onClick = {}
        ) {
            Text("Collection2")
        }
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