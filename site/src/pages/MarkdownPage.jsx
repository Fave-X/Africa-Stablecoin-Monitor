import { marked } from 'marked'

export default function MarkdownPage({ source }) {
  return (
    <article className="prose-doc mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: marked.parse(source) }} />
  )
}
