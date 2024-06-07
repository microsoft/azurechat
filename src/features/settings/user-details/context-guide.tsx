import { Markdown } from "@/components/markdown/markdown"

const contextMarkdown = `#### Provide Context for Tailored Interactions

To enhance the relevance of our interactions, sharing a brief note about your role and your preferred communication style can be very helpful. This information enables us to adjust our responses to better align with your needs and preferences. Consider including:

1. **Brief Role Description**: Just a line or two about what you do, without needing detailed personal or professional information.
2. **Preferred Communication Style**: Let us know if you favour detailed analyses, concise summaries, or a mixture of both.
3. **Other Preferences**: Mention any particular preferences or requirements that might influence how we should interact, such as clarity or the level of detail needed.

This approach helps us interact with you in the most effective and considerate manner.

#### Examples:

**Example 1:**
- **Brief Role Description**: I'm a software developer working mainly on mobile applications.
- **Preferred Communication Style**: I appreciate detailed, technical explanations that help me integrate concepts into my projects.
- **Other Preferences**: Efficiency is crucial due to my tight deadlines.

**Example 2:**
- **Brief Role Description**: I teach technology integration methods at a high school.
- **Preferred Communication Style**: I prefer straightforward, brief responses that I can easily understand and teach.
- **Other Preferences**: Please use simple language, as English is not my first language.`

export const ContextGuide: React.FC = () => (
  <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:col-span-1">
    <Markdown content={contextMarkdown} />
  </div>
)
