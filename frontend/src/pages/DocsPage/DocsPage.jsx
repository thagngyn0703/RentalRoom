import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Container, List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { Download, Description } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import documents from './documents.generated.json';
import './DocsPage.css';

const sourceRoot = 'https://github.com/thagngyn0703/RentalRoom/blob/main/';

function documentLink(href, currentPath) {
  if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) return href;
  const resolved = new URL(href, `https://docs.local/${currentPath}`);
  const path = decodeURIComponent(resolved.pathname.slice(1));
  if (documents.some(doc => doc.path === path)) {
    return `/docs?file=${encodeURIComponent(path)}${resolved.hash}`;
  }
  return sourceRoot + path + resolved.hash;
}

export default function DocsPage() {
  const [params] = useSearchParams();
  const requested = params.get('file') || 'README.md';
  const selected = documents.find(doc => doc.path === requested);
  const readingPanel = useRef(null);
  useEffect(() => {
    if (params.has('file')) readingPanel.current?.scrollIntoView({ block: 'start' });
  }, [params]);
  const download = () => {
    const url = URL.createObjectURL(new Blob([selected.content], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = selected.path.split('/').pop();
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Chip icon={<Description />} label={`${documents.length} tài liệu · RentalRoom`} variant="outlined" color="primary" />
      <Typography variant="h3" component="h1" sx={{ mt: 2, mb: 1 }}>Tài liệu dự án</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Tổng quan, thiết kế, hướng dẫn phát triển và vận hành Trọ Chung.</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <Paper component="nav" aria-label="Danh mục tài liệu" variant="outlined" sx={{ p: 2 }}>
          {[...new Set(documents.map(doc => doc.group))].map(group => (
            <Box key={group} sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary">{group}</Typography>
              <List disablePadding>
                {documents.filter(doc => doc.group === group).map(doc => (
                  <ListItemButton key={doc.path} component={Link} to={`/docs?file=${encodeURIComponent(doc.path)}`} selected={selected?.path === doc.path} aria-current={selected?.path === doc.path ? 'page' : undefined} sx={{ borderRadius: 2 }}>
                    <ListItemText primary={doc.title} secondary={doc.path.split('/').pop()} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          ))}
        </Paper>
        <Paper ref={readingPanel} variant="outlined" sx={{ p: { xs: 2, md: 4 }, minWidth: 0, scrollMarginTop: '100px' }}>
          {!selected ? <Alert severity="warning">Không tìm thấy tài liệu. Hãy chọn một tài liệu trong danh mục.</Alert> : <>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" component="h2">{selected.title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{selected.path}</Typography>
              </Box>
              <Button startIcon={<Download />} variant="outlined" onClick={download}>Tải Markdown</Button>
            </Box>
            <article className="project-document" key={selected.path} aria-label={selected.title}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
                a: ({ node, href, children, ...props }) => {
                  const target = documentLink(href, selected.path);
                  return target?.startsWith('/docs?') ? <Link to={target}>{children}</Link> : <a href={target} {...props}>{children}</a>;
                },
                table: ({ node, ...props }) => <div className="document-table"><table {...props} /></div>,
              }}>{selected.content.replace(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/, '```yaml\n$1\n```\n')}</ReactMarkdown>
            </article>
          </>}
        </Paper>
      </Box>
    </Container>
  );
}
