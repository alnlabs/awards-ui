import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge, Table, Form } from "react-bootstrap";
import styled from "styled-components";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { BiPlus, BiUser, BiEdit, BiTrash, BiSearch, BiSort } from "react-icons/bi";

import { fetchUsers, bulkDeleteUsers } from "../../store/slices/usersSlice";
import { USER_ROLES } from "../../utils/constants";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import {
  Card as StyledCard,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/common/Card";

/* =====================
   Styled Components
===================== */

const RoleBadge = styled(Badge)`
  font-size: 0.75rem;
  padding: 0.35rem 0.7rem;
  text-transform: uppercase;
`;

const TableWrapper = styled.div`
  position: relative;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;

  .search-input {
    flex: 1;
    max-width: 400px;
  }
`;

const SortableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: #667eea;
  }

  svg {
    font-size: 0.875rem;
    opacity: 0.6;
  }

  &.sorted {
    color: #667eea;
    font-weight: 600;

    svg {
      opacity: 1;
    }
  }
`;

/* =====================
   Component
===================== */

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users = [], total = 0, loading } = useSelector((state) => state.users);

  /* =====================
     Pagination
  ===================== */
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ✅ NEW: track first load
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  /* =====================
     Search & Sorting
  ===================== */
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }

    dispatch(fetchUsers(params)).finally(() => {
      setHasLoadedOnce(true);
    });
  }, [dispatch, page, debouncedSearch, sortBy, sortOrder]);

  /* =====================
     Role badge
  ===================== */
  const getRoleVariant = (role) => {
    const variants = {
      [USER_ROLES.HR]: "danger",
      [USER_ROLES.MANAGER]: "primary",
      [USER_ROLES.EMPLOYEE]: "success",
      [USER_ROLES.PANEL]: "warning",
    };
    return variants[role] || "secondary";
  };

  /* =====================
     Table Columns
  ===================== */
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Form.Check
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Form.Check
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: () => (
          <SortableHeader
            onClick={() => handleSort("name")}
            className={sortBy === "name" ? "sorted" : ""}
          >
            Name
            <BiSort />
            {sortBy === "name" && (
              <span style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </SortableHeader>
        ),
      },
      {
        accessorKey: "email",
        header: () => (
          <SortableHeader
            onClick={() => handleSort("email")}
            className={sortBy === "email" ? "sorted" : ""}
          >
            Email
            <BiSort />
            {sortBy === "email" && (
              <span style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </SortableHeader>
        ),
      },
      {
        accessorKey: "employee_code",
        header: () => (
          <SortableHeader
            onClick={() => handleSort("employee_code")}
            className={sortBy === "employee_code" ? "sorted" : ""}
          >
            Employee Code
            <BiSort />
            {sortBy === "employee_code" && (
              <span style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </SortableHeader>
        ),
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "role",
        header: () => (
          <SortableHeader
            onClick={() => handleSort("role")}
            className={sortBy === "role" ? "sorted" : ""}
          >
            Role
            <BiSort />
            {sortBy === "role" && (
              <span style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <RoleBadge bg={getRoleVariant(getValue())}>{getValue()}</RoleBadge>
        ),
      },
      {
        accessorKey: "is_active",
        header: () => (
          <SortableHeader
            onClick={() => handleSort("is_active")}
            className={sortBy === "is_active" ? "sorted" : ""}
          >
            Status
            <BiSort />
            {sortBy === "is_active" && (
              <span style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <Badge bg={getValue() ? "success" : "secondary"}>
            {getValue() ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <AppButton
            variant="outline-primary"
            size="sm"
            icon={BiEdit}
            onClick={() => navigate(`/users/${row.original.id}/edit`)}
          />
        ),
        enableSorting: false,
      },
    ],
    [navigate]
  );

  /* =====================
     Handle Column Sorting
  ===================== */
  const handleSort = (columnId) => {
    if (sortBy === columnId) {
      // Toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortBy(columnId);
      setSortOrder("asc");
    }
    setPage(1); // Reset to first page on sort change
  };

  /* =====================
     React Table
  ===================== */
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /* =====================
     Bulk Delete
  ===================== */
  const handleBulkDelete = async () => {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id);
    if (!ids.length) return;

    await dispatch(bulkDeleteUsers(ids));
    table.resetRowSelection();

    // Refetch with current filters
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }

    dispatch(fetchUsers(params));
  };

  // ✅ Only block UI on first load
  if (loading && !hasLoadedOnce) return <Loading />;

  const selectedCount = table.getSelectedRowModel().rows.length;
  const showingCount = users.length;

  return (
    <>
      <PageHeader
        icon={BiUser}
        title="User Management"
        subtitle="Manage system users"
        actions={
          <div className="d-flex gap-2">
            {selectedCount > 0 && (
              <AppButton
                variant="danger"
                icon={BiTrash}
                onClick={handleBulkDelete}
              >
                Delete ({selectedCount})
              </AppButton>
            )}
            <AppButton icon={BiPlus} onClick={() => navigate("/users/new")}>
              Add User
            </AppButton>
          </div>
        }
      />

      <StyledCard>
        <CardHeader>
          <CardTitle>
            Users ({total})
            {searchQuery && ` - Showing ${showingCount} result${showingCount !== 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>

        <CardBody>
          <SearchContainer>
            <div className="input-group search-input">
              <span className="input-group-text">
                <BiSearch />
              </span>
              <Form.Control
                type="text"
                placeholder="Search by name, email, employee code, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <AppButton
                variant="outline-secondary"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </AppButton>
            )}
          </SearchContainer>

          <TableWrapper>
            {/* ✅ Optional overlay spinner (no flash) */}
            {loading && hasLoadedOnce && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <Loading size="sm" />
              </div>
            )}

            <div className="table-responsive">
              <Table hover align="middle">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </TableWrapper>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span>
              Showing {showingCount} of {total} users
              {debouncedSearch && ` (filtered)`}
            </span>
            <div className="d-flex gap-2 align-items-center">
              <span>Page {page} of {Math.ceil(total / pageSize) || 1}</span>
              <div className="d-flex gap-2">
                <AppButton
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </AppButton>
                <AppButton
                  size="sm"
                  disabled={page * pageSize >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </AppButton>
              </div>
            </div>
          </div>
        </CardBody>
      </StyledCard>
    </>
  );
};

export default Users;
