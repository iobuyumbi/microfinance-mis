import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";

// Virtual List Component for handling large datasets
const VirtualList = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  className,
  renderItem,
  onScroll,
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const scrollElementRef = useRef(null);

  // Calculate virtual list dimensions
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan
  );

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: "absolute",
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: "100%",
      },
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  // Handle scroll events
  const handleScroll = useCallback(
    (event) => {
      const newScrollTop = event.target.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(event, newScrollTop);
    },
    [onScroll]
  );

  // Scroll to specific index
  const scrollToItem = useCallback(
    (index) => {
      if (containerRef.current) {
        const targetScrollTop = index * itemHeight;
        containerRef.current.scrollTop = targetScrollTop;
        setScrollTop(targetScrollTop);
      }
    },
    [itemHeight]
  );

  // Scroll to top
  const handleScrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, []);

  // Scroll to bottom
  const handleScrollToBottom = useCallback(() => {
    if (containerRef.current) {
      const maxScrollTop = totalHeight - containerHeight;
      containerRef.current.scrollTop = maxScrollTop;
      setScrollTop(maxScrollTop);
    }
  }, [totalHeight, containerHeight]);

  // Expose scroll methods
  useEffect(() => {
    if (scrollToIndex !== undefined) {
      scrollToItem(scrollToIndex);
    }
  }, [scrollToIndex, scrollToItem]);

  useEffect(() => {
    if (scrollToTop) {
      handleScrollToTop();
    }
  }, [scrollToTop, handleScrollToTop]);

  useEffect(() => {
    if (scrollToBottom) {
      handleScrollToBottom();
    }
  }, [scrollToBottom, handleScrollToBottom]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div
        ref={scrollElementRef}
        style={{
          height: totalHeight,
          position: "relative",
        }}
      >
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Virtual Grid Component for 2D layouts
const VirtualGrid = ({
  items = [],
  itemWidth = 200,
  itemHeight = 200,
  containerWidth = 800,
  containerHeight = 600,
  overscan = 2,
  className,
  renderItem,
  onScroll,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef(null);

  // Calculate grid dimensions
  const columnsCount = Math.floor(containerWidth / itemWidth);
  const rowsCount = Math.ceil(items.length / columnsCount);
  const totalWidth = columnsCount * itemWidth;
  const totalHeight = rowsCount * itemHeight;

  // Calculate visible range
  const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endRow = Math.min(
    rowsCount - 1,
    Math.floor(scrollTop / itemHeight) +
      Math.ceil(containerHeight / itemHeight) +
      overscan
  );
  const startCol = Math.max(0, Math.floor(scrollLeft / itemWidth) - overscan);
  const endCol = Math.min(
    columnsCount - 1,
    Math.floor(scrollLeft / itemWidth) +
      Math.ceil(containerWidth / itemWidth) +
      overscan
  );

  // Get visible items
  const visibleItems = useMemo(() => {
    const items = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const index = row * columnsCount + col;
        if (index < items.length) {
          items.push({
            item: items[index],
            index,
            row,
            col,
            style: {
              position: "absolute",
              top: row * itemHeight,
              left: col * itemWidth,
              width: itemWidth,
              height: itemHeight,
            },
          });
        }
      }
    }
    return items;
  }, [
    items,
    startRow,
    endRow,
    startCol,
    endCol,
    columnsCount,
    itemWidth,
    itemHeight,
  ]);

  // Handle scroll events
  const handleScroll = useCallback(
    (event) => {
      const newScrollTop = event.target.scrollTop;
      const newScrollLeft = event.target.scrollLeft;
      setScrollTop(newScrollTop);
      setScrollLeft(newScrollLeft);
      onScroll?.(event, { scrollTop: newScrollTop, scrollLeft: newScrollLeft });
    },
    [onScroll]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div
        style={{
          width: totalWidth,
          height: totalHeight,
          position: "relative",
        }}
      >
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Virtual Table Component
const VirtualTable = ({
  data = [],
  columns = [],
  rowHeight = 50,
  headerHeight = 50,
  containerHeight = 400,
  overscan = 5,
  className,
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calculate virtual table dimensions
  const totalHeight = data.length * rowHeight;
  const visibleCount = Math.ceil((containerHeight - headerHeight) / rowHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    data.length - 1,
    Math.floor(scrollTop / rowHeight) + visibleCount + overscan
  );

  // Get visible rows
  const visibleRows = useMemo(() => {
    return data.slice(startIndex, endIndex + 1).map((row, index) => ({
      data: row,
      index: startIndex + index,
      style: {
        position: "absolute",
        top: headerHeight + (startIndex + index) * rowHeight,
        height: rowHeight,
        width: "100%",
      },
    }));
  }, [data, startIndex, endIndex, rowHeight, headerHeight]);

  // Handle scroll events
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Handle row click
  const handleRowClick = useCallback(
    (rowData, rowIndex) => {
      onRowClick?.(rowData, rowIndex);
    },
    [onRowClick]
  );

  // Handle column sort
  const handleColumnSort = useCallback(
    (columnKey) => {
      onSort?.(columnKey);
    },
    [onSort]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative border border-border-primary rounded-lg overflow-hidden",
        className
      )}
      style={{ height: containerHeight }}
      {...props}
    >
      {/* Table Header */}
      <div
        className="sticky top-0 z-10 bg-surface-secondary border-b border-border-primary"
        style={{ height: headerHeight }}
      >
        <div className="flex h-full">
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                "flex items-center px-4 py-2 font-medium text-text-primary cursor-pointer hover:bg-surface-tertiary",
                column.className
              )}
              style={{
                width: column.width || "auto",
                flex: column.flex || "none",
              }}
              onClick={() => column.sortable && handleColumnSort(column.key)}
            >
              {column.header}
              {column.sortable && (
                <span className="ml-2">
                  {sortColumn === column.key && (
                    <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Table Body */}
      <div
        className="overflow-auto"
        style={{ height: containerHeight - headerHeight }}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: totalHeight,
            position: "relative",
          }}
        >
          {visibleRows.map(({ data: rowData, index, style }) => (
            <div
              key={index}
              className={cn(
                "flex border-b border-border-primary hover:bg-surface-secondary cursor-pointer",
                index % 2 === 0 ? "bg-surface-primary" : "bg-surface-secondary"
              )}
              style={style}
              onClick={() => handleRowClick(rowData, index)}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className={cn("px-4 py-2", column.className)}
                  style={{
                    width: column.width || "auto",
                    flex: column.flex || "none",
                  }}
                >
                  {column.render
                    ? column.render(rowData[column.key], rowData, index)
                    : rowData[column.key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { VirtualList, VirtualGrid, VirtualTable };
export default VirtualList;
