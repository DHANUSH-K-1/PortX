import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Animated, Dimensions, TextInput, Switch, Linking } from 'react-native';
import { Upload, LogOut, Sparkles, CheckCircle2, FileText, Globe, ArrowLeft, Menu, X, Moon, Sun, ChevronRight, Edit3, Save, Copy, ExternalLink, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import BASE_URL, { API_ENDPOINTS } from '../api/config';

const { width } = Dimensions.get('window');

interface PortfolioBuilderProps {
  onLogout: () => void;
}

interface Portfolio {
  id: string;
  name: string;
  created_at: string;
}

interface PortfolioData {
  name: string;
  email: string;
  mobile: string;
  portfolio_summary: string;
  skills: string[];
  education: any[];
  experience: any[];
}

export default function PortfolioBuilder({ onLogout }: PortfolioBuilderProps) {
  // Main App State
  const [step, setStep] = useState(1); // 1: Upload, 2: Design, 3: Success, 4: Edit Form
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(width)).current;

  // Data State
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [editData, setEditData] = useState<PortfolioData | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getPortfolios);
      const data = await response.json();
      if (response.ok) setPortfolios(data.portfolios || []);
    } catch (err) {
      console.error('Failed to fetch portfolios', err);
    }
  };

  const toggleMenu = (open: boolean) => {
    setIsMenuOpen(open);
    Animated.timing(menuAnim, {
      toValue: open ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setIsUploading(true);
        const formData = new FormData();
        // @ts-ignore
        formData.append('resume', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        });

        const response = await fetch(API_ENDPOINTS.processResume, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          setCurrentFilename(data.filename);
          setEditData(data.data);
          setStep(4); // Go to Edit Form first
        } else {
          Alert.alert('Error', data.error || 'Failed to process resume');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditSaved = () => {
    setStep(2); // Go to Design after editing
  };

  const handlePortfolioSelect = async (id: string) => {
    toggleMenu(false);
    try {
      const response = await fetch(API_ENDPOINTS.getPortfolio(id));
      const data = await response.json();
      if (response.ok) {
        setEditData(data);
        setCurrentFilename(id);
        setStep(4);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not load project');
    }
  };

  const handleGeneratePortfolio = async () => {
    if (!currentFilename || !selectedTemplate || !editData) return;
    setIsGenerating(true);
    try {
      const layoutMap: Record<string, string> = {
        'Modern Minimal': 'modern',
        'Creative Glass': 'glass',
        'Professional Dark': 'professional',
        'Neon Future': 'neon'
      };

      // First update the data in case it was edited
      await fetch(API_ENDPOINTS.updatePortfolio(currentFilename), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      // Then generate
      const response = await fetch(API_ENDPOINTS.generatePortfolio(currentFilename), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: layoutMap[selectedTemplate] }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedUrl(data.generated_file);
        setStep(3);
        fetchPortfolios(); // Refresh list
      }
    } catch (error) {
      Alert.alert('Error', 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (generatedUrl) {
      const fullUrl = `${BASE_URL}/p/${generatedUrl}`;
      await Clipboard.setStringAsync(fullUrl);
      Alert.alert('Link Copied', 'Portfolio URL copied to clipboard!');
    }
  };

  const handlePreviewLink = () => {
    if (generatedUrl) {
      const fullUrl = `${BASE_URL}/p/${generatedUrl}`;
      Linking.openURL(fullUrl);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* App Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.logoContainer}>
          <Sparkles color="#a855f7" size={24} />
          <Text style={[styles.logoText, { color: theme.text }]}>PortX</Text>
        </View>
        <TouchableOpacity onPress={() => toggleMenu(true)} style={styles.menuButton}>
          <Menu color={theme.text} size={24} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Start with your resume</Text>
            <TouchableOpacity 
              style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: isDarkMode ? 'rgba(147, 51, 234, 0.05)' : '#f3f4f6' }]} 
              onPress={handlePickDocument}
              disabled={isUploading}
            >
              {isUploading ? <ActivityIndicator size="large" color="#a855f7" /> : (
                <>
                  <Upload color="#a855f7" size={48} />
                  <Text style={[styles.uploadText, { color: theme.text }]}>Tap to Upload Resume</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && editData && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Review Details</Text>
            <EditForm data={editData} setData={setEditData} onSave={handleEditSaved} theme={theme} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Layout</Text>
            <View style={styles.templateGrid}>
              {['Modern Minimal', 'Creative Glass', 'Professional Dark', 'Neon Future'].map(name => (
                <TouchableOpacity 
                  key={name}
                  onPress={() => setSelectedTemplate(name)}
                  style={[styles.templateCard, selectedTemplate === name && styles.templateCardSelected]}
                >
                  <Text style={[styles.templateName, { color: theme.text }]}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={[styles.nextButton, !selectedTemplate && styles.buttonDisabled]}
              onPress={handleGeneratePortfolio}
              disabled={!selectedTemplate || isGenerating}
            >
              <LinearGradient colors={['#9333ea', '#db2777']} style={styles.gradientButton}>
                {isGenerating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Portfolio</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <View style={styles.successIconContainer}>
              <CheckCircle2 color="#10b981" size={80} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Launch Successful!</Text>
            
            <View style={[styles.previewCard, { backgroundColor: isDarkMode ? 'rgba(147, 51, 234, 0.1)' : '#f3e8ff' }]}>
              <View style={styles.urlRow}>
                <Globe color="#a855f7" size={20} />
                <Text style={[styles.previewUrl, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
                  {generatedUrl ? `portx.io/${generatedUrl.replace('.html', '')}` : 'Processing...'}
                </Text>
              </View>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.inputBg }]} onPress={handleCopyLink}>
                  <Copy color={theme.text} size={18} />
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>Copy Link</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.inputBg }]} onPress={handlePreviewLink}>
                  <ExternalLink color={theme.text} size={18} />
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>Open Live</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.buildAnotherButton} onPress={() => setStep(1)}>
                <LinearGradient colors={['#9333ea', '#db2777']} style={styles.gradientButton}>
                  <RefreshCw color="#fff" size={20} />
                  <Text style={styles.buttonText}>Build Another Project</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sliding Side Menu */}
      {isMenuOpen && (
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.overlay} 
          onPress={() => toggleMenu(false)} 
        />
      )}
      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }], backgroundColor: theme.cardBg }]}>
        <View style={styles.menuHeader}>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Account</Text>
          <TouchableOpacity onPress={() => toggleMenu(false)}>
            <X color={theme.text} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.avatar}><Text style={styles.avatarText}>JD</Text></View>
          <Text style={[styles.userName, { color: theme.text }]}>User Settings</Text>
        </View>

        <View style={[styles.menuItem, { borderBottomColor: theme.border }]}>
          <View style={styles.menuItemLeft}>
            {isDarkMode ? <Moon color="#a855f7" size={20} /> : <Sun color="#f59e0b" size={20} />}
            <Text style={[styles.menuItemText, { color: theme.text }]}>Dark Mode</Text>
          </View>
          <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
        </View>

        <Text style={styles.menuSectionTitle}>My Projects</Text>
        <ScrollView style={styles.projectList}>
          {portfolios.map(p => (
            <TouchableOpacity key={p.id} style={styles.projectItem} onPress={() => handlePortfolioSelect(p.id)}>
              <FileText color="#6b7280" size={18} />
              <Text style={[styles.projectItemText, { color: theme.text }]}>{p.name}</Text>
              <ChevronRight color="#6b7280" size={16} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.logoutMenuItem} onPress={onLogout}>
          <LogOut color="#ef4444" size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function EditForm({ data, setData, onSave, theme }: { data: PortfolioData, setData: any, onSave: () => void, theme: any }) {
  const updateField = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  return (
    <View style={styles.form}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Full Name</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
        value={data.name} 
        onChangeText={(v) => updateField('name', v)}
      />
      
      <Text style={[styles.label, { color: theme.textMuted }]}>Email</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
        value={data.email} 
        onChangeText={(v) => updateField('email', v)}
      />

      <Text style={[styles.label, { color: theme.textMuted }]}>Professional Summary</Text>
      <TextInput 
        style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
        value={data.portfolio_summary} 
        multiline 
        onChangeText={(v) => updateField('portfolio_summary', v)}
      />

      <Text style={[styles.label, { color: theme.textMuted }]}>Skills (comma separated)</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} 
        value={data.skills.join(', ')} 
        onChangeText={(v) => setData({ ...data, skills: v.split(',').map(s => s.trim()) })}
      />

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <LinearGradient colors={['#9333ea', '#db2777']} style={styles.gradientButton}>
          <Save color="#fff" size={20} />
          <Text style={styles.buttonText}>Save & Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const darkTheme = {
  bg: '#000',
  text: '#fff',
  textMuted: '#9ca3af',
  border: 'rgba(255,255,255,0.1)',
  cardBg: '#111',
  inputBg: '#1f2937',
};

const lightTheme = {
  bg: '#f9fafb',
  text: '#111',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  cardBg: '#fff',
  inputBg: '#fff',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  menuButton: { padding: 8 },
  scrollContent: { padding: 20 },
  section: { gap: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  uploadBox: { width: '100%', aspectRatio: 1.2, borderWidth: 2, borderStyle: 'dashed', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  uploadText: { marginTop: 12, fontSize: 16, fontWeight: '600' },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1 },
  textArea: { height: 100, paddingTop: 12 },
  saveButton: { height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 10 },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  templateCard: { width: '45%', height: 80, backgroundColor: '#9333ea20', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  templateCardSelected: { borderColor: '#9333ea', backgroundColor: '#9333ea40' },
  templateName: { fontWeight: '600' },
  nextButton: { height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 20 },
  buttonDisabled: { opacity: 0.5 },
  gradientButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  successIconContainer: { alignSelf: 'center', marginVertical: 10 },
  previewCard: { width: '100%', borderRadius: 24, padding: 24, marginVertical: 10, alignItems: 'center', gap: 20, borderWidth: 1, borderColor: 'rgba(147, 51, 234, 0.2)' },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10 },
  previewUrl: { fontSize: 16, fontWeight: '600', flex: 1 },
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  actionButton: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(147, 51, 234, 0.3)' },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  footerButtons: { width: '100%', marginTop: 10 },
  buildAnotherButton: { height: 56, borderRadius: 28, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 },
  sideMenu: { position: 'absolute', top: 0, right: 0, bottom: 0, width: width * 0.8, zIndex: 101, padding: 24, paddingTop: 60 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  menuTitle: { fontSize: 24, fontWeight: 'bold' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#9333ea', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: '600' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuItemText: { fontSize: 16, fontWeight: '500' },
  menuSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginTop: 24, marginBottom: 12 },
  projectList: { flex: 1 },
  projectItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  projectItemText: { flex: 1, fontSize: 15 },
  logoutMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 20, marginTop: 'auto' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' }
});
