
import { Stack } from 'expo-router'

export default function UsersLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="manage" 
        options={{ 
          title: 'Gestione Utenti',
          headerShown: true 
        }} 
      />
    </Stack>
  )
}
