import { useEffect } from 'react';

const PROGRAM = 'nos';

interface PageViewProps {
  page: string;
  chapter2?: string;
  pageTitle: string;
}

function PageView({ page, chapter2, pageTitle }: PageViewProps) {
  useEffect(() => {
    const fire = () =>
      window.NOS_TRACKER?.enterPage({
        program: PROGRAM,
        page,
        chapter1: 'sport',
        chapter2,
        chapter3: 'widget',
        pageTitle,
      });

    if (window.NOS_TRACKER?.enterPage) {
      fire();
      return;
    }

    // Tracker script not loaded yet — retry shortly.
    const id = window.setTimeout(fire, 500);
    return () => window.clearTimeout(id);
  }, [page, chapter2, pageTitle]);

  return null;
}

export { PageView };
