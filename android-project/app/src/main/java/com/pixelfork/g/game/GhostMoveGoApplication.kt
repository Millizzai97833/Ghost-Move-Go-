package com.pixelfork.g.game

import android.app.Application
import android.util.Log
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.appopen.AppOpenAd
import com.pixelfork.g.game.ads.AppOpenAdManager

class GhostMoveGoApplication : Application() {

    lateinit var appOpenAdManager: AppOpenAdManager
        private set

    override fun onCreate() {
        super.onCreate()
        Log.d("GhostMoveGo", "Initializing Mobile Ads SDK...")
        
        // Initialize Google Mobile Ads SDK
        MobileAds.initialize(this) { initializationStatus ->
            Log.d("GhostMoveGo", "AdMob MobileAds initialized: $initializationStatus")
        }

        // Initialize App Open Ad Manager for cold start & return transitions (4+ hours)
        appOpenAdManager = AppOpenAdManager(this)
        appOpenAdManager.loadAd()
    }
}
