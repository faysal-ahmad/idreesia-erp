import { useEffect, useRef, useState } from 'react';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

/**
 * Measures the `scroll.y` for a `.list-table` inside the returned container so
 * the table body fills the rest of Layout.Content's padding box, keeping the
 * title (toolbar + chips) and footer (pagination) on screen.
 */
const useListScrollY = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);

  useEffect(() => {
    const updateScrollY = () => {
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const table = container.querySelector('.list-table');
        if (!table) return;

        const title = table.querySelector('.ant-table-title');
        const footer = table.querySelector('.ant-table-footer');
        const thead = table.querySelector('.ant-table-thead');
        const titleBottom = title
          ? title.getBoundingClientRect().bottom
          : table.getBoundingClientRect().top;
        const theadHeight = thead
          ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
          : TABLE_HEADER_ROW_HEIGHT;
        const footerHeight = footer
          ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
          : 64;

        const contentEl = container.closest(
          '.ant-layout-content'
        ) as HTMLElement | null;
        let bottomLimit = window.innerHeight;
        if (contentEl) {
          const paddingBottom =
            Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
          bottomLimit = contentEl.getBoundingClientRect().bottom - paddingBottom;
        }

        const nextScrollY = Math.max(
          200,
          Math.floor(
            bottomLimit -
              titleBottom -
              theadHeight -
              footerHeight -
              VIEWPORT_BOTTOM_GAP
          )
        );

        setScrollY(prev =>
          Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
        );
      });
    };

    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  return { containerRef, scrollY };
};

export default useListScrollY;
