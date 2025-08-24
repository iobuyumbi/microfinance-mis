import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { cn } from "../../lib/utils";

/**
 * Reusable Data Table Component
 * Provides consistent table layouts, pagination, sorting, and filtering
 */
export const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  actions = [],
  className,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      columns.some((column) => {
        const value = column.accessor ? column.accessor(item) : item[column.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = columns.find(col => col.key === sortColumn)?.accessor?.(a) ?? a[sortColumn];
      const bValue = columns.find(col => col.key === sortColumn)?.accessor?.(b) ?? b[sortColumn];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredData, sortColumn, sortDirection, sortable, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredData.length);

  // Handle sorting
  const handleSort = (columnKey) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Handle pagination
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Reset pagination when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Render sort icon
  const renderSortIcon = (columnKey) => {
    if (!sortable || !column.sortable) return null;

    if (sortColumn === columnKey) {
      return sortDirection === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  // Render cell content
  const renderCell = (item, column) => {
    const value = column.accessor ? column.accessor(item) : item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === "badge") {
      return (
        <Badge variant={column.badgeVariant || "secondary"}>
          {value}
        </Badge>
      );
    }

    if (column.type === "date") {
      return value ? new Date(value).toLocaleDateString() : "N/A";
    }

    if (column.type === "datetime") {
      return value ? new Date(value).toLocaleString() : "N/A";
    }

    if (column.type === "currency") {
      // Use formatCurrency from formatters.js with optional currency parameter
      // This allows it to use the default currency from localStorage if not specified
      return value ? formatCurrency(value) : "N/A";
    }

    return value || "N/A";
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Search and Filters */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.className,
                    sortable && column.sortable !== false && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {renderSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
              {(onEdit || onDelete || onView || actions.length > 0) && (
                <TableHead className="w-[50px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onView || actions.length > 0 ? 1 : 0)}>
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onView || actions.length > 0 ? 1 : 0)}>
                  <div className="flex flex-col items-center justify-center py-8">
                    {EmptyIcon && <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />}
                    <p className="text-muted-foreground">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow
                  key={item.id || item._id || index}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    item.className
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.cellClassName}>
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView || actions.length > 0) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)}>
                              View
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="text-destructive focus:text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={action.className}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {filteredData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;