import React from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './routes/AppRouter'

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Provider>
  )
}

export default App