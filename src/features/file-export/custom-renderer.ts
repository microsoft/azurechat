import { marked } from "marked"

export class CustomRenderer extends marked.Renderer {
  paragraph(text: string): string {
    return `<p>${text}</p>`
  }

  strong(text: string): string {
    return `<strong>${text}</strong>`
  }

  em(text: string): string {
    return `<em>${text}</em>`
  }

  heading(text: string, level: number): string {
    return `<h${level}>${text}</h${level}>`
  }

  link(href: string, title: string | null | undefined, text: string): string {
    return `<a href="${href}" title="${title || ""}">${text}</a>`
  }

  image(href: string, title: string | null, text: string): string {
    return `<img src="${href}" alt="${text}" title="${title || ""}" />`
  }

  list(body: string, ordered: boolean): string {
    const tag = ordered ? "ol" : "ul"
    return `<${tag}>${body}</${tag}>`
  }

  listitem(text: string): string {
    return `<li>${text}</li>`
  }

  blockquote(quote: string): string {
    return `<blockquote>${quote}</blockquote>`
  }

  code(code: string, _infostring: string | undefined, escaped: boolean): string {
    return `<pre><code>${escaped ? code : this.escape(code)}</code></pre>`
  }

  codespan(text: string): string {
    return `<code>${text}</code>`
  }

  br(): string {
    return "<br />"
  }

  del(text: string): string {
    return `<del>${text}</del>`
  }

  private escape(code: string): string {
    return code.replace(/[&<>"']/g, match => {
      const escapeMap: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }
      return escapeMap[match]
    })
  }
}
