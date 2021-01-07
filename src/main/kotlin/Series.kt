data class Series(
    var name: String = "",
    var url: String = "",
    var coverUrl: String = "",
    var comics: List<Comic> = listOf()
)