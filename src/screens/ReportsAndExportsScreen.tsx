import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

export default function ReportsAndExportsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()} testID="back-btn">
          <Text>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Reports</Text>

        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.pageTitle}>Export Data</Text>
          <Text style={styles.pageSubtitle}>
            Select report type and date range.
          </Text>
        </View>

        {/* Report Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REPORT TYPE</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cardRow}>
              {/* Active Card */}
              <View style={[styles.reportCard, styles.reportCardActive]}>
                <View style={styles.cardIconActive}>
                  <Text>🏢</Text>
                </View>
                <View>
                  <Text style={styles.cardMetaActive}>Project</Text>
                  <Text style={styles.cardTitleActive}>Expense</Text>
                </View>
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </View>

              {/* Other Cards */}
              <View style={styles.reportCard}>
                <View style={styles.cardIcon}>
                  <Text>📊</Text>
                </View>
                <View>
                  <Text style={styles.cardMeta}>Finance</Text>
                  <Text style={styles.cardTitle}>Profit & Loss</Text>
                </View>
              </View>

              <View style={styles.reportCard}>
                <View style={styles.cardIcon}>
                  <Text>⏱</Text>
                </View>
                <View>
                  <Text style={styles.cardMeta}>Team</Text>
                  <Text style={styles.cardTitle}>Time Summary</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Scope & Period */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SCOPE & PERIOD</Text>

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Select Project</Text>
            <View style={styles.selectBox}>
              <Text style={styles.selectText}>Skyline Tower A</Text>
              <Text style={styles.selectArrow}>⌄</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectText}>Sep 01, 2023</Text>
              </View>
            </View>

            <View style={styles.dateBox}>
              <Text style={styles.inputLabel}>End Date</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectText}>Sep 30, 2023</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Format */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FORMAT</Text>

          <View style={styles.formatRow}>
            <View style={[styles.formatChip, styles.formatActive]}>
              <Text style={styles.formatTextActive}>PDF</Text>
            </View>
            <View style={styles.formatChip}>
              <Text style={styles.formatText}>Excel</Text>
            </View>
            <View style={styles.formatChip}>
              <Text style={styles.formatText}>CSV</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Recent Exports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>RECENT EXPORTS</Text>
            <Text style={styles.link}>View All</Text>
          </View>

          <View style={styles.exportItem}>
            <View style={styles.exportLeft}>
              <View style={[styles.fileIcon, { backgroundColor: '#fee2e2' }]}>
                <Text>📄</Text>
              </View>
              <View>
                <Text style={styles.fileName}>
                  Skyline_Exp_Aug.pdf
                </Text>
                <Text style={styles.fileMeta}>
                  Aug 01 - Aug 31 • 2.4 MB
                </Text>
              </View>
            </View>
            <Text style={styles.downloadIcon}>⬇</Text>
          </View>

          <View style={styles.exportItem}>
            <View style={styles.exportLeft}>
              <View style={[styles.fileIcon, { backgroundColor: '#dcfce7' }]}>
                <Text>📊</Text>
              </View>
              <View>
                <Text style={styles.fileName}>
                  Full_Summary_Q2.xlsx
                </Text>
                <Text style={styles.fileMeta}>
                  Apr 01 - Jun 30 • 5.1 MB
                </Text>
              </View>
            </View>
            <Text style={styles.downloadIcon}>⬇</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>
            Generate & Download
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f6f7f8',
  },
  iconBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },

  content: { padding: 20 },

  intro: { marginBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '800' },
  pageSubtitle: { fontSize: 16, color: '#64748b' },

  section: { marginTop: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: { color: '#136dec', fontSize: 12, fontWeight: '600' },

  cardRow: { flexDirection: 'row', gap: 12 },
  reportCard: {
    width: 128,
    height: 112,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'space-between',
  },
  reportCardActive: {
    backgroundColor: '#136dec',
    borderColor: '#136dec',
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: { fontSize: 12, color: '#64748b' },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardMetaActive: { fontSize: 12, color: '#e0e7ff' },
  cardTitleActive: { fontSize: 14, fontWeight: '700', color: '#fff' },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  checkText: { color: '#136dec', fontWeight: '700' },

  inputBlock: { marginBottom: 12 },
  inputLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  selectBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 14, fontWeight: '500' },
  selectArrow: { fontSize: 18, color: '#64748b' },

  dateRow: { flexDirection: 'row', gap: 12 },
  dateBox: { flex: 1 },

  formatRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  formatChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formatActive: {
    backgroundColor: '#e0ebff',
    borderColor: '#136dec',
  },
  formatText: { fontSize: 14, color: '#64748b' },
  formatTextActive: {
    fontSize: 14,
    color: '#136dec',
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },

  exportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 8,
  },
  exportLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: { fontSize: 14, fontWeight: '600' },
  fileMeta: { fontSize: 12, color: '#64748b' },
  downloadIcon: { fontSize: 18, color: '#64748b' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'rgba(246,247,248,0.9)',
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#136dec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
