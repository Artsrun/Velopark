# ANDROID BUILD TUTORIAL #
=============================================
## How to Sign and Publish a Phonegap App in the Google Play Store ##

Update- I’ve now figured out an easier way to do this in one command instead of 5 (Android Automation)
So you’ve got your awesome app programmed, tested, added a cool icon, and you want to get it out to the world? It’s pretty easy to get android apps on your phone when testing, but you have to jump through a few hoops to actually get it in the Google Play store.
It was pretty hard to find a good guide out there on the Internet about what to do to finally get your app to submit to the Google Play Store for Android. The official documentation is pretty wordy and somewhat vague. These instructions are specifically for apps built with Phonegap, because that’s what I used, but it might be helpful for other people as well.
Make sure your app is good to go
Make sure you’ve set your versionName in www/config.xml and versionCode  platforms/android/AndroidManifest.xml. The reason you have to set the versionName in config.xml inside the www folder is because phonegap will overwrite the versionName in the androidManifest file with whatever is in config.xml. Google Play won’t accept the app unless the versionCode is different than the previous versions in the store (preferably larger). versionCode is an integer value, so just increment it by 1 each time you submit regardless of whether it’s a major or minor update. versionName isn’t used for anything except for displaying to users and it’s a string so you can name it whatever you want. For example, you could set it to 1.0.3 while versionCode might be 3. (http://developer.android.com/tools/publishing/versioning.html#appversioning)

<manifestandroid:hardwareAccelerated="true"android:versionCode="3"android:versionName="1.0.3"android:windowSoftInputMode="adjustPan"package="com.compay.app"xmlns:android="http://schemas.android.com/apk/res/android">

Also, make sure you set debuggable to false in AndroidoManifest.xml in the application tag like this: android:debuggable=”false”


## Create a keystore file ##
Create a keystore file and set a password. I won’t go into a lot of detail about how to actually do this. Just make sure you don’t lose this file. If you lose it, and you have to create a new one, then it will become a new app when you try to add it to the Google Play Store. (http://developer.android.com/tools/publishing/app-signing.html#cert)
Always use a different keystore file for each app because it’s your private key for uploading apps to the store. If you ever decide to transfer your app to another developer, you’ll have to give them the keystore file, and if you also use that keystore for other apps, then you have a security issue. (http://developer.android.com/tools/publishing/app-signing.html#secure-key)
Put the keystore file somewhere on your computer. It doesn’t really matter where.

The command that you have provided for generating the keystore is correct i.e.

```
#!

keytool -v -genkey -v -keystore just2try.keystore -alias someKindOfName -keyalg RSA -validity 10000
```

Please do the following. Do not copy it, since I believe the error that you are seeing it related to some special characters. Type the whole thing as is in your command prompt or shell.
The just2try.keystore is any name for your Java based keystore file. You can select any name as you have done or give it some name that you know you can identify the keystore file with.
Finally, keep in mind that a keystore is like a collection of keys, where each one is identified by a name or an alias. So you should pick an alias that you know identifies the specific key. Examples : myorgkey, myandroidappkey, etc.
In case, you forget what alias' are present in the keystore, you can always use the -list command to see all the keys in the keystore. Example : keytool -v -list -keystore just2try.keystore

## Tell ant where your keystore file is for this app ##
Then you just need to tell ant where the keystore file is by going to your android project folder (For phonegap it’s in platforms/android) and create an ant.properties file and put the following in it:
key.store=/Users/username/Documents/path/to/my-release-key.keystorekey.alias=app_name
Where key.store equals the path to the keystore file starting at the C Drive if you’re on windows and it’s a relative path starting from the location of the ant.properties file if you’re on mac (example: key.store=../../../../lifeUnlimited-release-key.keystore), and key.Alias is whatever you setup when you created the keystore.

## Build your app ##
Open up the command prompt, and navigate to your project and run phonegap build.

```
#!

phonegap build android
```

in platforms/android/bin you should have:
AppName.ap_AppName.ap_.dAppName-debug.apkAppName-debug-unaligned.apkAppName-debug-unaligned.apk.d
Sign in release mode
Then navigate to the android directory and run ant release:

```
#!

cd platforms/android ant release
```

It might prompt you for your keystore password and the password for the alias ‘app_name’. Enter your keystore password for both of them.
In platforms/android/bin you should now also have release versions of the app:
AppName-release.apk AppName-release-unaligned.apk AppName-release-unsigned.apk AppName-release-unsigned.apk.d

If you get

```
#!

Buildfile: build.xml does not exist!
Build failed
```

Solution
Run

```
#!

android update project --target 5 --path /path/to/android/project
```

or, if you are in your project's root directory already:

```
#!

android update project --target 5 --path .
```

target is the build target for your project. Run

```
#!

android list targets
```

to get a list of all available targets.


Now move into the bin directory and run these jarsigner commands:

```
#!

cd bin jarsigner-verbose-sigalgSHA1withRSA-digestalgSHA1-keystore/Users/username/Documents/path/to/my-release-key.keystore AppName-release-unsigned.apkapp_name
```

Enter your keystore password

```
#!

Jarsigner -verify-verbose-certs AppName-release-unsigned.apk
```

If you get a warning like this ignore it: Warning: This jar contains entries whose certificate chain is not validated.
Then run this zipalign command to create the final apk file:

```
#!

zipalign-v4 AppName-release-unsigned.apkAppName.apk
```

it will say: Verification successful
And your final apk (AppName.apk) will be created in the bin directory.
(http://developer.android.com/tools/publishing/app-signing.html#releasemode)
Then you can upload to Google Play.
I hope this helps. Let me know if you have any questions.