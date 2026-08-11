import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { collections } from './data/collections'
import './styles.css'
import { preloadImage } from './utils/imagePreloader'

const root = createRoot(document.getElementById('root')!)
const [firstCollection, ...nextCollections] = collections

// Start every request immediately. The active collection gets priority while
// all following cards and their echoes warm the browser cache in the background.
for (const collection of nextCollections) {
  for (const image of [collection.image, ...collection.echoes]) {
    void preloadImage(image).catch(() => undefined)
  }
}

void Promise.all(
  [firstCollection.image, ...firstCollection.echoes].map((image) =>
    preloadImage(image, 'high').catch(() => undefined),
  ),
).then(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
