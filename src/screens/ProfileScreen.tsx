import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../core/contexts/ThemeContext";
import { useAppStore } from "../store/useAppStore";
import LanguagePicker from "../shared/components/LanguagePicker";
import ThemeGradientToggle from "../shared/components/ThemeGradientToggle";
import ConfirmDialog from "../shared/components/ConfirmDialog";
import ErrorReportModal from "../shared/components/ErrorReportModal";
import ScreenLayout from "../shared/layouts/ScreenLayout";
import spacing from "../core/constants/spacing";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(["common", "settings"]);
  const logout = useAppStore((s) => s.logout);
  const user = useAppStore((s) => s.user);
  const role = useAppStore((s) => s.role);
  const [logoutVisible, setLogoutVisible] = React.useState(false);
  const [contactVisible, setContactVisible] = React.useState(false);

  const initials =
    user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  const styles = getStyles(colors);

  // ---- Section component (içte tanımlandı, styles erişebilir)
  const Section = ({ title, children }: any) => (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );

  // ---- Info row component (içte tanımlandı)
  const Info = ({ icon, label, value }: any) => (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "-"}</Text>
      </View>
    </View>
  );

  return (
    <ScreenLayout title={t("profile")}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <LinearGradient
          colors={colors.gradient as [string, string]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{role?.toUpperCase() || t("common:guest")}</Text>
        </LinearGradient>

        {/* KİŞİSEL BİLGİLER */}
        <Section title={t("settings:personal_info")}>
          <Info icon="person-outline" label={t("common:name")} value={user?.name} />
          <Info icon="call-outline" label={t("common:phone")} value={user?.phone} />
          <Info icon="business-outline" label={t("settings:company")} value={user?.company} />
        </Section>

        {/* TERCİHLER */}
        <Section title={t("settings:preferences")}>
          <View style={styles.rowBetween}>
            <View style={styles.prefItem}>
              <Text style={styles.prefLabel}>{t("settings:language")}</Text>
              <LanguagePicker showLabel={false} />
            </View>
            <View style={styles.prefItem}>
              <Text style={styles.prefLabel}>{t("settings:theme")}</Text>
              <ThemeGradientToggle />
            </View>
          </View>
        </Section>

        {/* HESAP */}
        <Section title={t("settings:account")}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setLogoutVisible(true)}
          >
            <LinearGradient
              colors={["#ff5f6d", "#ffc371"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>{t("common:logout")}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => setContactVisible(true)}
          >
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>{t("common:contact_us")}</Text>
          </TouchableOpacity>
        </Section>

        <Text style={styles.footerText}>İşÇepte v1.0.0 © 2025</Text>
      </ScrollView>

      {/* MODALS */}
      <ConfirmDialog
        visible={logoutVisible}
        title={t("common:logout_confirm_title")}
        message={t("common:logout_confirm_message")}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={logout}
      />

      <ErrorReportModal
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
        mode="contact"
      />
    </ScreenLayout>
  );
}

// ---- STYLES
const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { padding: spacing.lg, gap: spacing.lg },
    header: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      paddingVertical: spacing.xl,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.5)",
    },
    avatarText: { fontSize: 34, fontWeight: "bold", color: "#fff" },
    name: { color: "#fff", fontWeight: "700", fontSize: 20, marginTop: spacing.md },
    role: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },

    section: {
      borderRadius: 16,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    sectionTitle: {
      fontWeight: "700",
      fontSize: 14,
      color: colors.muted,
      marginBottom: spacing.md,
      textTransform: "uppercase",
    },
    sectionBody: { gap: spacing.md },

    infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    infoText: { flex: 1 },
    infoLabel: { fontSize: 12, color: colors.muted },
    infoValue: { fontSize: 16, color: colors.text, fontWeight: "500" },

    rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: spacing.lg },
    prefItem: { flex: 1, gap: spacing.sm },
    prefLabel: { fontWeight: "600", color: colors.text },

    logoutBtn: { marginTop: spacing.md },
    logoutGradient: {
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: 12,
    },
    logoutText: { color: "#fff", fontWeight: "bold" },

    contactRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.md, gap: 8 },
    contactText: { color: colors.primary, fontWeight: "500" },
    footerText: {
      textAlign: "center",
      fontSize: 12,
      color: colors.muted,
      marginTop: spacing.lg,
    },
  });
