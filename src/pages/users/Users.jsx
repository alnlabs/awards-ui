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
import { BiPlus, BiUser, BiEdit, BiTrash } from "react-icons/bi";

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

/* =====================
   Component
===================== */

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    users = [],
    loading,
    total = 0,
  } = useSelector((state) => state.users);

  /* =====================
     Pagination
  ===================== */
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchUsers({ page, page_size: pageSize }));
  }, [dispatch, page]);

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
          </div>
        ),
      },
    ],
    [navigate]
  );

  /* =====================
     React Table
  ===================== */
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
  });

  /* =====================
     Bulk Delete
  ===================== */
  const handleBulkDelete = async () => {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id);

    if (!ids.length) return;

    await dispatch(bulkDeleteUsers(ids));
    table.resetRowSelection();
    dispatch(fetchUsers({ page, page_size: pageSize }));
  };

  if (loading) return <Loading />;

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
          <CardTitle>Users ({total})</CardTitle>
        </CardHeader>

        <CardBody>
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

          {/* Pagination */}
          <div className="d-flex justify-content-between mt-3">
            <span>
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
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
        </CardBody>
      </StyledCard>
    </>
  );
};

export default Users;
