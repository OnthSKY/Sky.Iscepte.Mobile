# ProGuard Rules for React Native + Expo
#
# NEDEN: Code obfuscation sırasında gerekli class'ları korumak için
# - React Native core classes
# - Expo modules
# - Third-party libraries
# - Reflection kullanan kodlar

# Add project specific ProGuard rules here.

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.UIProp <fields>;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# React Native - Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native - JSC
-keep class org.webkit.** { *; }

# Expo
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# Expo - Constants
-keep class expo.modules.constants.** { *; }

# Expo - Image
-keep class expo.modules.image.** { *; }

# Expo - Notifications
-keep class expo.modules.notifications.** { *; }

# React Navigation
-keep class com.reactnavigation.** { *; }
-dontwarn com.reactnavigation.**

# React Native Keychain
-keep class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# React Native Paper
-keep class com.callstack.reactnativepaper.** { *; }
-dontwarn com.callstack.reactnativepaper.**

# Sentry
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep serialization classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Parcelable
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

# Keep annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep line numbers for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep custom exceptions
-keep public class * extends java.lang.Exception

# Remove logging in release (optional)
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Keep native method names for debugging (optional, remove for stronger obfuscation)
# -keepclasseswithmembernames,includedescriptorclasses class * {
#     native <methods>;
# }

