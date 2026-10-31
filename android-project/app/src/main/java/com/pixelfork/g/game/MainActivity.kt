package com.pixelfork.g.game

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pixelfork.g.game.ads.AdMobBannerView
import com.pixelfork.g.game.ads.InterstitialAdManager
import com.pixelfork.g.game.ads.RewardedAdManager
import com.pixelfork.g.game.engine.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var interstitialAdManager: InterstitialAdManager
    private lateinit var rewardedAdManager: RewardedAdManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Ads
        interstitialAdManager = InterstitialAdManager(this).apply { loadAd() }
        rewardedAdManager = RewardedAdManager(this).apply { loadAd() }

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF121110),
                    surface = Color(0xFF1A1714),
                    primary = Color(0xFFC28E46)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF121110)
                ) {
                    GoGameScreen(
                        onShowInterstitial = { onDismissed ->
                            interstitialAdManager.showIfAvailable(this, onDismissed)
                        },
                        onShowRewardedHint = { onRewarded, onClosed ->
                            rewardedAdManager.showIfAvailable(this, onRewarded, onClosed)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun GoGameScreen(
    onShowInterstitial: (() -> Unit) -> Unit,
    onShowRewardedHint: (() -> Unit, () -> Unit) -> Unit
) {
    var boardSize by remember { mutableStateOf(19) }
    var board by remember(boardSize) { mutableStateOf(GoBoard(boardSize)) }
    var turnColor by remember { mutableStateOf(StoneColor.BLACK) }
    var lastMove by remember { mutableStateOf<Point?>(null) }
    var ghostHint by remember { mutableStateOf<Point?>(null) }
    var consecutivePasses by remember { mutableStateOf(0) }
    var showGameOverDialog by remember { mutableStateOf(false) }
    var gameScore by remember { mutableStateOf<Pair<Double, Double>?>(null) }
    var isVsAi by remember { mutableStateOf(true) }
    var aiDifficulty by remember { mutableStateOf(AIDifficulty.EXPERT) }
    val coroutineScope = rememberCoroutineScope()

    fun resetGame(newSize: Int = boardSize) {
        boardSize = newSize
        board = GoBoard(newSize)
        turnColor = StoneColor.BLACK
        lastMove = null
        ghostHint = null
        consecutivePasses = 0
        showGameOverDialog = false
        gameScore = null
    }

    fun clearBoardForStudy() {
        board = GoBoard(boardSize)
        turnColor = StoneColor.BLACK
        lastMove = null
        ghostHint = null
        consecutivePasses = 0
        showGameOverDialog = false
        gameScore = null
    }

    fun makeMove(p: Point) {
        val res = board.playMove(p, turnColor)
        if (res.success) {
            lastMove = p
            ghostHint = null
            consecutivePasses = 0
            turnColor = turnColor.opponent()

            // AI Response if in AI mode and it's White's turn
            if (isVsAi && turnColor == StoneColor.WHITE) {
                coroutineScope.launch {
                    delay(350)
                    val aiMove = GoAI.getAIMove(board, StoneColor.WHITE, aiDifficulty)
                    if (aiMove != null) {
                        board.playMove(aiMove, StoneColor.WHITE)
                        lastMove = aiMove
                        turnColor = StoneColor.BLACK
                    } else {
                        // AI passes
                        consecutivePasses++
                        turnColor = StoneColor.BLACK
                        if (consecutivePasses >= 2) {
                            gameScore = board.calculateTerritory(6.5)
                            showGameOverDialog = true
                            onShowInterstitial {}
                        }
                    }
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF171513))
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "GHOST MOVE GO",
                    color = Color(0xFFF5EBD9),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Traditional Baduk · 19×19 / 13×13 / 9×9",
                    color = Color(0xFF8C806F),
                    fontSize = 11.sp
                )
            }

            // Board size chips
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                listOf(19, 13, 9).forEach { s ->
                    Button(
                        onClick = { resetGame(s) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (boardSize == s) Color(0xFFC28E46) else Color(0xFF26211B)
                        ),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = "${s}×$s",
                            fontSize = 11.sp,
                            color = if (boardSize == s) Color(0xFF16120C) else Color(0xFFD6C9B6)
                        )
                    }
                }
            }
        }

        // Status Card: Black vs White Captures
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Black Player Box
            Box(
                modifier = Modifier
                    .weight(1f)
                    .background(Color(0xFF1C1916), RoundedCornerShape(8.dp))
                    .border(
                        1.dp,
                        if (turnColor == StoneColor.BLACK) Color(0xFFC28E46) else Color(0xFF2E2821),
                        RoundedCornerShape(8.dp)
                    )
                    .padding(8.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .background(Color(0xFF121110), CircleShape)
                            .border(1.dp, Color(0xFF4A4A4A), CircleShape)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Column {
                        Text("Black (흑)", color = Color(0xFFF4EFE6), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text("Captures: ${board.blackCaptures}", color = Color(0xFFA89B88), fontSize = 10.sp)
                    }
                }
            }

            // White Player Box
            Box(
                modifier = Modifier
                    .weight(1f)
                    .background(Color(0xFF1C1916), RoundedCornerShape(8.dp))
                    .border(
                        1.dp,
                        if (turnColor == StoneColor.WHITE) Color(0xFFC28E46) else Color(0xFF2E2821),
                        RoundedCornerShape(8.dp)
                    )
                    .padding(8.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .background(Color(0xFFF7F5ED), CircleShape)
                            .border(1.dp, Color(0xFFB5AA99), CircleShape)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Column {
                        Text("White (백)", color = Color(0xFFF4EFE6), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text("Captures: ${board.whiteCaptures} (+6.5)", color = Color(0xFFA89B88), fontSize = 10.sp)
                    }
                }
            }
        }

        // Goban Board Canvas
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(8.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .aspectRatio(1f)
                    .background(Color(0xFFDCB35C), RoundedCornerShape(6.dp))
                    .border(3.dp, Color(0xFF8C5922), RoundedCornerShape(6.dp))
                    .pointerInput(boardSize) {
                        detectTapGestures { offset ->
                            val margin = size.width * (if (boardSize == 19) 0.052f else if (boardSize == 13) 0.065f else 0.085f)
                            val playArea = size.width - margin * 2
                            val step = playArea / (boardSize - 1)

                            val col = Math.round((offset.x - margin) / step)
                            val row = Math.round((offset.y - margin) / step)

                            if (col in 0 until boardSize && row in 0 until boardSize) {
                                makeMove(Point(col, row))
                            }
                        }
                    }
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val margin = size.width * (if (boardSize == 19) 0.052f else if (boardSize == 13) 0.065f else 0.085f)
                    val playArea = size.width - margin * 2
                    val step = playArea / (boardSize - 1)
                    val stoneRadius = step * 0.47f

                    // Grid lines
                    for (i in 0 until boardSize) {
                        val pos = margin + i * step
                        drawLine(
                            color = Color(0xFF57310E),
                            start = Offset(pos, margin),
                            end = Offset(pos, size.height - margin),
                            strokeWidth = 2f
                        )
                        drawLine(
                            color = Color(0xFF57310E),
                            start = Offset(margin, pos),
                            end = Offset(size.width - margin, pos),
                            strokeWidth = 2f
                        )
                    }

                    // Stones
                    for (y in 0 until boardSize) {
                        for (x in 0 until boardSize) {
                            val stone = board.grid[y][x]
                            val cx = margin + x * step
                            val cy = margin + y * step

                            if (stone != null) {
                                drawCircle(
                                    color = if (stone == StoneColor.BLACK) Color(0xFF18181A) else Color(0xFFF7F5ED),
                                    radius = stoneRadius,
                                    center = Offset(cx, cy)
                                )
                                drawCircle(
                                    color = if (stone == StoneColor.BLACK) Color(0xFF4A4A4A) else Color(0xFFC7BAA7),
                                    radius = stoneRadius,
                                    center = Offset(cx, cy),
                                    style = Stroke(width = 1.5f)
                                )

                                // Last move dot
                                if (lastMove?.x == x && lastMove?.y == y) {
                                    drawCircle(
                                        color = Color(0xFFC28E46),
                                        radius = stoneRadius * 0.28f,
                                        center = Offset(cx, cy)
                                    )
                                }
                            }

                            // Ghost Move Hint glow
                            if (ghostHint?.x == x && ghostHint?.y == y && stone == null) {
                                drawCircle(
                                    color = Color(0xFFF59E0B),
                                    radius = stoneRadius * 0.65f,
                                    center = Offset(cx, cy),
                                    style = Stroke(width = 3.5f)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Game Controls Row: Pass, Resign, Undo, Ghost Move
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Button(
                    onClick = {
                        consecutivePasses++
                        turnColor = turnColor.opponent()
                        if (consecutivePasses >= 2) {
                            gameScore = board.calculateTerritory(6.5)
                            showGameOverDialog = true
                            onShowInterstitial {}
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF26211B)),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text("Pass", color = Color(0xFFF4EFE6), fontSize = 11.sp)
                }

                Button(
                    onClick = {
                        showGameOverDialog = true
                        onShowInterstitial {}
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF381A1A)),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text("Resign", color = Color(0xFFFF9999), fontSize = 11.sp)
                }

                Button(
                    onClick = { clearBoardForStudy() },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF26211B)),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    Text("Clear (Study)", color = Color(0xFFF59E0B), fontSize = 11.sp)
                }
            }

            // Ghost Move Hint (Rewarded Ad)
            Button(
                onClick = {
                    onShowRewardedHint(
                        {
                            val hint = GoAI.getGhostHint(board, turnColor)
                            ghostHint = hint?.point
                        },
                        {}
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC28E46)),
                shape = RoundedCornerShape(6.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text("★ Ghost Move Hint", color = Color(0xFF16120C), fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        }

        // Official AdMob Banner (Strictly placed outside playing board)
        AdMobBannerView(
            modifier = Modifier.padding(top = 2.dp)
        )
    }

    // Game Over & Territory Score Dialog
    if (showGameOverDialog) {
        AlertDialog(
            onDismissRequest = { showGameOverDialog = false },
            title = { Text("Game Concluded", color = Color(0xFFF5EBD9)) },
            text = {
                Column {
                    if (gameScore != null) {
                        Text("Black Score: ${gameScore!!.first}", color = Color(0xFFD6C9B6), fontSize = 13.sp)
                        Text("White Score (+6.5 Komi): ${gameScore!!.second}", color = Color(0xFFD6C9B6), fontSize = 13.sp)
                        val winner = if (gameScore!!.first > gameScore!!.second) "Black (흑)" else "White (백)"
                        Text("Winner: $winner", color = Color(0xFFC28E46), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    } else {
                        Text("Player Resigned.", color = Color(0xFFD6C9B6))
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { resetGame() },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC28E46))
                ) {
                    Text("Play Again", color = Color(0xFF16120C))
                }
            },
            containerColor = Color(0xFF1A1714)
        )
    }
}
