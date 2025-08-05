
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppTheme } from '@/constants/AppTheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo: string;
  attivo: boolean;
  data_disattivazione?: string;
  giorni_disattivazione?: number;
  created_at: string;
}

export default function ManageUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [disableDays, setDisableDays] = useState('');

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nome: '',
    cognome: '',
    ruolo: 'cliente' as 'cliente' | 'coach'
  });

  useEffect(() => {
    checkCoachPermission();
    fetchUsers();
  }, []);

  const checkCoachPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('ruolo')
      .eq('id', user.id)
      .single();

    if (profile?.ruolo !== 'coach') {
      Alert.alert('Accesso negato', 'Solo i coach possono gestire gli utenti');
      router.back();
      return;
    }

    setIsCoach(true);
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore caricamento utenti:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.nome || !newUser.cognome) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    try {
      // Crea l'utente in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      });

      if (authError) {
        Alert.alert('Errore', 'Impossibile creare l\'utente: ' + authError.message);
        return;
      }

      // Crea il profilo
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: newUser.email,
          nome: newUser.nome,
          cognome: newUser.cognome,
          ruolo: newUser.ruolo,
          created_by: currentUser?.id
        });

      if (profileError) {
        Alert.alert('Errore', 'Errore nella creazione del profilo: ' + profileError.message);
        return;
      }

      // Se è un cliente, crea la relazione coach-cliente
      if (newUser.ruolo === 'cliente') {
        await supabase
          .from('coach_clients')
          .insert({
            coach_id: currentUser?.id,
            client_id: authData.user.id
          });
      }

      Alert.alert('Successo', 'Utente creato con successo');
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', nome: '', cognome: '', ruolo: 'cliente' });
      fetchUsers();
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore');
    }
  };

  const toggleUserStatus = async (user: User) => {
    if (user.attivo) {
      // Disattiva utente
      setSelectedUser(user);
      setShowDisableModal(true);
    } else {
      // Riattiva utente
      const { error } = await supabase
        .from('profiles')
        .update({ 
          attivo: true, 
          data_disattivazione: null, 
          giorni_disattivazione: null 
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Errore', 'Impossibile riattivare l\'utente');
        return;
      }

      Alert.alert('Successo', 'Utente riattivato');
      fetchUsers();
    }
  };

  const disableUser = async () => {
    if (!selectedUser) return;

    const days = disableDays ? parseInt(disableDays) : null;
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        attivo: false,
        data_disattivazione: days ? new Date().toISOString().split('T')[0] : null,
        giorni_disattivazione: days
      })
      .eq('id', selectedUser.id);

    if (error) {
      Alert.alert('Errore', 'Impossibile disattivare l\'utente');
      return;
    }

    Alert.alert(
      'Successo', 
      days 
        ? `Utente disattivato per ${days} giorni`
        : 'Utente disattivato definitivamente'
    );
    
    setShowDisableModal(false);
    setSelectedUser(null);
    setDisableDays('');
    fetchUsers();
  };

  const deleteUser = async (user: User) => {
    Alert.alert(
      'Conferma eliminazione',
      `Sei sicuro di voler eliminare definitivamente l'utente ${user.nome} ${user.cognome}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              // Elimina dalle relazioni
              await supabase.from('coach_clients').delete().eq('client_id', user.id);
              
              // Elimina il profilo
              const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

              if (error) {
                Alert.alert('Errore', 'Impossibile eliminare l\'utente');
                return;
              }

              // Elimina dall'auth (se necessario, richiede permessi admin)
              await supabase.auth.admin.deleteUser(user.id);

              Alert.alert('Successo', 'Utente eliminato');
              fetchUsers();
            } catch (error) {
              Alert.alert('Errore', 'Si è verificato un errore');
            }
          }
        }
      ]
    );
  };

  if (!isCoach) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Accesso negato</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Gestione Utenti</ThemedText>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <ThemedText style={styles.addButtonText}>+ Nuovo Utente</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.usersList}>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>
                {user.nome} {user.cognome}
              </ThemedText>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              <View style={styles.userMeta}>
                <ThemedText style={[styles.userRole, user.ruolo === 'coach' && styles.coachRole]}>
                  {user.ruolo === 'coach' ? '👨‍🏫 Coach' : '👤 Cliente'}
                </ThemedText>
                <ThemedText style={[styles.userStatus, !user.attivo && styles.inactiveStatus]}>
                  {user.attivo ? '✅ Attivo' : '❌ Disattivato'}
                </ThemedText>
              </View>
              {!user.attivo && user.data_disattivazione && user.giorni_disattivazione && (
                <ThemedText style={styles.disableInfo}>
                  Riattivazione: {new Date(
                    new Date(user.data_disattivazione).getTime() + 
                    user.giorni_disattivazione * 24 * 60 * 60 * 1000
                  ).toLocaleDateString('it-IT')}
                </ThemedText>
              )}
            </View>
            
            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.actionButton, user.attivo ? styles.disableButton : styles.enableButton]}
                onPress={() => toggleUserStatus(user)}
              >
                <ThemedText style={styles.actionButtonText}>
                  {user.attivo ? 'Disattiva' : 'Riattiva'}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteUser(user)}
              >
                <ThemedText style={styles.actionButtonText}>Elimina</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal Creazione Utente */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Nuovo Utente</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={newUser.nome}
              onChangeText={(text) => setNewUser({...newUser, nome: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Cognome"
              value={newUser.cognome}
              onChangeText={(text) => setNewUser({...newUser, cognome: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) => setNewUser({...newUser, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={newUser.password}
              onChangeText={(text) => setNewUser({...newUser, password: text})}
              secureTextEntry
            />
            
            <View style={styles.roleSelection}>
              <TouchableOpacity
                style={[styles.roleButton, newUser.ruolo === 'cliente' && styles.roleActive]}
                onPress={() => setNewUser({...newUser, ruolo: 'cliente'})}
              >
                <ThemedText style={styles.roleButtonText}>Cliente</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, newUser.ruolo === 'coach' && styles.roleActive]}
                onPress={() => setNewUser({...newUser, ruolo: 'coach'})}
              >
                <ThemedText style={styles.roleButtonText}>Coach</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Annulla</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={createUser}
              >
                <ThemedText style={styles.createButtonText}>Crea</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Disattivazione */}
      <Modal visible={showDisableModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              Disattiva {selectedUser?.nome} {selectedUser?.cognome}
            </ThemedText>
            
            <ThemedText style={styles.modalDescription}>
              Inserisci il numero di giorni per la disattivazione temporanea (lascia vuoto per disattivazione definitiva):
            </ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Giorni (es. 30)"
              value={disableDays}
              onChangeText={setDisableDays}
              keyboardType="numeric"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowDisableModal(false);
                  setSelectedUser(null);
                  setDisableDays('');
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Annulla</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.disableButton}
                onPress={disableUser}
              >
                <ThemedText style={styles.actionButtonText}>Disattiva</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: AppTheme.spacing.lg,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
  },
  addButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  usersList: {
    flex: 1,
    padding: AppTheme.spacing.lg,
  },
  userCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 12,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  userRole: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
  },
  coachRole: {
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  userStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  inactiveStatus: {
    color: '#FF5722',
  },
  disableInfo: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  userActions: {
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  enableButton: {
    backgroundColor: '#4CAF50',
  },
  disableButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: AppTheme.colors.text,
    backgroundColor: AppTheme.colors.background,
  },
  roleSelection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
  },
  roleActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    color: AppTheme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: AppTheme.colors.textSecondary,
  },
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
