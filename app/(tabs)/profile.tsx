
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppTheme } from '@/constants/AppTheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface UserProfile {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo: string;
  data_nascita?: string;
  altezza?: number;
  peso?: number;
  obiettivi?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Errore caricamento profilo:', error);
        return;
      }

      const profileData = data || {
        id: user.id,
        email: user.email,
        nome: '',
        cognome: '',
        ruolo: 'cliente'
      };

      setProfile(profileData);
      setEditData(profileData);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      if (!profile) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          email: profile.email,
          ...editData
        });

      if (error) {
        Alert.alert('Errore', 'Impossibile aggiornare il profilo');
        return;
      }

      setProfile({ ...profile, ...editData });
      setEditing(false);
      Alert.alert('Successo', 'Profilo aggiornato!');
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Errore', 'Impossibile effettuare il logout');
            } else {
              router.replace('/auth/login');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Caricamento profilo...</ThemedText>
      </ThemedView>
    );
  }

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Errore caricamento profilo</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {(profile.nome?.[0] || profile.email?.[0] || 'U').toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>
                {profile.nome && profile.cognome ? 
                  `${profile.nome} ${profile.cognome}` : 
                  profile.email
                }
              </ThemedText>
              <ThemedText style={styles.userRole}>
                {profile.ruolo === 'coach' ? '👨‍🏫 Coach' : '👤 Cliente'}
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <ThemedText style={styles.editButtonText}>
              {editing ? 'Annulla' : 'Modifica'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <ThemedText style={styles.sectionTitle}>Informazioni Personali</ThemedText>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Nome</ThemedText>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={editData.nome || ''}
                  onChangeText={(text) => setEditData({...editData, nome: text})}
                  placeholder="Il tuo nome"
                />
              ) : (
                <ThemedText style={styles.infoValue}>
                  {profile.nome || 'Non impostato'}
                </ThemedText>
              )}
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Cognome</ThemedText>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={editData.cognome || ''}
                  onChangeText={(text) => setEditData({...editData, cognome: text})}
                  placeholder="Il tuo cognome"
                />
              ) : (
                <ThemedText style={styles.infoValue}>
                  {profile.cognome || 'Non impostato'}
                </ThemedText>
              )}
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>{profile.email}</ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Data di Nascita</ThemedText>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={editData.data_nascita || ''}
                  onChangeText={(text) => setEditData({...editData, data_nascita: text})}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <ThemedText style={styles.infoValue}>
                  {profile.data_nascita ? 
                    new Date(profile.data_nascita).toLocaleDateString('it-IT') : 
                    'Non impostata'}
                </ThemedText>
              )}
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Altezza (cm)</ThemedText>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={editData.altezza?.toString() || ''}
                  onChangeText={(text) => setEditData({...editData, altezza: parseInt(text) || undefined})}
                  placeholder="175"
                  keyboardType="numeric"
                />
              ) : (
                <ThemedText style={styles.infoValue}>
                  {profile.altezza ? `${profile.altezza} cm` : 'Non impostata'}
                </ThemedText>
              )}
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Peso (kg)</ThemedText>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={editData.peso?.toString() || ''}
                  onChangeText={(text) => setEditData({...editData, peso: parseFloat(text) || undefined})}
                  placeholder="70"
                  keyboardType="numeric"
                />
              ) : (
                <ThemedText style={styles.infoValue}>
                  {profile.peso ? `${profile.peso} kg` : 'Non impostato'}
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Obiettivi</ThemedText>
            {editing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.obiettivi || ''}
                onChangeText={(text) => setEditData({...editData, obiettivi: text})}
                placeholder="Descrivi i tuoi obiettivi fitness..."
                multiline
                numberOfLines={3}
              />
            ) : (
              <ThemedText style={styles.infoValue}>
                {profile.obiettivi || 'Nessun obiettivo impostato'}
              </ThemedText>
            )}
          </View>

          {editing && (
            <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
              <ThemedText style={styles.saveButtonText}>Salva Modifiche</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <ThemedText style={styles.sectionTitle}>Impostazioni</ThemedText>
          
          {profile.ruolo === 'coach' && (
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/users/manage')}
            >
              <ThemedText style={styles.settingLabel}>👥 Gestisci Utenti</ThemedText>
              <ThemedText style={styles.settingArrow}>›</ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>🔔 Notifiche</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>🌙 Tema scuro</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>📊 Esporta dati</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>❓ Aiuto</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>🚪 Esci</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  content: {
    padding: AppTheme.spacing.lg,
    paddingTop: 60,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppTheme.spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
  },
  userRole: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
  },
  editButtonText: {
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  profileSection: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 16,
    padding: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.md,
  },
  infoGrid: {
    gap: AppTheme.spacing.md,
  },
  infoItem: {
    marginBottom: AppTheme.spacing.md,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    color: AppTheme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: AppTheme.colors.text,
    backgroundColor: AppTheme.colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: AppTheme.colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 16,
    padding: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  settingLabel: {
    fontSize: 16,
    color: AppTheme.colors.text,
  },
  settingArrow: {
    fontSize: 18,
    color: AppTheme.colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: '#FF3B3020',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
