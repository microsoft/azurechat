import { Renderer, Tokens } from "marked"

export class CustomRenderer extends Renderer {
  paragraph(token: Tokens.Paragraph): string {
    return `<p>${token.text}</p>`
  }

  strong(token: Tokens.Strong): string {
    return `<strong>${token.text}</strong>`
  }

  em(token: Tokens.Em): string {
    return `<em>${token.text}</em>`
  }

  heading(token: Tokens.Heading): string {
    const level = token.depth
    return `<h${level}>${token.text}</h${level}>`
  }

  link(token: Tokens.Link): string {
    return `<a href="${token.href}" title="${token.title || ""}">${token.text}</a>`
  }

  image(token: Tokens.Image): string {
    return `<img src="${token.href}" alt="${token.text}" title="${token.title || ""}" />`
  }

  list(token: Tokens.List): string {
    const tag = token.ordered ? "ol" : "ul"
    return `<${tag}>${token.items.map(item => this.listitem(item)).join("")}</${tag}>`
  }

  listitem(token: Tokens.ListItem): string {
    return `<li>${token.text}</li>`
  }

  blockquote(token: Tokens.Blockquote): string {
    return `<blockquote>${token.text}</blockquote>`
  }

  code(token: Tokens.Code): string {
    return `<pre><code>${this.escape(token.text)}</code></pre>`
  }

  codespan(token: Tokens.Codespan): string {
    return `<code>${token.text}</code>`
  }

  br(): string {
    return "<br />"
  }

  del(token: Tokens.Del): string {
    return `<del>${token.text}</del>`
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
