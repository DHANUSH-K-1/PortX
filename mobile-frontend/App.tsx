import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Landing from './src/screens/Landing';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import PortfolioBuilder from './src/screens/PortfolioBuilder';

export default function App() {
  const [loading, setLoading] = useState(false); // Set to false for now as we don't have a backend mock yet
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'app'>('landing');

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9333ea" />
        <StatusBar style="light" />
      </View>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'landing':
        return (
          <Landing 
            onLoginClick={() => setView('login')} 
            onRegisterClick={() => setView('register')} 
          />
        );
      case 'login':
        return (
          <Login 
            onLoginSuccess={() => setView('app')} 
            onSwitchToRegister={() => setView('register')} 
          />
        );
      case 'register':
        return (
          <Register 
            onLoginSuccess={() => setView('app')} 
            onSwitchToLogin={() => setView('login')} 
          />
        );
      case 'app':
        return (
          <PortfolioBuilder onLogout={() => setView('landing')} />
        );
      default:
        return <Landing onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderView()}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
