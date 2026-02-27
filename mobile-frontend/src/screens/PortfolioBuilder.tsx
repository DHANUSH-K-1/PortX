import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Upload, LogOut, Sparkles, CheckCircle2, FileText, Globe, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { API_ENDPOINTS } from '../api/config';

interface PortfolioBuilderProps {
  onLogout: () => void;
}

interface SelectedFile {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
}

export default function PortfolioBuilder({ onLogout }: PortfolioBuilderProps) {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [backendFilename, setBackendFilename] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const fileData = {
          name: file.name,
          uri: file.uri,
          size: file.size,
          mimeType: file.mimeType,
        };
        setSelectedFile(fileData);
        
        // Upload to backend
        setIsUploading(true);
        const formData = new FormData();
        // @ts-ignore - FormData expects a specific structure for files in React Native
        formData.append('resume', {
          uri: fileData.uri,
          name: fileData.name,
          type: fileData.mimeType || 'application/octet-stream',
        });

        const response = await fetch(API_ENDPOINTS.processResume, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setBackendFilename(data.filename);
          setStep(2);
        } else {
          Alert.alert('Upload Failed', data.error || 'Failed to process resume');
          setSelectedFile(null);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    if (!backendFilename || !selectedTemplate) return;

    setIsGenerating(true);
    try {
      // Map display name to backend layout name
      const layoutMap: Record<string, string> = {
        'Modern Minimal': 'modern',
        'Creative Glass': 'glass',
        'Professional Dark': 'professional',
        'Neon Future': 'neon'
      };

      const response = await fetch(API_ENDPOINTS.generatePortfolio(backendFilename), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout: layoutMap[selectedTemplate] }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedUrl(data.generated_file);
        setStep(3);
      } else {
        Alert.alert('Generation Failed', data.error || 'Failed to generate portfolio');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to the server');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          {step > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft color="#fff" size={20} />
            </TouchableOpacity>
          )}
          <View style={styles.logoContainer}>
            <Sparkles color="#a855f7" size={24} />
            <Text style={styles.logoText}>{step === 1 ? 'Build' : step === 2 ? 'Design' : 'Launch'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <LogOut color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.stepper}>
        <StepIndicator currentStep={step} stepNumber={1} label="Upload" />
        <View style={[styles.stepLine, step > 1 && styles.stepLineActive]} />
        <StepIndicator currentStep={step} stepNumber={2} label="Customize" />
        <View style={[styles.stepLine, step > 2 && styles.stepLineActive]} />
        <StepIndicator currentStep={step} stepNumber={3} label="Launch" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Start with your resume</Text>
            <Text style={styles.sectionSubtitle}>We'll use AI to build your professional portfolio in seconds.</Text>
            
            <TouchableOpacity 
              style={[styles.uploadBox, selectedFile && styles.uploadBoxSelected]} 
              onPress={handlePickDocument}
              disabled={isUploading}
            >
              {isUploading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#a855f7" />
                  <Text style={styles.uploadBoxTitle}>Analyzing Resume...</Text>
                </View>
              ) : selectedFile ? (
                <View style={styles.loadingContainer}>
                  <FileText color="#10b981" size={40} />
                  <Text style={styles.uploadBoxTitle}>{selectedFile.name}</Text>
                  <Text style={styles.uploadBoxSubtitle}>File ready for processing</Text>
                </View>
              ) : (
                <>
                  <View style={styles.uploadIconCircle}>
                    <Upload color="#a855f7" size={40} />
                  </View>
                  <Text style={styles.uploadBoxTitle}>Tap to Upload Resume</Text>
                  <Text style={styles.uploadBoxSubtitle}>PDF, DOCX (Max 5MB)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : step === 2 ? (
          <View style={styles.templateSection}>
            <Text style={styles.sectionTitle}>Choose a Template</Text>
            <Text style={styles.sectionSubtitle}>Select the look that best fits your professional brand.</Text>
            
            <View style={styles.templateGrid}>
              <TemplateCard 
                name="Modern Minimal" 
                color="#3b82f6" 
                isSelected={selectedTemplate === 'Modern Minimal'}
                onSelect={() => handleTemplateSelect('Modern Minimal')}
              />
              <TemplateCard 
                name="Creative Glass" 
                color="#ec4899" 
                isSelected={selectedTemplate === 'Creative Glass'}
                onSelect={() => handleTemplateSelect('Creative Glass')}
              />
              <TemplateCard 
                name="Professional Dark" 
                color="#a855f7" 
                isSelected={selectedTemplate === 'Professional Dark'}
                onSelect={() => handleTemplateSelect('Professional Dark')}
              />
              <TemplateCard 
                name="Neon Future" 
                color="#10b981" 
                isSelected={selectedTemplate === 'Neon Future'}
                onSelect={() => handleTemplateSelect('Neon Future')}
              />
            </View>

            <TouchableOpacity 
              style={[styles.nextButton, (!selectedTemplate || isGenerating) && styles.buttonDisabled]}
              onPress={handleGeneratePortfolio}
              disabled={!selectedTemplate || isGenerating}
            >
              <LinearGradient
                colors={selectedTemplate ? ['#9333ea', '#db2777'] : ['#374151', '#1f2937']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.nextButtonText}>Generate My Portfolio</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successSection}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 color="#10b981" size={60} />
            </View>
            <Text style={styles.sectionTitle}>Portfolio Ready!</Text>
            <Text style={styles.sectionSubtitle}>Your AI-powered portfolio has been generated successfully.</Text>
            
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Globe color="#a855f7" size={24} />
                <Text style={styles.previewUrl}>{generatedUrl ? `portx.io/${generatedUrl.replace('.html', '')}` : 'Processing...'}</Text>
              </View>
              <Text style={styles.previewStatus}>Live on the web</Text>
            </View>

            <TouchableOpacity style={styles.nextButton}>
              <LinearGradient
                colors={['#9333ea', '#db2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.nextButtonText}>View My Portfolio</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StepIndicator({ currentStep, stepNumber, label }: { currentStep: number, stepNumber: number, label: string }) {
  const isActive = currentStep === stepNumber;
  const isCompleted = currentStep > stepNumber;

  return (
    <View style={styles.stepItem}>
      <View style={[
        styles.stepCircle, 
        isActive && styles.stepCircleActive,
        isCompleted && styles.stepCircleCompleted
      ]}>
        {isCompleted ? (
          <CheckCircle2 color="#fff" size={16} />
        ) : (
          <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>{stepNumber}</Text>
        )}
      </View>
      <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

function TemplateCard({ name, color, isSelected, onSelect }: { name: string, color: string, isSelected: boolean, onSelect: () => void }) {
  return (
    <TouchableOpacity 
      style={[styles.templateCard, isSelected && styles.templateCardSelected]} 
      onPress={onSelect}
    >
      <View style={[styles.templatePreview, { backgroundColor: color + '15' }]}>
        <View style={[styles.templateBar, { backgroundColor: color, width: '60%' }]} />
        <View style={[styles.templateBar, { backgroundColor: color + '40', width: '40%' }]} />
        <View style={[styles.templateBar, { backgroundColor: color + '40', width: '80%' }]} />
        {isSelected && (
          <View style={styles.checkBadge}>
            <CheckCircle2 color="#fff" size={16} />
          </View>
        )}
      </View>
      <Text style={[styles.templateName, isSelected && styles.templateNameActive]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
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
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  stepCircleActive: {
    backgroundColor: '#9333ea',
    borderColor: '#a855f7',
  },
  stepCircleCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  stepNumber: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#a855f7',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#1f2937',
    marginHorizontal: 10,
    marginTop: -14,
  },
  stepLineActive: {
    backgroundColor: '#9333ea',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  uploadSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  uploadBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(88, 28, 135, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  uploadBoxSelected: {
    borderStyle: 'solid',
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  uploadIconCircle: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadBoxTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  uploadBoxSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  templateSection: {
    marginTop: 20,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 40,
  },
  templateCard: {
    width: '47%',
    gap: 12,
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: '#9333ea',
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
  },
  templatePreview: {
    height: 140,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  templateBar: {
    height: 8,
    borderRadius: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#9333ea',
    borderRadius: 12,
    padding: 2,
  },
  templateName: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 8,
  },
  templateNameActive: {
    color: '#fff',
  },
  nextButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successSection: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    marginVertical: 20,
    alignItems: 'center',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  previewUrl: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewStatus: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
});
