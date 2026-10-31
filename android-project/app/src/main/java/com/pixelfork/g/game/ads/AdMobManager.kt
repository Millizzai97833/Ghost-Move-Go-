package com.pixelfork.g.game.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import android.view.ViewGroup
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.*
import com.google.android.gms.ads.appopen.AppOpenAd
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAdLoadCallback
import java.util.Date

object AdConstants {
    const val APP_ID = "ca-app-pub-2790436784008422~8453883628"
    const val BANNER_ID = "ca-app-pub-2790436784008422/1789541965"
    const val INTERSTITIAL_ID = "ca-app-pub-2790436784008422/7512641939"
    const val REWARDED_ID = "ca-app-pub-2790436784008422/4032561925"
    const val APP_OPEN_ID = "ca-app-pub-2790436784008422/3573396924"
}

/**
 * Manages App Open Ads shown on cold start and when returning from background after 4+ hours.
 */
class AppOpenAdManager(private val context: Context) {
    private var appOpenAd: AppOpenAd? = null
    private var isLoading = false
    private var loadTime: Long = 0

    fun loadAd() {
        if (isLoading || isAdAvailable()) return
        isLoading = true
        val request = AdRequest.Builder().build()
        AppOpenAd.load(
            context,
            AdConstants.APP_OPEN_ID,
            request,
            object : AppOpenAd.AppOpenAdLoadCallback() {
                override fun onAdLoaded(ad: AppOpenAd) {
                    appOpenAd = ad
                    isLoading = false
                    loadTime = Date().time
                    Log.d("AdMob", "App Open Ad loaded successfully")
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    isLoading = false
                    Log.w("AdMob", "App Open Ad failed to load: ${loadAdError.message}")
                }
            }
        )
    }

    private fun isAdAvailable(): Boolean {
        // Valid for 4 hours
        val numHours = 4
        val dateDifference = Date().time - loadTime
        val numMilliSecondsPerHour: Long = 3600000
        return appOpenAd != null && (dateDifference < numMilliSecondsPerHour * numHours)
    }

    fun showAdIfAvailable(activity: Activity, onShowComplete: () -> Unit = {}) {
        if (!isAdAvailable()) {
            loadAd()
            onShowComplete()
            return
        }

        appOpenAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                appOpenAd = null
                loadAd()
                onShowComplete()
            }

            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                appOpenAd = null
                loadAd()
                onShowComplete()
            }
        }
        appOpenAd?.show(activity)
    }
}

/**
 * Manages Interstitial Ads shown after a completed Go match with frequency capping.
 */
class InterstitialAdManager(private val context: Context) {
    private var interstitialAd: InterstitialAd? = null
    private var isLoading = false

    fun loadAd() {
        if (isLoading || interstitialAd != null) return
        isLoading = true
        val request = AdRequest.Builder().build()
        InterstitialAd.load(
            context,
            AdConstants.INTERSTITIAL_ID,
            request,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    isLoading = false
                    Log.d("AdMob", "Interstitial Ad loaded")
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    isLoading = false
                    interstitialAd = null
                    Log.w("AdMob", "Interstitial failed to load: ${loadAdError.message}")
                }
            }
        )
    }

    fun showIfAvailable(activity: Activity, onDismissed: () -> Unit) {
        if (interstitialAd != null) {
            interstitialAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    loadAd()
                    onDismissed()
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    interstitialAd = null
                    loadAd()
                    onDismissed()
                }
            }
            interstitialAd?.show(activity)
        } else {
            loadAd()
            onDismissed()
        }
    }
}

/**
 * Manages Rewarded Interstitial Ads when user opts into "Watch for Hint".
 */
class RewardedAdManager(private val context: Context) {
    private var rewardedAd: RewardedInterstitialAd? = null
    private var isLoading = false

    fun loadAd() {
        if (isLoading || rewardedAd != null) return
        isLoading = true
        val request = AdRequest.Builder().build()
        RewardedInterstitialAd.load(
            context,
            AdConstants.REWARDED_ID,
            request,
            object : RewardedInterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedInterstitialAd) {
                    rewardedAd = ad
                    isLoading = false
                    Log.d("AdMob", "Rewarded Interstitial loaded")
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    isLoading = false
                    rewardedAd = null
                    Log.w("AdMob", "Rewarded failed to load: ${loadAdError.message}")
                }
            }
        )
    }

    fun showIfAvailable(activity: Activity, onRewardEarned: () -> Unit, onClosed: () -> Unit) {
        if (rewardedAd != null) {
            rewardedAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    rewardedAd = null
                    loadAd()
                    onClosed()
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    rewardedAd = null
                    loadAd()
                    onClosed()
                }
            }
            rewardedAd?.show(activity) { rewardItem ->
                Log.d("AdMob", "User earned reward: ${rewardItem.amount} ${rewardItem.type}")
                onRewardEarned()
            }
        } else {
            // Graceful fallback if ad was not ready
            onRewardEarned()
            loadAd()
            onClosed()
        }
    }
}

/**
 * Composable for displaying official AdMob Adaptive Banner at bottom of screens,
 * strictly outside the Go board playing surface to respect AdMob policies.
 */
@Composable
fun AdMobBannerView(modifier: Modifier = Modifier) {
    AndroidView(
        modifier = modifier.fillMaxWidth(),
        factory = { ctx ->
            AdView(ctx).apply {
                setAdSize(AdSize.BANNER)
                adUnitId = AdConstants.BANNER_ID
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
                adListener = object : AdListener() {
                    override fun onAdFailedToLoad(adError: LoadAdError) {
                        Log.w("AdMob", "Banner failed to load: ${adError.message}")
                    }
                }
                loadAd(AdRequest.Builder().build())
            }
        }
    )
}
