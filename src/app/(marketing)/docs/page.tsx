import DocsViewer from '@/components/landing/DocsViewer'
import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'

export const metadata: Metadata = {
  title: 'Documentation - QuantWise',
  description: 'QuantWise documentation — commands, configuration, tools, trading skills, and guides.',
}

interface DocEntry {
  slug: string
  title: string
  category: string
}

function buildDocTree(): { categories: Record<string, DocEntry[]>; docs: Record<string, string> } {
  const docsDir = path.join(process.cwd(), 'content/docs')
  const categories: Record<string, DocEntry[]> = {}
  const docs: Record<string, string> = {}

  // README as overview
  const readmePath = path.join(docsDir, 'README.md')
  if (fs.existsSync(readmePath)) {
    docs['overview'] = fs.readFileSync(readmePath, 'utf-8')
    categories['Overview'] = [{ slug: 'overview', title: 'Overview', category: 'Overview' }]
  }

  // Scan subdirectories in display order
  const dirMap: [string, string][] = [
    ['getting-started', 'Getting Started'],
    ['configuration', 'Configuration'],
    ['commands', 'Commands'],
    ['tools', 'Tools & Agents'],
    ['trading-skills', 'Trading Skills'],
    ['advanced', 'Advanced'],
  ]

  for (const [dir, categoryName] of dirMap) {
    const dirPath = path.join(docsDir, dir)
    if (!fs.existsSync(dirPath)) continue

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && f !== 'README.md').sort()
    const entries: DocEntry[] = []

    for (const file of files) {
      const slug = `${dir}/${file.replace('.md', '')}`
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8')
      docs[slug] = content

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch
        ? titleMatch[1]
        : file.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

      entries.push({ slug, title, category: categoryName })
    }

    if (entries.length > 0) {
      categories[categoryName] = entries
    }
  }

  return { categories, docs }
}

export default function DocsPage() {
  const { categories, docs } = buildDocTree()
  return <DocsViewer categories={categories} docs={docs} />
}
