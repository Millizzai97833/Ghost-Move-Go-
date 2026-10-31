package com.pixelfork.g.game.engine

data class Point(val x: Int, val y: Int)

enum class StoneColor {
    BLACK, WHITE;
    fun opponent(): StoneColor = if (this == BLACK) WHITE else BLACK
}

data class GroupResult(
    val stones: List<Point>,
    val liberties: List<Point>
)

data class MoveResult(
    val success: Boolean,
    val capturedCount: Int,
    val error: String? = null
)

class GoBoard(val size: Int = 19) {
    val grid: Array<Array<StoneColor?>> = Array(size) { Array(size) { null } }
    var koPoint: Point? = null
    var blackCaptures = 0
    var whiteCaptures = 0

    fun clone(): GoBoard {
        val b = GoBoard(size)
        for (y in 0 until size) {
            for (x in 0 until size) {
                b.grid[y][x] = this.grid[y][x]
            }
        }
        b.koPoint = this.koPoint
        b.blackCaptures = this.blackCaptures
        b.whiteCaptures = this.whiteCaptures
        return b
    }

    fun getAdjacent(p: Point): List<Point> {
        val list = mutableListOf<Point>()
        if (p.x > 0) list.add(Point(p.x - 1, p.y))
        if (p.x < size - 1) list.add(Point(p.x + 1, p.y))
        if (p.y > 0) list.add(Point(p.x, p.y - 1))
        if (p.y < size - 1) list.add(Point(p.x, p.y + 1))
        return list
    }

    fun findGroup(start: Point): GroupResult {
        val color = grid[start.y][start.x] ?: return GroupResult(emptyList(), emptyList())
        val visited = Array(size) { BooleanArray(size) }
        val stones = mutableListOf<Point>()
        val liberties = mutableSetOf<Point>()
        val queue = ArrayDeque<Point>()

        queue.add(start)
        visited[start.y][start.x] = true

        while (queue.isNotEmpty()) {
            val curr = queue.removeFirst()
            stones.add(curr)
            for (adj in getAdjacent(curr)) {
                val adjColor = grid[adj.y][adj.x]
                if (adjColor == null) {
                    liberties.add(adj)
                } else if (adjColor == color && !visited[adj.y][adj.x]) {
                    visited[adj.y][adj.x] = true
                    queue.add(adj)
                }
            }
        }
        return GroupResult(stones, liberties.toList())
    }

    fun playMove(p: Point, color: StoneColor): MoveResult {
        if (p.x !in 0 until size || p.y !in 0 until size) {
            return MoveResult(false, 0, "Out of bounds")
        }
        if (grid[p.y][p.x] != null) {
            return MoveResult(false, 0, "Intersection occupied")
        }
        if (koPoint != null && koPoint == p) {
            return MoveResult(false, 0, "Ko rule violation: cannot recreate immediate previous state")
        }

        val opponent = color.opponent()
        grid[p.y][p.x] = color

        // Check captures of opponent groups
        val capturedStones = mutableListOf<Point>()
        val checked = Array(size) { BooleanArray(size) }

        for (adj in getAdjacent(p)) {
            if (grid[adj.y][adj.x] == opponent && !checked[adj.y][adj.x]) {
                val group = findGroup(adj)
                group.stones.forEach { checked[it.y][it.x] = true }
                if (group.liberties.isEmpty()) {
                    for (stone in group.stones) {
                        grid[stone.y][stone.x] = null
                        capturedStones.add(stone)
                    }
                }
            }
        }

        // Suicide check: newly placed stone group must have >= 1 liberty
        val myGroup = findGroup(p)
        if (myGroup.liberties.isEmpty()) {
            // Revert
            grid[p.y][p.x] = null
            for (stone in capturedStones) {
                grid[stone.y][stone.x] = opponent
            }
            return MoveResult(false, 0, "Suicide move prohibited")
        }

        // Update captures
        if (color == StoneColor.BLACK) {
            blackCaptures += capturedStones.size
        } else {
            whiteCaptures += capturedStones.size
        }

        // Calculate new Ko point
        koPoint = if (capturedStones.size == 1 && myGroup.stones.size == 1 && myGroup.liberties.size == 1) {
            capturedStones[0]
        } else {
            null
        }

        return MoveResult(true, capturedStones.size)
    }

    fun calculateTerritory(komi: Double = 6.5): Pair<Double, Double> {
        val visited = Array(size) { BooleanArray(size) }
        var blackTerritory = 0
        var whiteTerritory = 0

        for (y in 0 until size) {
            for (x in 0 until size) {
                if (grid[y][x] != null || visited[y][x]) continue

                val region = mutableListOf<Point>()
                val queue = ArrayDeque<Point>()
                var touchesBlack = false
                var touchesWhite = false

                queue.add(Point(x, y))
                visited[y][x] = true

                while (queue.isNotEmpty()) {
                    val curr = queue.removeFirst()
                    region.add(curr)
                    for (adj in getAdjacent(curr)) {
                        val c = grid[adj.y][adj.x]
                        if (c == StoneColor.BLACK) touchesBlack = true
                        else if (c == StoneColor.WHITE) touchesWhite = true
                        else if (c == null && !visited[adj.y][adj.x]) {
                            visited[adj.y][adj.x] = true
                            queue.add(adj)
                        }
                    }
                }

                if (touchesBlack && !touchesWhite) blackTerritory += region.size
                else if (touchesWhite && !touchesBlack) whiteTerritory += region.size
            }
        }

        val blackTotal = blackTerritory.toDouble() + blackCaptures
        val whiteTotal = whiteTerritory.toDouble() + whiteCaptures + komi
        return Pair(blackTotal, whiteTotal)
    }
}
