import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Upload, FileText, Layout, ArrowRight, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Landing({ onLoginClick, onRegisterClick }: LandingProps) {
  const [activeIndex, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setIndex(index);
  };

  const goToNext = () => {
    scrollViewRef.current?.scrollTo({ x: width, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* Persistent Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Sparkles color="#a855f7" size={24} />
          <Text style={styles.logoText}>PortX</Text>
        </View>
        <TouchableOpacity onPress={onLoginClick}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {/* Slide 1: Hero */}
        <View style={styles.slide}>
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Sparkles color="#a855f7" size={14} />
              <Text style={styles.badgeText}>AI-Powered Portfolio Builder</Text>
            </View>

            <Text style={styles.title}>
              <Text style={styles.gradientText}>Build Your Legacy</Text>
              {"\n"}
              <Text style={styles.whiteText}>In Minutes</Text>
            </Text>

            <Text style={styles.subtitle}>
              Transform your resume into a stunning, professional portfolio website using the power of AI.
            </Text>
            
            <View style={styles.illustrationContainer}>
               <View style={styles.glowOrb} />
               <Layout color="rgba(168, 85, 247, 0.5)" size={120} strokeWidth={1} />
            </View>
          </View>
        </View>

        {/* Slide 2: Features */}
        <View style={styles.slide}>
          <View style={styles.featuresContent}>
            <Text style={styles.featuresTitle}>Simple 3-Step Process</Text>
            
            <View style={styles.featureList}>
              <FeatureItem 
                icon={<Upload color="#a855f7" size={24} />}
                title="Upload"
                desc="Pick your PDF or DOCX resume"
              />
              <FeatureItem 
                icon={<FileText color="#ec4899" size={24} />}
                title="Enhance"
                desc="AI polishes your professional bio"
              />
              <FeatureItem 
                icon={<Layout color="#3b82f6" size={24} />}
                title="Launch"
                desc="Choose a theme and go live"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.indicatorContainer}>
          <View style={[styles.indicator, activeIndex === 0 && styles.indicatorActive]} />
          <View style={[styles.indicator, activeIndex === 1 && styles.indicatorActive]} />
        </View>

        {activeIndex === 0 ? (
          <TouchableOpacity style={styles.fullWidthButton} onPress={goToNext}>
            <LinearGradient
              colors={['#9333ea', '#db2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBorder}
            >
              <View style={styles.innerButton}>
                <Text style={styles.buttonText}>Next</Text>
                <ChevronRight color="#fff" size={20} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.fullWidthButton} onPress={onRegisterClick}>
            <LinearGradient
              colors={['#9333ea', '#db2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <ArrowRight color="#fff" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function FeatureItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <View>
        <Text style={styles.featureItemTitle}>{title}</Text>
        <Text style={styles.featureItemDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  loginText: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '600',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: width,
    height: height,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    marginTop: -40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  badgeText: {
    color: '#e9d5ff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 52,
  },
  gradientText: {
    color: '#a855f7',
  },
  whiteText: {
    color: '#fff',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 28,
  },
  illustrationContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#9333ea',
    opacity: 0.2,
    filter: 'blur(40px)',
  },
  featuresContent: {
    gap: 40,
  },
  featuresTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  featureList: {
    gap: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureItemTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featureItemDesc: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    backgroundColor: 'transparent',
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#9333ea',
  },
  fullWidthButton: {
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
  gradientBorder: {
    flex: 1,
    padding: 2, // This acts as the border width
    borderRadius: 28,
  },
  innerButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
