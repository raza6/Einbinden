import java.util.*

data class Comic(
        var name: String? = "",
        var stars: Double? = null,
        var authorScenario: MutableList<String>? = mutableListOf(),
        var authorDrawing: MutableList<String>? = mutableListOf(),
        var authorColor: MutableList<String>? = mutableListOf(),
        var legalDeposit: Date? = null,
        var editor: String? = "",
        var collection: String? = "",
        var isbn: String? = "",
        var pages: Int? = null,
        var cover: String? = "",
        var acquiredDate: Date? = Date(),
        var otherEd: String? = ""
)