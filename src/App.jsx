import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ShelfPage from './pages/ShelfPage'
import AddBottlePage from './pages/AddBottlePage'
import BottleDetailPage from './pages/BottleDetailPage'
import EditBottlePage from './pages/EditBottlePage'
import { CollectionProvider } from './context/CollectionContext'

export default function App() {
  return (
    <CollectionProvider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ShelfPage />} />
          <Route path="/add" element={<AddBottlePage />} />
          <Route path="/bottle/:id" element={<BottleDetailPage />} />
          <Route path="/bottle/:id/edit" element={<EditBottlePage />} />
        </Routes>
      </HashRouter>
    </CollectionProvider>
  )
}
