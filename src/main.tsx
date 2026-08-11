import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { collections } from './data/collections'
import './styles.css'
import { preloadImage } from './utils/imagePreloader'

const root = createRoot(document.getElementById('root')!)
const [firstCollection, ...nextCollections] = collections

// Start every request immediately. Only the first card blocks the initial render;
// the following cards finish warming the browser cache in the background.
for (const collection of nextCollections) {
  void preloadImage(collection.image).catch(() => undefined)
}

void preloadImage(firstCollection.image, 'high').catch(() => undefined).then(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
