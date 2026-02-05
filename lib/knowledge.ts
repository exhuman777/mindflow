// Knowledge base loader for AI context
import fs from 'fs'
import path from 'path'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge')

interface KnowledgeFile {
  path: string
  category: string
  content: string
}

// Recursively read all .md files from knowledge directory
function readKnowledgeFiles(dir: string, category = ''): KnowledgeFile[] {
  const files: KnowledgeFile[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Recurse into subdirectory
      files.push(...readKnowledgeFiles(fullPath, entry.name))
    } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
      // Read markdown file
      const content = fs.readFileSync(fullPath, 'utf-8')
      files.push({
        path: fullPath,
        category: category || 'general',
        content,
      })
    }
  }

  return files
}

// Load all knowledge and format for AI prompt
export function loadKnowledgeBase(): string {
  const files = readKnowledgeFiles(KNOWLEDGE_DIR)

  if (files.length === 0) {
    return ''
  }

  const sections = files.map(file => {
    return `### ${file.category.toUpperCase()}: ${path.basename(file.path, '.md')}\n\n${file.content}`
  })

  return `
## BAZA WIEDZY EKSPERTÓW

Poniższa wiedza pochodzi od doświadczonych nauczycieli medytacji. Używaj jej jako głównego źródła inspiracji i technik:

${sections.join('\n\n---\n\n')}

---
WAŻNE: Powyższa wiedza ma priorytet. Generowane medytacje powinny być zgodne z tą filozofią i wykorzystywać te techniki.
`
}

// Load knowledge for specific category
export function loadKnowledgeCategory(category: string): string {
  const files = readKnowledgeFiles(path.join(KNOWLEDGE_DIR, category), category)

  if (files.length === 0) {
    return ''
  }

  return files.map(f => f.content).join('\n\n')
}

// Get list of available categories
export function getKnowledgeCategories(): string[] {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    return []
  }

  return fs.readdirSync(KNOWLEDGE_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

// Get knowledge stats
export function getKnowledgeStats(): { categories: number; files: number; totalChars: number } {
  const files = readKnowledgeFiles(KNOWLEDGE_DIR)
  const categories = new Set(files.map(f => f.category))
  const totalChars = files.reduce((sum, f) => sum + f.content.length, 0)

  return {
    categories: categories.size,
    files: files.length,
    totalChars,
  }
}
