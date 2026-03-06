import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Animated, Dimensions, TextInput, Switch, Linking } from 'react-native';
import { Upload, LogOut, Sparkles, CheckCircle2, FileText, Globe, ArrowLeft, Menu, X, Moon, Sun, ChevronRight, Edit3, Save, Copy, ExternalLink, RefreshCw, Plus, Eye, Trash2, Mail, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import BASE_URL, { API_ENDPOINTS } from '../api/config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const { width, height } = Dimensions.get('window');

interface PortfolioBuilderProps {
  onLogout: () => void;
}

interface Portfolio {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  created_at: string;
}

interface PortfolioData {
  name: string;
  email: string;
  mobile: string;
  profile_photo?: string;
  portfolio_summary: string;
  skills: string[];
  education: any[];
  experience: any[];
  projects: any[];
}

export default function PortfolioBuilder({ onLogout }: PortfolioBuilderProps) {
  const [step, setStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(width)).current;
  const smokeAnim1 = useRef(new Animated.Value(0)).current;
  const smokeAnim2 = useRef(new Animated.Value(0)).current;

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [editData, setEditData] = useState<PortfolioData | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [notification, setNotification] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });

  const ALL_TEMPLATES = [
    { name: 'Modern Minimal', id: 'modern' },
    { name: 'Creative Glass', id: 'glass' },
    { name: 'Professional Dark', id: 'professional' },
    { name: 'Neon Future', id: 'neon' },
    { name: 'Classic Minimal', id: 'minimal' },
    { name: 'Arty Creative', id: 'creative' }
  ];

  const showNotification = async (msg: string) => {
    setNotification({ message: msg, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
    
    // Trigger system notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "PortX",
          body: msg,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (e) {
      console.log("Error showing notification:", e);
    }
  };

  const visibleTemplates = showAllTemplates ? ALL_TEMPLATES : ALL_TEMPLATES.slice(0, 4);

  useEffect(() => {
    fetchPortfolios();
    fetchUser();

    // Request notification permissions
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    })();
  }, []);

  useEffect(() => {
    if (isUploading || isGenerating) {
      const createAnim = (anim: Animated.Value, duration: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
          ])
        );
      };
      createAnim(smokeAnim1, 3000).start();
      createAnim(smokeAnim2, 4500).start();
    }
  }, [isUploading, isGenerating]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getPortfolios);
      const data = await response.json();
      if (response.ok) setPortfolios(data.portfolios || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.login.replace('/login', '/me'));
      const data = await response.json();
      if (response.ok) setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Project", "Permanently remove this portfolio?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const response = await fetch(API_ENDPOINTS.deletePortfolio(id), { method: 'POST' });
        if (response.ok) fetchPortfolios();
      }}
    ]);
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
        formData.append('resume', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' });

        const response = await fetch(API_ENDPOINTS.processResume, { method: 'POST', body: formData });
        const data = await response.json();
        if (response.ok) {
          setCurrentFilename(data.filename);
          setEditData(data.data);
          showNotification("details fetched -portx");
          setStep(4);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Pick failed');
    } finally {
      setIsUploading(false);
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
        'Neon Future': 'neon',
        'Classic Minimal': 'minimal',
        'Arty Creative': 'creative'
      };
      await fetch(API_ENDPOINTS.updatePortfolio(currentFilename), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const response = await fetch(API_ENDPOINTS.generatePortfolio(currentFilename), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: layoutMap[selectedTemplate] }),
      });
      const data = await response.json();
      if (response.ok) {
        setGeneratedUrl(data.generated_file);
        showNotification("your website is now live");
        setStep(3);
        fetchPortfolios();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleMenu = (open: boolean) => {
    setIsMenuOpen(open);
    Animated.timing(menuAnim, {
      toValue: open ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();
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

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {(isUploading || isGenerating) && (
        <View style={styles.loadingOverlay}>
          <Animated.View style={[styles.borderSmoke, styles.topSmoke, { 
            opacity: smokeAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }),
            transform: [{ translateY: smokeAnim1.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] }) }, { scaleX: 1.5 }] 
          }]}>
            <LinearGradient colors={['#a855f7', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[styles.borderSmoke, styles.bottomSmoke, { 
            opacity: smokeAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }),
            transform: [{ translateY: smokeAnim2.interpolate({ inputRange: [0, 1], outputRange: [20, -20] }) }, { scaleX: 1.5 }] 
          }]}>
            <LinearGradient colors={['transparent', '#db2777']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[styles.borderSmoke, styles.leftSmoke, { 
            opacity: smokeAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
            transform: [{ translateX: smokeAnim1.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] }) }, { scaleY: 1.5 }] 
          }]}>
            <LinearGradient start={{x:0, y:0}} end={{x:1, y:0}} colors={['#9333ea', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[styles.borderSmoke, styles.rightSmoke, { 
            opacity: smokeAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
            transform: [{ translateX: smokeAnim2.interpolate({ inputRange: [0, 1], outputRange: [20, -20] }) }, { scaleY: 1.5 }] 
          }]}>
            <LinearGradient start={{x:0, y:0}} end={{x:1, y:0}} colors={['transparent', '#db2777']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>{isUploading ? 'AI Analyzing...' : 'Creating Site...'}</Text>
          </View>
        </View>
      )}

      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.bg }]}>
        <View style={styles.logoContainer}>
          <Sparkles color="#a855f7" size={24} />
          <Text style={[styles.logoText, { color: theme.text }]}>PortX</Text>
        </View>
        <TouchableOpacity onPress={() => toggleMenu(true)}>
          <Menu color={theme.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, step === 1 && { paddingBottom: 120 }]}>
        {step === 1 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Portfolios</Text>
            {portfolios.map(p => (
              <View key={p.id} style={[styles.projectCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.projectName, { color: theme.text }]}>{p.name}</Text>
                  <View style={styles.cardDetailRow}>
                    <Mail color={theme.textMuted} size={14} />
                    <Text style={[styles.cardDetailText, { color: theme.textMuted }]}>{p.email}</Text>
                  </View>
                  <View style={styles.cardDetailRow}>
                    <Phone color={theme.textMuted} size={14} />
                    <Text style={[styles.cardDetailText, { color: theme.textMuted }]}>{p.mobile}</Text>
                  </View>
                  <Text style={[styles.projectDate, { color: theme.textMuted, marginTop: 10 }]}>{new Date(p.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => Linking.openURL(`${BASE_URL}/p/${p.id}.html`)} style={styles.iconBtn}><Eye color="#a855f7" size={22} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePortfolioSelect(p.id)} style={styles.iconBtn}><Edit3 color={theme.text} size={22} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(p.id)} style={styles.iconBtn}><Trash2 color="#ef4444" size={22} /></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {step === 4 && editData && (
          <View style={styles.section}>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backLink}><ArrowLeft color="#a855f7" size={18} /><Text style={styles.backLinkText}>Dashboard</Text></TouchableOpacity>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Edit Details</Text>
            <EditForm data={editData} setData={setEditData} onSave={() => { 
              showNotification("your portfolio is updated click to view");
              setStep(2); 
            }} theme={theme} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Layout</Text>
            <View style={styles.templateGrid}>
              {visibleTemplates.map(t => (
                <TouchableOpacity 
                  key={t.id} 
                  onPress={() => setSelectedTemplate(t.name)} 
                  style={[styles.templateCard, selectedTemplate === t.name && styles.templateCardSelected, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                >
                  <View style={[styles.templatePreview, { backgroundColor: theme.inputBg }]}>
                    {/* Minimalist layout preview shapes */}
                    <View style={{ width: '80%', height: 8, backgroundColor: '#9333ea30', borderRadius: 4 }} />
                    <View style={{ width: '60%', height: 8, backgroundColor: '#9333ea30', borderRadius: 4, marginTop: 4 }} />
                  </View>
                  <Text style={[styles.templateName, { color: theme.text }]}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[styles.showMoreBtn, { borderColor: theme.border }]} 
              onPress={() => setShowAllTemplates(!showAllTemplates)}
            >
              <Text style={{ color: '#a855f7', fontWeight: '600' }}>
                {showAllTemplates ? 'Show Less Styles' : 'Show More Styles'}
              </Text>
              <ChevronRight color="#a855f7" size={16} style={{ transform: [{ rotate: showAllTemplates ? '270deg' : '90deg' }] }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleGeneratePortfolio} disabled={!selectedTemplate || isGenerating}>
              <LinearGradient colors={['#9333ea', '#db2777']} style={styles.gradientButton}><Text style={styles.buttonText}>Generate Portfolio</Text></LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <CheckCircle2 color="#10b981" size={80} style={{ alignSelf: 'center' }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Portfolio Live!</Text>
            <View style={[styles.previewCard, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.previewUrl, { color: theme.text }]}>portx.io/{generatedUrl?.replace('.html', '')}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => generatedUrl && Clipboard.setStringAsync(`${BASE_URL}/p/${generatedUrl}`)}><Copy color={theme.text} size={18} /><Text style={{ color: theme.text }}>Copy</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => generatedUrl && Linking.openURL(`${BASE_URL}/p/${generatedUrl}`)}><ExternalLink color={theme.text} size={18} /><Text style={{ color: theme.text }}>Open</Text></TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(1)}><LinearGradient colors={['#9333ea', '#db2777']} style={styles.gradientButton}><Text style={styles.buttonText}>Back to Home</Text></LinearGradient></TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {step === 1 && (
        <View style={[styles.fixedFooter, { backgroundColor: theme.bg }]}>
          <TouchableOpacity style={styles.createButton} onPress={handlePickDocument}>
            <LinearGradient colors={['#9333ea', '#db2777']} style={styles.gradientButton}><Plus color="#fff" size={24} /><Text style={styles.buttonText}>New Portfolio</Text></LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {isMenuOpen && (
        <>
          <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={() => toggleMenu(false)} />
          <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }], backgroundColor: theme.cardBg }]}>
            <View style={styles.menuHeader}><Text style={[styles.menuTitle, { color: theme.text }]}>Menu</Text><TouchableOpacity onPress={() => toggleMenu(false)}><X color={theme.text} size={24} /></TouchableOpacity></View>
            
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Guest User'}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>{user?.email || 'Not signed in'}</Text>
              </View>
            </View>

            <View style={styles.menuItem}><Text style={{ color: theme.text }}>Dark Mode</Text><Switch value={isDarkMode} onValueChange={setIsDarkMode} /></View>
            
            <Text style={styles.menuSectionTitle}>My Projects</Text>
            <ScrollView style={{ flex: 1 }}>
              {portfolios.map(p => (
                <TouchableOpacity key={p.id} style={styles.menuProjectItem} onPress={() => { toggleMenu(false); handlePortfolioSelect(p.id); }}>
                  <FileText color="#a855f7" size={18} />
                  <Text style={[styles.menuProjectName, { color: theme.text }]} numberOfLines={1}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.logoutMenuItem} onPress={onLogout}><LogOut color="#ef4444" size={20} /><Text style={{ color: '#ef4444' }}>Log Out</Text></TouchableOpacity>
          </Animated.View>
        </>
      )}

      {notification.visible && (
        <Animated.View style={[styles.notificationToast, { backgroundColor: '#a855f7' }]}>
          <Text style={styles.notificationText}>{notification.message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

function EditForm({ data, setData, onSave, theme }: { data: PortfolioData, setData: any, onSave: () => void, theme: any }) {
  const updateField = (field: string, value: string) => setData({ ...data, [field]: value });

  const addArrayItem = (field: string, item: any) => {
    setData({ ...data, [field]: [...(data[field as keyof PortfolioData] as any[] || []), item] });
  };

  const removeArrayItem = (field: string, index: number) => {
    setData({ ...data, [field]: (data[field as keyof PortfolioData] as any[]).filter((_, i) => i !== index) });
  };

  const updateArrayField = (field: string, index: number, key: string, value: string) => {
    const newList = [...(data[field as keyof PortfolioData] as any[])];
    newList[index] = { ...newList[index], [key]: value };
    setData({ ...data, [field]: newList });
  };

  return (
    <View style={styles.form}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Name</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={data.name} onChangeText={(v) => updateField('name', v)} />
      
      <Text style={[styles.label, { color: theme.textMuted }]}>Email</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={data.email} onChangeText={(v) => updateField('email', v)} />
      
      <Text style={[styles.label, { color: theme.textMuted }]}>Profile Photo URL (Optional)</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={data.profile_photo} placeholder="https://example.com/photo.jpg" placeholderTextColor={theme.textMuted} onChangeText={(v) => updateField('profile_photo', v)} />

      <Text style={[styles.label, { color: theme.textMuted }]}>Summary</Text>
      <TextInput style={[styles.input, { height: 100, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={data.portfolio_summary} multiline onChangeText={(v) => updateField('portfolio_summary', v)} />

      {/* Experience Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Experience</Text>
        <TouchableOpacity onPress={() => addArrayItem('experience', { title: '', company: '' })}>
          <Plus color="#a855f7" size={20} />
        </TouchableOpacity>
      </View>
      {(data.experience || []).map((exp, i) => (
        <View key={i} style={{ gap: 8, padding: 12, backgroundColor: theme.inputBg, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => removeArrayItem('experience', i)}><Trash2 color="#ef4444" size={18} /></TouchableOpacity>
          </View>
          <TextInput placeholder="Title" placeholderTextColor={theme.textMuted} style={{ color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 4 }} value={exp.title} onChangeText={(v) => updateArrayField('experience', i, 'title', v)} />
          <TextInput placeholder="Company" placeholderTextColor={theme.textMuted} style={{ color: theme.text, paddingVertical: 4 }} value={exp.company} onChangeText={(v) => updateArrayField('experience', i, 'company', v)} />
        </View>
      ))}

      {/* Education Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Education</Text>
        <TouchableOpacity onPress={() => addArrayItem('education', { name: '', institution: '' })}>
          <Plus color="#a855f7" size={20} />
        </TouchableOpacity>
      </View>
      {(data.education || []).map((edu, i) => (
        <View key={i} style={{ gap: 8, padding: 12, backgroundColor: theme.inputBg, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => removeArrayItem('education', i)}><Trash2 color="#ef4444" size={18} /></TouchableOpacity>
          </View>
          <TextInput placeholder="Degree/Certificate" placeholderTextColor={theme.textMuted} style={{ color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 4 }} value={edu.name} onChangeText={(v) => updateArrayField('education', i, 'name', v)} />
          <TextInput placeholder="Institution" placeholderTextColor={theme.textMuted} style={{ color: theme.text, paddingVertical: 4 }} value={edu.institution} onChangeText={(v) => updateArrayField('education', i, 'institution', v)} />
        </View>
      ))}

      {/* Projects Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Projects</Text>
        <TouchableOpacity onPress={() => addArrayItem('projects', { name: '', description: '', tech: '', link: '' })}>
          <Plus color="#a855f7" size={20} />
        </TouchableOpacity>
      </View>
      {(data.projects || []).map((proj, i) => (
        <View key={i} style={{ gap: 8, padding: 12, backgroundColor: theme.inputBg, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => removeArrayItem('projects', i)}><Trash2 color="#ef4444" size={18} /></TouchableOpacity>
          </View>
          <TextInput placeholder="Project Name" placeholderTextColor={theme.textMuted} style={{ color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 4 }} value={proj.name} onChangeText={(v) => updateArrayField('projects', i, 'name', v)} />
          <TextInput placeholder="Description" placeholderTextColor={theme.textMuted} style={{ color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 4 }} multiline value={proj.description} onChangeText={(v) => updateArrayField('projects', i, 'description', v)} />
          <TextInput placeholder="Technologies (e.g. React, Node.js)" placeholderTextColor={theme.textMuted} style={{ color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 4 }} value={proj.tech} onChangeText={(v) => updateArrayField('projects', i, 'tech', v)} />
          <TextInput placeholder="Project Link (Optional)" placeholderTextColor={theme.textMuted} style={{ color: theme.text, paddingVertical: 4 }} value={proj.link} onChangeText={(v) => updateArrayField('projects', i, 'link', v)} />
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={onSave}><LinearGradient colors={['#9333ea', '#db2777']} style={styles.gradientButton}><Text style={styles.buttonText}>Continue</Text></LinearGradient></TouchableOpacity>
    </View>
  );
}

const darkTheme = { bg: '#000', text: '#fff', textMuted: '#9ca3af', border: 'rgba(255,255,255,0.1)', cardBg: '#111', inputBg: '#1f2937' };
const lightTheme = { bg: '#f9fafb', text: '#111', textMuted: '#6b7280', border: '#e5e7eb', cardBg: '#fff', inputBg: '#f3f4f6' };

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  scrollContent: { paddingTop: 120, paddingHorizontal: 20, paddingBottom: 40 },
  section: { gap: 20 },
  sectionTitle: { fontSize: 28, fontWeight: '800' },
  projectCard: { borderRadius: 20, padding: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', minHeight: 160 },
  projectName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  cardDetailText: { fontSize: 14 },
  projectDate: { fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 5 },
  fixedFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, zIndex: 100 },
  createButton: { height: 56, borderRadius: 28, overflow: 'hidden' },
  gradientButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.8)', overflow: 'hidden' },
  borderSmoke: { position: 'absolute', filter: 'blur(40px)' },
  topSmoke: { top: -50, left: 0, right: 0, height: 150 },
  bottomSmoke: { bottom: -50, left: 0, right: 0, height: 150 },
  leftSmoke: { left: -50, top: 0, bottom: 0, width: 100 },
  rightSmoke: { right: -50, top: 0, bottom: 0, width: 100 },
  loadingContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, zIndex: 10 },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { height: 52, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1 },
  saveButton: { height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 10 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backLinkText: { color: '#a855f7', fontWeight: '600' },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  templateCard: { width: '47%', borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  templateCardSelected: { borderColor: '#9333ea' },
  templatePreview: { width: '100%', height: 60, borderRadius: 8, marginBottom: 10, alignItems: 'center', justifyContent: 'center' },
  templateName: { fontWeight: '600', fontSize: 13, textAlign: 'center' },
  showMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderStyle: 'dashed', borderWidth: 1, borderRadius: 12, marginTop: 10 },
  nextButton: { height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 10 },
  previewCard: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', gap: 20, borderWidth: 1, borderColor: '#a855f730' },
  previewUrl: { fontSize: 16, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 101 },
  sideMenu: { position: 'absolute', top: 0, right: 0, bottom: 0, width: width * 0.8, zIndex: 102, padding: 24, paddingTop: 60 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  menuTitle: { fontSize: 24, fontWeight: 'bold' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#9333ea', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  menuSectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginTop: 24, marginBottom: 16, letterSpacing: 1 },
  menuProjectItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuProjectName: { fontSize: 15, fontWeight: '500' },
  logoutMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 20, marginTop: 'auto' },
  notificationToast: { position: 'absolute', bottom: 120, left: 20, right: 20, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10, zIndex: 1000 },
  notificationText: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' }
});
