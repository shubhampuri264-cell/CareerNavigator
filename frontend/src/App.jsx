import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import Navbar from './components/Navbar'

import Landing    from './pages/Landing'
import Assessment from './pages/Assessment'
import Results    from './pages/Results'
import Resources  from './pages/Resources'

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"                          element={<Landing />} />
            <Route path="/assessment"                element={<Assessment />} />
            <Route path="/results/:assessmentId"     element={<Results />} />
            <Route path="/resources/:role"           element={<Resources />} />

            {/* 404 */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                <p className="text-6xl font-extrabold text-gray-200">404</p>
                <p className="text-xl font-semibold text-gray-700">Page not found</p>
                <a href="/" className="btn-primary px-6 py-2 text-sm">Go Home</a>
              </div>
            } />
          </Routes>
        </main>
      </BrowserRouter>
    </SessionProvider>
  )
}
