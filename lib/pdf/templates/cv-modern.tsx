import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (optional - using system fonts for now)
// Font.register({ family: 'Inter', src: 'path/to/inter.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 10,
    color: '#6B7280',
    flexDirection: 'row',
    gap: 15,
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  company: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 10,
    color: '#6B7280',
  },
  bodyText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
    marginLeft: 15,
    marginBottom: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#EEF2FF',
    color: '#6366F1',
    fontSize: 9,
    padding: '4 10',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

interface CVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    date: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    date: string;
  }>;
  skills: string[];
}

interface CVModernProps {
  data: CVData;
}

export const CVModern: React.FC<CVModernProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.name}</Text>
        <View style={styles.contactInfo}>
          <Text>{data.email}</Text>
          <Text>•</Text>
          <Text>{data.phone}</Text>
          <Text>•</Text>
          <Text>{data.location}</Text>
        </View>
      </View>

      {/* Professional Summary */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.bodyText}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.experience.map((job, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.subsectionTitle}>{job.title}</Text>
                  <Text style={styles.company}>{job.company}</Text>
                </View>
                <Text style={styles.date}>{job.date}</Text>
              </View>
              {job.description.map((bullet, i) => (
                <Text key={i} style={styles.bulletPoint}>
                  • {bullet}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.subsectionTitle}>{edu.degree}</Text>
                  <Text style={styles.company}>{edu.school}</Text>
                </View>
                <Text style={styles.date}>{edu.date}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {data.skills.map((skill, index) => (
              <Text key={index} style={styles.skillTag}>
                {skill}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated by CV Tailor Agent • Tailored for your dream job</Text>
      </View>
    </Page>
  </Document>
);

export default CVModern;
