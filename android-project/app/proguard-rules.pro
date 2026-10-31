# Proguard rules for GHOST MOVE GO (com.pixelfork.g.game)

# Google Mobile Ads rules
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Keep models & engine
-keep class com.pixelfork.g.game.engine.** { *; }
-keep class com.pixelfork.g.game.ads.** { *; }
