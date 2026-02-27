import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Upload, FileText, Layout, ArrowRight, UserCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface LandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Landing({ onLoginClick, onRegisterClick }: LandingProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Sparkles color="#a855f7" size={24} />
          <Text style={styles.logoText}>PortX</Text>
        </View>
        <TouchableOpacity onPress={onLoginClick}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Sparkles color="#a855f7" size={14} />
          <Text style={styles.badgeText}>AI-Powered Portfolio Builder</Text>
        </View>

        <Text style={styles.title}>
          <Text style={styles.gradientText}>Build Your Legacy</Text>
          {""}
          <Text style={styles.whiteText}>In Minutes</Text>
        </Text>

        <Text style={styles.subtitle}>
          Transform your resume into a stunning, professional portfolio website. No coding required.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={onRegisterClick}
          >
            <LinearGradient
              colors={['#9333ea', '#db2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.primaryButtonText}>Get Started Free</Text>
              <ArrowRight color="#fff" size={20} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={onLoginClick}
          >
            <UserCircle2 color="#a855f7" size={20} />
            <Text style={styles.secondaryButtonText}>Member Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <FeatureCard 
          icon={<Upload color="#a855f7" size={28} />}
          title="Upload Resume"
          description="Simply upload your PDF or DOCX resume. Our AI extracts your details instantly."
        />
        <FeatureCard 
          icon={<FileText color="#ec4899" size={28} />}
          title="AI Enhancement"
          description="Our advanced AI polishes your content and structures it for maximum impact."
        />
        <FeatureCard 
          icon={<Layout color="#3b82f6" size={28} />}
          title="Premium Layouts"
          description="Choose from our collection of stunning, responsive designs tailored for professionals."
        />
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  loginText: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: '500',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginBottom: 24,
  },
  badgeText: {
    color: '#e9d5ff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 50,
  },
  gradientText: {
    color: '#a855f7', // Fallback as RN doesn't support text-clipping gradients easily without extra libs
  },
  whiteText: {
    color: '#fff',
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 28,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  features: {
    paddingHorizontal: 20,
    marginTop: 60,
    gap: 20,
  },
  card: {
    backgroundColor: 'rgba(88, 28, 135, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 24,
    padding: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardDescription: {
    color: '#9ca3af',
    fontSize: 16,
    lineHeight: 24,
  },
});
