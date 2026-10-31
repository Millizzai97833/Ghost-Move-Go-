#!/usr/bin/env python3
"""
GHOST MOVE GO - Android APK & Studio Project Builder
Compiles resources, builds classes.dex, packages and signs release APK,
and creates the complete Android Studio project zip archive.
"""

import os
import subprocess
import shutil
import zipfile

BASE_DIR = "/app/applet"
ANDROID_DIR = os.path.join(BASE_DIR, "android-project")
PUBLIC_DOWNLOAD_DIR = os.path.join(BASE_DIR, "public", "download")
BUILD_DIR = "/tmp/apk_build"

os.makedirs(PUBLIC_DOWNLOAD_DIR, exist_ok=True)
os.makedirs(BUILD_DIR, exist_ok=True)

ANDROID_JAR = "/usr/lib/android-sdk/platforms/android-23/android.jar"
PACKAGE_NAME = "com.pixelfork.g.game"

print("1. Creating Android Studio project ZIP...")
zip_path = os.path.join(PUBLIC_DOWNLOAD_DIR, "GhostMoveGo-AndroidStudio-Project.zip")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(ANDROID_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ANDROID_DIR)
            zipf.write(full_path, arcname=f"GhostMoveGo/{rel_path}")

print(f"Created: {zip_path} ({os.path.getsize(zip_path)} bytes)")

print("2. Compiling Android Java entrypoints...")
java_src_dir = os.path.join(BUILD_DIR, "src", "com", "pixelfork", "g", "game")
os.makedirs(java_src_dir, exist_ok=True)

# Create a clean Java implementation of the Application and Activity so javac + dx can compile it directly
java_code_app = """package com.pixelfork.g.game;

import android.app.Application;
import android.util.Log;

public class GhostMoveGoApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        Log.i("GhostMoveGo", "GHOST MOVE GO Initialized. Package: com.pixelfork.g.game");
    }
}
"""

java_code_main = """package com.pixelfork.g.game;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        FrameLayout layout = new FrameLayout(this);
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        webView.setWebViewClient(new WebViewClient());
        // Load the embedded Go board game interface or local assets
        webView.loadUrl("file:///android_asset/index.html");

        layout.addView(webView);
        setContentView(layout);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
"""

with open(os.path.join(java_src_dir, "GhostMoveGoApplication.java"), "w") as f:
    f.write(java_code_app)

with open(os.path.join(java_src_dir, "MainActivity.java"), "w") as f:
    f.write(java_code_main)

# Compile Java classes
classes_dir = os.path.join(BUILD_DIR, "classes")
os.makedirs(classes_dir, exist_ok=True)

cmd_javac = [
    "javac", "-source", "1.8", "-target", "1.8",
    "-cp", ANDROID_JAR,
    "-d", classes_dir,
    os.path.join(java_src_dir, "GhostMoveGoApplication.java"),
    os.path.join(java_src_dir, "MainActivity.java")
]
subprocess.run(cmd_javac, check=True)

# Generate classes.dex with dx
print("3. Converting bytecode to Dalvik Executable (classes.dex)...")
dex_file = os.path.join(BUILD_DIR, "classes.dex")
cmd_dx = ["dx", "--dex", f"--output={dex_file}", classes_dir]
subprocess.run(cmd_dx, check=True)

# Compile Android resources and manifest using aapt
print("4. Packaging resources and AndroidManifest with aapt...")
manifest_file = os.path.join(ANDROID_DIR, "app", "src", "main", "AndroidManifest.xml")
res_dir = os.path.join(ANDROID_DIR, "app", "src", "main", "res")
unaligned_apk = os.path.join(BUILD_DIR, "unaligned.apk")

cmd_aapt = [
    "aapt", "package", "-f", "-m",
    "-F", unaligned_apk,
    "-M", manifest_file,
    "-S", res_dir,
    "-I", ANDROID_JAR
]
subprocess.run(cmd_aapt, check=True)

# Add classes.dex into unaligned.apk
cmd_add_dex = ["aapt", "add", unaligned_apk, dex_file]
subprocess.run(["aapt", "add", "-k", unaligned_apk, "classes.dex"], cwd=BUILD_DIR, check=True)

# Generate release keystore for signing
print("5. Generating cryptographic release keystore...")
keystore_file = os.path.join(BUILD_DIR, "release.keystore")
alias = "ghostmovego"
storepass = "shahabmillizai"

if not os.path.exists(keystore_file):
    cmd_keytool = [
        "keytool", "-genkeypair", "-v",
        "-keystore", keystore_file,
        "-alias", alias,
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", "10000",
        "-storepass", storepass,
        "-keypass", storepass,
        "-dname", "CN=Shahab Millizai, OU=PixelFork, O=PixelFork Games, L=Seoul, ST=KR, C=KR"
    ]
    subprocess.run(cmd_keytool, check=True)

# Sign APK with jarsigner (v1 signature) and apksigner (v2/v3 signatures)
print("6. Signing APK with release keystore...")
signed_apk = os.path.join(PUBLIC_DOWNLOAD_DIR, "GhostMoveGo-v1.3-release.apk")
shutil.copyfile(unaligned_apk, signed_apk)

cmd_sign = [
    "jarsigner", "-verbose",
    "-sigalg", "SHA256withRSA",
    "-digestalg", "SHA-256",
    "-keystore", keystore_file,
    "-storepass", storepass,
    "-keypass", storepass,
    signed_apk,
    alias
]
subprocess.run(cmd_sign, check=True)

# Apply apksigner v2/v3 signature
cmd_apksigner = [
    "apksigner", "sign",
    "--ks", keystore_file,
    "--ks-pass", f"pass:{storepass}",
    "--ks-key-alias", alias,
    "--key-pass", f"pass:{storepass}",
    signed_apk
]
subprocess.run(cmd_apksigner, check=True)

# Verify signature
cmd_verify = ["apksigner", "verify", "--verbose", signed_apk]
verify_res = subprocess.run(cmd_verify, capture_output=True, text=True)
print("Signature verification output:")
print(verify_res.stdout)

print(f"\nSUCCESS: Release APK generated at {signed_apk} ({os.path.getsize(signed_apk)} bytes)")
