import React, { useState } from 'react';
import { ADMOB_CONFIG } from '../ads/admobConfig';
import { 
  Download, 
  Smartphone, 
  FileCode, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  FolderArchive,
  Layers,
  Copy,
  Check
} from 'lucide-react';

export const AndroidProjectHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'code' | 'admob'>('downloads');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full flex flex-col bg-[#191714] border border-[#2e2821] rounded-xl overflow-hidden text-[#f4efe6]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#141210] border-b border-[#29241d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#c28e46]" />
          <div>
            <h3 className="font-bold text-sm text-[#f5ebd9] font-display">
              Android Production Delivery & Studio Project Hub
            </h3>
            <p className="text-[11px] text-[#8c806f]">
              com.pixelfork.g.game · Version 1.3 (3) · Target SDK 36 · Developer: Shahab Millizai
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#211d19] p-1 rounded-lg border border-[#332b22] text-xs">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'downloads'
                ? 'bg-[#c28e46] text-[#16120c]'
                : 'text-[#a39785] hover:text-[#f4efe6]'
            }`}
          >
            Downloads & APK
          </button>
          <button
            onClick={() => setActiveTab('admob')}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'admob'
                ? 'bg-[#c28e46] text-[#16120c]'
                : 'text-[#a39785] hover:text-[#f4efe6]'
            }`}
          >
            AdMob Real Units
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'bg-[#c28e46] text-[#16120c]'
                : 'text-[#a39785] hover:text-[#f4efe6]'
            }`}
          >
            Native Kotlin Source
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4">
        {activeTab === 'downloads' && (
          <div className="space-y-4">
            {/* Primary Download Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* APK Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#241f19] to-[#1c1814] border border-[#42372b] flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      Signed & Verified Release
                    </span>
                    <span className="text-[11px] text-[#8c806f]">v1.3 (Code 3)</span>
                  </div>

                  <h4 className="text-base font-bold text-[#f5ebd9] mb-1 font-display">
                    GhostMoveGo-v1.3-release.apk
                  </h4>
                  <p className="text-xs text-[#a89b88] leading-relaxed mb-3">
                    Cryptographically signed release APK ready for testing and sideloading on Android devices or updating Amazon Appstore / Google Play.
                  </p>

                  <div className="space-y-1 text-[11px] text-[#8f8372] bg-[#171411] p-2.5 rounded-lg border border-[#2b251e] mb-4">
                    <div className="flex justify-between">
                      <span>Package ID:</span>
                      <span className="font-mono text-[#c28e46] font-semibold">{ADMOB_CONFIG.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signatures:</span>
                      <span className="font-mono text-emerald-400">v1 (JAR) + v2 + v3 (APK)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min / Target SDK:</span>
                      <span className="font-mono text-[#e0d6c5]">API 24 / API 36</span>
                    </div>
                  </div>
                </div>

                <a
                  href="/download/GhostMoveGo-v1.3-release.apk"
                  download="GhostMoveGo-v1.3-release.apk"
                  className="w-full py-2.5 bg-gradient-to-r from-[#c28e46] to-[#d69f53] hover:from-[#d69f53] hover:to-[#e8b267] text-[#16120c] font-bold text-xs rounded-lg transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed Release APK</span>
                </a>
              </div>

              {/* Android Studio Zip Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#241f19] to-[#1c1814] border border-[#42372b] flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800/40">
                      Editable Studio Project
                    </span>
                    <span className="text-[11px] text-[#8c806f]">Gradle 8.7 · Kotlin 2.0</span>
                  </div>

                  <h4 className="text-base font-bold text-[#f5ebd9] mb-1 font-display">
                    GhostMoveGo-AndroidStudio-Project.zip
                  </h4>
                  <p className="text-xs text-[#a89b88] leading-relaxed mb-3">
                    Full native Kotlin + Jetpack Compose source code project. Extract and open directly in Android Studio Ladybug or newer.
                  </p>

                  <div className="space-y-1 text-[11px] text-[#8f8372] bg-[#171411] p-2.5 rounded-lg border border-[#2b251e] mb-4">
                    <div className="flex justify-between">
                      <span>Architecture:</span>
                      <span className="text-[#e0d6c5]">Jetpack Compose Canvas</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AdMob SDK:</span>
                      <span className="font-mono text-[#c28e46]">play-services-ads:23.6.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Build Status:</span>
                      <span className="text-emerald-400 font-semibold">Turnkey Ready</span>
                    </div>
                  </div>
                </div>

                <a
                  href="/download/GhostMoveGo-AndroidStudio-Project.zip"
                  download="GhostMoveGo-AndroidStudio-Project.zip"
                  className="w-full py-2.5 bg-[#2c2620] hover:bg-[#3a322a] border border-[#4a3e31] text-[#f4efe6] font-bold text-xs rounded-lg transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FolderArchive className="w-4 h-4 text-[#c28e46]" />
                  <span>Download Full Android Studio ZIP</span>
                </a>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="p-3 bg-[#171411] border border-[#2b251e] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#a89b88]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Amazon Appstore Update Ready (Preserves package namespace & signing capability)</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>Version: <strong className="text-[#f4efe6]">1.3</strong></span>
                <span>Code: <strong className="text-[#f4efe6]">3</strong></span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admob' && (
          <div className="space-y-3">
            <div className="text-xs text-[#b5a997] mb-2">
              Official Google Mobile Ads IDs configured in the app manifest and code:
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'AdMob App ID', id: ADMOB_CONFIG.appId, placement: 'AndroidManifest.xml metadata' },
                { label: 'Banner Ad Unit', id: ADMOB_CONFIG.bannerAdUnitId, placement: 'Bottom of menus & game screen outside board' },
                { label: 'Interstitial Ad Unit', id: ADMOB_CONFIG.interstitialAdUnitId, placement: 'After completed match with frequency cap' },
                { label: 'Rewarded Interstitial', id: ADMOB_CONFIG.rewardedInterstitialAdUnitId, placement: 'Watch for Ghost Move Hint button' },
                { label: 'App Open Ad Unit', id: ADMOB_CONFIG.appOpenAdUnitId, placement: 'Cold launch and return from 4+ hours' },
              ].map((item, idx) => (
                <div
                  key={`admob-${idx}`}
                  className="p-3 bg-[#201c18] border border-[#332b22] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#f5ebd9]">{item.label}</span>
                      <span className="text-[10px] text-[#8c806f]">({item.placement})</span>
                    </div>
                    <code className="text-[11px] font-mono text-[#c28e46] select-all">
                      {item.id}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.id, `ad-${idx}`)}
                    className="self-start sm:self-center px-2.5 py-1 bg-[#2b241e] hover:bg-[#382f27] text-[11px] rounded flex items-center gap-1 text-[#d6c9b6] transition-colors cursor-pointer"
                  >
                    {copiedField === `ad-${idx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#a89b88]" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="text-xs text-[#8c806f]">
              Source files included in the project archive:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { file: 'MainActivity.kt', path: 'app/src/main/java/com/pixelfork/g/game/MainActivity.kt', desc: 'Jetpack Compose game screen & ad controller' },
                { file: 'GhostMoveGoApplication.kt', path: 'app/src/main/java/com/pixelfork/g/game/GhostMoveGoApplication.kt', desc: 'AdMob initialization & App Open Ad manager' },
                { file: 'GoRules.kt', path: 'app/src/main/java/com/pixelfork/g/game/engine/GoRules.kt', desc: 'Kotlin Baduk rules, group flood fill & Ko' },
                { file: 'GoAI.kt', path: 'app/src/main/java/com/pixelfork/g/game/engine/GoAI.kt', desc: 'Strategic AI engine & Gwisu hint calculator' },
                { file: 'AdMobManager.kt', path: 'app/src/main/java/com/pixelfork/g/game/ads/AdMobManager.kt', desc: 'Official Google Mobile Ads integration' },
                { file: 'AndroidManifest.xml', path: 'app/src/main/AndroidManifest.xml', desc: 'Package com.pixelfork.g.game & AdMob App ID' },
              ].map((item, idx) => (
                <div key={`file-${idx}`} className="p-2.5 bg-[#201c18] border border-[#332b22] rounded-lg">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#e8c894] font-semibold mb-0.5">
                    <FileCode className="w-3.5 h-3.5 text-[#c28e46]" />
                    <span>{item.file}</span>
                  </div>
                  <div className="text-[10px] text-[#736a5c] font-mono truncate mb-1">{item.path}</div>
                  <div className="text-[11px] text-[#a89b88]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
