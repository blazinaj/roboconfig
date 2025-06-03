import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { Machine } from '../../types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  componentCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  componentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  riskFactor: {
    marginLeft: 10,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 10,
  },
});

// Helper function to format dates safely
const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  if (date instanceof Date) return date.toLocaleDateString();
  // If it's a string or number, try to convert it to a Date
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
};

interface MachineReportProps {
  machine: Machine;
}

const MachineReport: React.FC<MachineReportProps> = ({ machine }) => {
  const calculateRiskScore = (severity: number, probability: number) => {
    return (severity * probability) / 25 * 100;
  };

  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{machine.name} - Technical Report</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Machine Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{machine.type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{machine.status}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{machine.description}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maintenance Schedule</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Last Maintenance:</Text>
              <Text style={styles.value}>
                {formatDate(machine.lastMaintenance)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Next Maintenance:</Text>
              <Text style={styles.value}>
                {formatDate(machine.nextMaintenance)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Components</Text>
            {machine.components.map((component, index) => (
              <View key={index} style={styles.componentCard}>
                <Text style={styles.componentTitle}>{component.name}</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Category:</Text>
                  <Text style={styles.value}>{component.category}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Type:</Text>
                  <Text style={styles.value}>{component.type}</Text>
                </View>
                
                <Text style={{ ...styles.sectionTitle, fontSize: 12, marginTop: 5 }}>
                  Risk Factors
                </Text>
                {component.riskFactors.map((risk, riskIndex) => (
                  <View key={riskIndex} style={styles.riskFactor}>
                    <Text style={{ fontWeight: 'bold' }}>{risk.name}</Text>
                    <Text>{risk.description}</Text>
                    <Text>
                      Risk Score: {calculateRiskScore(risk.severity, risk.probability).toFixed(1)}%
                      (Severity: {risk.severity}, Probability: {risk.probability})
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <Text style={styles.footer}>
            Generated on {new Date().toLocaleDateString()} | RoboConfig Machine Report
          </Text>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default MachineReport;