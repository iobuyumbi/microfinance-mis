import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  pagination = null,
  onPageChange,
  onSort,
  onFilter,
  onRefresh,
  onExport,
  searchable = true,
  filterable = true,
  exportable = true,
  refreshable = true,
  title = "Data Table",
  emptyMessage = "No data available",
  errorMessage = "Failed to load data",
  className = "",
  rowActions = null,
  bulkActions = null,
  selectedRows = [],
  onRowSelect = null,
  selectable = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({});

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let filteredData = [...data];

    // Apply search
    if (searchTerm) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter((item) => {
          const itemValue = item[key];
          if (typeof value === "string") {
            return String(itemValue)
              .toLowerCase()
              .includes(value.toLowerCase());
          }
          return itemValue === value;
        });
      }
    });

    // Apply sorting
    if (sortField) {
      filteredData.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  }, [data, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    onSort?.(field, sortDirection === "asc" ? "desc" : "asc");
  };

  const handleFilter = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFilters({});
    setSortField("");
    setSortDirection("asc");
    onRefresh?.();
  };

  const handleExport = () => {
    onExport?.(processedData);
  };

  const handleRowSelect = (rowId, checked) => {
    if (checked) {
      onRowSelect?.([...selectedRows, rowId]);
    } else {
      onRowSelect?.(selectedRows.filter((id) => id !== rowId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onRowSelect?.(processedData.map((row) => row.id));
    } else {
      onRowSelect?.([]);
    }
  };

  const renderCell = (item, column) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === "badge") {
      return <Badge variant={column.badgeVariant || "default"}>{value}</Badge>;
    }

    if (column.type === "date") {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    }

    if (column.type === "percentage") {
      return `${value}%`;
    }

    return value;
  };

  const renderSkeleton = () => (
    <TableBody>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          {selectable && (
            <TableCell>
              <Skeleton className="h-4 w-4" />
            </TableCell>
          )}
          {columns.map((column, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
          {rowActions && (
            <TableCell>
              <Skeleton className="h-8 w-8" />
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  );

  const renderEmpty = () => (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
          className="h-24 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-gray-400 text-lg">📊</div>
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  const renderError = () => (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
          className="h-24 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-red-400 text-lg">⚠️</div>
            <p className="text-red-500">{errorMessage}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {refreshable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            )}
            {exportable && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {filterable && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              {columns
                .filter((col) => col.filterable !== false)
                .map((column) => (
                  <Select
                    key={column.key}
                    value={filters[column.key] || ""}
                    onValueChange={(value) => handleFilter(column.key, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={column.label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {column.filterOptions?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {bulkActions && selectedRows.length > 0 && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">
              {selectedRows.length} selected
            </span>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => action.onClick(selectedRows)}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === processedData.length &&
                        processedData.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={
                      column.sortable !== false
                        ? "cursor-pointer hover:bg-gray-50"
                        : ""
                    }
                    onClick={() =>
                      column.sortable !== false && handleSort(column.key)
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable !== false &&
                        sortField === column.key && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                    </div>
                  </TableHead>
                ))}
                {rowActions && <TableHead className="w-12">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            {loading ? (
              renderSkeleton()
            ) : error ? (
              renderError()
            ) : processedData.length === 0 ? (
              renderEmpty()
            ) : (
              <TableBody>
                {processedData.map((item) => (
                  <TableRow key={item.id}>
                    {selectable && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={(e) =>
                            handleRowSelect(item.id, e.target.checked)
                          }
                          className="rounded"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {renderCell(item, column)}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions.map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={() => action.onClick(item)}
                              >
                                {action.icon && (
                                  <action.icon className="h-4 w-4 mr-2" />
                                )}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.lastPage)}
                disabled={pagination.currentPage === pagination.lastPage}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;
