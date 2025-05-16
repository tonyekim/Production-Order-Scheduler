


"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductionOrder, Resource } from "@/lib/types";
import { format } from "date-fns";
import { ORDER_STATUSES } from "@/lib/validators";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductionOrderForm } from "./ProductionOrderForm";



export function ProductionOrderTable({
  productionOrders: initialProductionOrders = [], // Default to empty array
  resources: initialResources,
}: {
  productionOrders: ProductionOrder[];
  resources: Resource[];
}) {

    
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<ProductionOrder | null>(null);

  const handleOpenEditForm = (order: ProductionOrder) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleOpenCreateForm = () => {
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    // Handled by store updates; dialog closure is managed in ProductionOrderForm
  };

  const getResourceById = (resourceId: string) => {
    return initialResources.find((res) => res.id === resourceId);
  };

  const columns: ColumnDef<ProductionOrder>[] = [
    {
      accessorKey: "orderName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("orderName")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (status === "Scheduled") variant = "default";
        if (status === "Pending") variant = "outline";
        if (status === "InProgress") variant = "default";
        if (status === "Completed") variant = "secondary";
        if (status === "Cancelled") variant = "destructive";
        return <Badge variant={variant} data-testid={`status-${row.original.id}`}>{status}</Badge>;
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "resourceId",
      header: "Resource",
      cell: ({ row }) => {
        const resourceId = row.getValue("resourceId") as string | undefined;
        if (!resourceId) return <span className="text-muted-foreground">N/A</span>;
        const resource = getResourceById(resourceId);
        return resource ? resource.name : <span className="text-destructive">Unknown</span>;
      },
    },
    {
      accessorKey: "startTime",
      header: "Start Time",
      cell: ({ row }) => {
        const startTime = row.getValue("startTime") as Date | undefined;
        return startTime ? format(startTime, "yyyy-MM-dd HH:mm") : <span className="text-muted-foreground">N/A</span>;
      },
    },
    {
      accessorKey: "endTime",
      header: "End Time",
      cell: ({ row }) => {
        const endTime = row.getValue("endTime") as Date | undefined;
        return endTime ? format(endTime, "yyyy-MM-dd HH:mm") : <span className="text-muted-foreground">N/A</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "yyyy-MM-dd"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>
                Copy Order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {order.status === "Pending" && (
                <DropdownMenuItem onClick={() => handleOpenEditForm(order)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit / Schedule
                </DropdownMenuItem>
              )}
              {order.status === "Scheduled" && (
                <DropdownMenuItem onClick={() => handleOpenEditForm(order)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Schedule
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: Array.isArray(initialProductionOrders) ? initialProductionOrders : [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto" data-testid="filter-status-button">
              Filter by Status ({table.getColumn("status")?.getFilterValue() ? (table.getColumn("status")?.getFilterValue() as string[]).join(', ') : 'All'})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={!table.getColumn("status")?.getFilterValue()}
              onCheckedChange={() => table.getColumn("status")?.setFilterValue(undefined)}
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            {ORDER_STATUSES.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                className="capitalize"
                checked={(table.getColumn("status")?.getFilterValue() as string[] | undefined)?.includes(status) ?? false}
                onCheckedChange={(value) => {
                  const currentFilter = (table.getColumn("status")?.getFilterValue() as string[] | undefined) || [];
                  if (value) {
                    table.getColumn("status")?.setFilterValue([...currentFilter, status]);
                  } else {
                    table.getColumn("status")?.setFilterValue(currentFilter.filter((s) => s !== status));
                  }
                }}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => table.getColumn("status")?.setFilterValue(undefined)}
            >
              Clear filters
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={handleOpenCreateForm} className="ml-4" data-testid="create-order-button">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel()?.rows && table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto bg-black">
          <DialogHeader>
            <DialogTitle className="text-white">{editingOrder ? "Edit Production Order" : "Create New Production Order"}</DialogTitle>
            <DialogDescription className="text-white">
              {editingOrder ? "Update the details of the production order." : "Fill in the details to create a new production order."}
            </DialogDescription>
          </DialogHeader>
          <ProductionOrderForm
            order={editingOrder}
            onOpenChange={setIsFormOpen}
            onFormSubmitSuccess={handleFormSuccess}
            resources={initialResources}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}