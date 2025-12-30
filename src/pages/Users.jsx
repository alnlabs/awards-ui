import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { BiPlus, BiUser, BiEdit, BiTrash } from 'react-icons/bi';
import { fetchUsers } from '../store/slices/usersSlice';
import { USER_ROLES } from '../utils/constants';
import Loading from '../components/common/Loading';
import { Card as StyledCard, CardHeader, CardTitle, CardBody } from '../components/common/Card';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  h1 {
    margin: 0;
    font-weight: 700;
    color: #212529;
  }
`;

const RoleBadge = styled(Badge)`
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
`;

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers({}));
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  const getRoleVariant = (role) => {
    const variants = {
      [USER_ROLES.HR]: 'danger',
      [USER_ROLES.MANAGER]: 'primary',
      [USER_ROLES.EMPLOYEE]: 'success',
      [USER_ROLES.PANEL]: 'warning',
    };
    return variants[role] || 'secondary';
  };

  return (
    <Container fluid>
      <PageHeader>
        <div>
          <h1><BiUser style={{ marginRight: '0.5rem' }} />User Management</h1>
          <p className="text-muted">Manage system users</p>
        </div>
        <Button variant="primary" size="lg">
          <BiPlus style={{ marginRight: '0.5rem' }} />
          Add User
        </Button>
      </PageHeader>

      {users.length === 0 ? (
        <StyledCard>
          <CardBody>
            <div className="text-center py-5">
              <BiUser style={{ fontSize: '4rem', color: '#dee2e6', marginBottom: '1rem' }} />
              <h4>No users yet</h4>
              <p className="text-muted">Add users to get started</p>
              <Button variant="primary">
                <BiPlus style={{ marginRight: '0.5rem' }} />
                Add User
              </Button>
            </div>
          </CardBody>
        </StyledCard>
      ) : (
        <StyledCard>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Employee Code</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.employee_code || '-'}</td>
                      <td>
                        <RoleBadge bg={getRoleVariant(user.role)}>
                          {user.role}
                        </RoleBadge>
                      </td>
                      <td>
                        <Badge bg={user.is_active ? 'success' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2">
                          <BiEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <BiTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </StyledCard>
      )}
    </Container>
  );
};

export default Users;

