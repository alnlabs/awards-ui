import { useEffect, useMemo, useState, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge, Table, Form } from "react-bootstrap";
import styled from "styled-components";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { BiPlus, BiUser, BiEdit, BiTrash, BiXCircle, BiCheckCircle } from "react-icons/bi";
import { fetchUsers, bulkDeleteUsers, updateUser } from "../../store/slices/usersSlice";
import { USER_ROLES } from "../../utils/constants";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
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

/* =====================
   Component
===================== */

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users = [], totalCount = 0, loading } = useSelector((state) => state.users);
  const { user: authUser } = useSelector((state) => state.auth);

  /* =====================
     Pagination
  ===================== */
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);

  // ✅ NEW: Status toggle
  const handleToggleStatus = useCallback(async (user) => {
    const newStatus = !user.is_active;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`)) return;
    
    await dispatch(updateUser({ 
      id: user.id, 
      data: { is_active: newStatus } 
    }));
  }, [dispatch]);

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [statusFilter, setStatusFilter] = useState(""); // "" (All), "true", "false"

  useEffect(() => {
    const filters = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };
    if (statusFilter !== "") {
      filters.is_active = statusFilter;
    }
    dispatch(fetchUsers(filters)).finally(() => {
      setHasLoadedOnce(true);
    });
  }, [dispatch, page, statusFilter]);

  /* =====================
     Role badge
  ===================== */
  const getRoleVariant = (role) => {
    const variants = {
      [USER_ROLES.SUPER_ADMIN]: "danger",
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
            disabled={row.original.id === authUser?.id}
          />
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "employee_code",
        header: "Employee Code",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => (
          <RoleBadge bg={getRoleVariant(getValue())}>{getValue()}</RoleBadge>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
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
          <div className="d-flex gap-2">
            <AppButton
              variant="outline-primary"
              size="sm"
              icon={BiEdit}
              onClick={() => navigate(`/users/${row.original.id}/edit`)}
            />
            <AppButton
              variant={row.original.is_active ? "outline-warning" : "outline-success"}
              size="sm"
              icon={row.original.is_active ? BiXCircle : BiCheckCircle}
              onClick={() => handleToggleStatus(row.original)}
              title={row.original.is_active ? "Deactivate" : "Activate"}
              disabled={row.original.id === authUser?.id}
            />
          </div>
        ),
      },
    ],
    [navigate, handleToggleStatus, authUser?.id]
  );

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
  const handleBulkDeleteClick = () => {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id);
    if (!ids.length) return;

    setBulkDeleteIds(ids);
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    await dispatch(bulkDeleteUsers(bulkDeleteIds));
    table.resetRowSelection();
    setShowBulkDeleteModal(false);
    setBulkDeleteIds([]);

    // Refresh the user list after bulk delete
    dispatch(
      fetchUsers({
        skip: (page - 1) * pageSize,
        limit: pageSize,
      })
    );
  };

  const handleBulkDeleteCancel = () => {
    setShowBulkDeleteModal(false);
    setBulkDeleteIds([]);
  };

  // ✅ Only block UI on first load
  if (loading && !hasLoadedOnce) return <Loading />;

  const selectedCount = table.getSelectedRowModel().rows.length;

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
                onClick={handleBulkDeleteClick}
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

      {showBulkDeleteModal && (
        <ConfirmActionModal
          title={`Delete ${bulkDeleteIds.length} user(s)?`}
          message={`Are you sure you want to permanently delete ${bulkDeleteIds.length} selected user(s)? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleBulkDeleteConfirm}
          onCancel={handleBulkDeleteCancel}
        />
      )}

      <StyledCard>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle>Users ({totalCount})</CardTitle>
          <div style={{ width: '200px' }}>
            <Form.Select 
              size="sm" 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </Form.Select>
          </div>
        </CardHeader>

        <CardBody>
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
            <span className="text-muted small">
              Showing {users.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
              {(page - 1) * pageSize + users.length} of {totalCount} users
            </span>
            <div className="d-flex align-items-center gap-3">
              <span className="small text-muted">
                Page {page} of {totalPages || 1}
              </span>
              <div className="d-flex gap-2">
                <AppButton
                  size="sm"
                  variant="outline-secondary"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </AppButton>
                <AppButton
                  size="sm"
                  variant="outline-secondary"
                  disabled={page >= totalPages}
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
