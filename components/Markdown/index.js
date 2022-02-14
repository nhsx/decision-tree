import ReactMarkdown from 'react-markdown';

function ExternalLink({ href='', children }) {
  if (href.match(/^http/)) {
    return <a href={href} target="_blank" rel="noreferrer">{ children } (opens in a new tab)</a>
  }
  return <a href={href}>{ children }</a>
}

export default function Markdown({ components = {}, children, ...props }) {

  return <ReactMarkdown
    {...props}
    components = {{ ...components, a: ExternalLink }}
    >
      { children }
    </ReactMarkdown>

}
