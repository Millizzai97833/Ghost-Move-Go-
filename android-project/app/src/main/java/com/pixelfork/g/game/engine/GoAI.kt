package com.pixelfork.g.game.engine

import kotlin.math.abs
import kotlin.math.min
import kotlin.random.Random

enum class AIDifficulty { EASY, MEDIUM, HARD, EXPERT }

data class GhostHintResult(
    val point: Point,
    val concept: String,
    val explanation: String
)

object GoAI {

    fun getAIMove(board: GoBoard, color: StoneColor, difficulty: AIDifficulty): Point? {
        val candidates = mutableListOf<Pair<Point, Int>>()

        for (y in 0 until board.size) {
            for (x in 0 until board.size) {
                if (board.grid[y][x] == null) {
                    val p = Point(x, y)
                    val sim = board.clone()
                    val res = sim.playMove(p, color)
                    if (res.success) {
                        val score = evaluatePosition(board, sim, p, color, res.capturedCount, difficulty)
                        candidates.add(Pair(p, score))
                    }
                }
            }
        }

        if (candidates.isEmpty()) return null
        candidates.sortByDescending { it.second }

        return when (difficulty) {
            AIDifficulty.EXPERT -> candidates.first().first
            AIDifficulty.HARD -> {
                val pool = candidates.take(2)
                if (Random.nextFloat() < 0.85f) pool.first().first else pool.last().first
            }
            AIDifficulty.MEDIUM -> {
                val pool = candidates.take(min(3, candidates.size))
                pool.random().first
            }
            AIDifficulty.EASY -> {
                val pool = candidates.take(min(6, candidates.size))
                pool.random().first
            }
        }
    }

    private fun evaluatePosition(
        orig: GoBoard,
        sim: GoBoard,
        p: Point,
        color: StoneColor,
        captures: Int,
        diff: AIDifficulty
    ): Int {
        var score = 0
        val myGroup = sim.findGroup(p)

        // 1. Captures
        if (captures > 0) score += captures * 120 + 80

        // 2. Prevent self-atari
        if (myGroup.liberties.size == 1 && captures == 0) {
            score -= if (diff == AIDifficulty.EASY) 50 else 240
        }

        // 3. Rescuing friendly stones from atari
        for (adj in orig.getAdjacent(p)) {
            if (orig.grid[adj.y][adj.x] == color) {
                val origGroup = orig.findGroup(adj)
                if (origGroup.liberties.size == 1 && myGroup.liberties.size >= 2) {
                    score += origGroup.stones.size * 90 + 100
                }
            }
        }

        // 4. Third and fourth line opening moves
        val distEdgeX = min(p.x, orig.size - 1 - p.x)
        val distEdgeY = min(p.y, orig.size - 1 - p.y)
        if ((distEdgeX in 2..3) && (distEdgeY in 2..3)) {
            score += 35
        }

        // 5. Star points bonus
        val starPoints = getStarPoints(orig.size)
        if (starPoints.contains(p)) score += 25

        return score
    }

    fun getGhostHint(board: GoBoard, color: StoneColor): GhostHintResult? {
        val move = getAIMove(board, color, AIDifficulty.EXPERT) ?: return null
        val colChar = ('A' + (if (move.x >= 8) move.x + 1 else move.x))
        val rowNum = board.size - move.y
        val coord = "$colChar$rowNum"

        return GhostHintResult(
            point = move,
            concept = "Ghost Move (Gwisu / 鬼手)",
            explanation = "Master tactical recommendation at intersection $coord balancing corner territory and exterior liberty superiority."
        )
    }

    private fun getStarPoints(size: Int): List<Point> {
        return when (size) {
            19 -> listOf(
                Point(3, 3), Point(9, 3), Point(15, 3),
                Point(3, 9), Point(9, 9), Point(15, 9),
                Point(3, 15), Point(9, 15), Point(15, 15)
            )
            13 -> listOf(Point(3, 3), Point(9, 3), Point(6, 6), Point(3, 9), Point(9, 9))
            else -> listOf(Point(2, 2), Point(6, 2), Point(4, 4), Point(2, 6), Point(6, 6))
        }
    }
}
