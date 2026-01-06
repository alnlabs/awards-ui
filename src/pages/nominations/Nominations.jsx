import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Table } from "react-bootstrap";
import styled from "styled-components";
import { BiPlus, BiListUl, BiUser } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

import {
  fetchNominations,
  fetchNominationHistory,
} from "../../store/slices/nominationsSlice";
import { STATUS_COLORS, USER_ROLES } from "../../utils/constants";
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

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

/* =====================
   Component
===================== */

const Nominations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const {
    nominations = [],
    history = [],
    loading,
  } = useSelector((state) => state.nominations);

  /* =====================
     FETCH (ROLE AWARE)
  ===================== */

  useEffect(() => {
    if (!user) return;

    if (user.role === USER_ROLES.MANAGER) {
      dispatch(fetchNominationHistory());
    } else {
      dispatch(fetchNominations({}));
    }
  }, [dispatch, user]);

  if (loading) return <Loading />;

  const displayNominations =
    user?.role === USER_ROLES.MANAGER ? history : nominations;

  /* =====================
     UI
  ===================== */

  return (
    <>
      <PageHeader
        icon={BiListUl}
        title="Nominations"
        subtitle={
          user?.role === USER_ROLES.MANAGER
            ? "Your nominations"
            : "All nominations"
        }
        actions={
          user?.role === USER_ROLES.MANAGER && (
            <AppButton
              icon={BiPlus}
              onClick={() => navigate("/nominations/new")}
            >
              New Nomination
            </AppButton>
          )
        }
      />

      {displayNominations.length === 0 ? (
        <StyledCard>
          <CardBody className="text-center py-5">
            <BiListUl
              style={{
                fontSize: "3.5rem",
                color: "#dee2e6",
                marginBottom: "1rem",
              }}
            />
            <h4>No nominations yet</h4>
            <p className="text-muted mb-3">
              {user?.role === USER_ROLES.MANAGER
                ? "Create your first nomination to recognize outstanding employees"
                : "No nominations available"}
            </p>

            {user?.role === USER_ROLES.MANAGER && (
              <AppButton
                icon={BiPlus}
                onClick={() => navigate("/nominations/new")}
              >
                Create Nomination
              </AppButton>
            )}
          </CardBody>
        </StyledCard>
      ) : (
        <StyledCard>
          <CardHeader>
            <CardTitle>Nominations List</CardTitle>
          </CardHeader>

          <CardBody>
            <TableWrapper>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Nominee</th>
                    <th>Cycle</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {displayNominations.map((n) => (
                    <tr key={n.id}>
                      <td>
                        <BiUser style={{ marginRight: "0.35rem" }} />
                        {n.nominee_id}
                      </td>

                      <td>{n.cycle_id}</td>

                      <td>
                        <Badge bg={STATUS_COLORS[n.status] || "secondary"}>
                          {n.status}
                        </Badge>
                      </td>

                      <td>
                        {n.submitted_at
                          ? new Date(n.submitted_at).toLocaleDateString()
                          : "Draft"}
                      </td>

                      <td>
                        <AppButton
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/nominations/${n.id}/view`)}
                        >
                          View
                        </AppButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </CardBody>
        </StyledCard>
      )}
    </>
  );
};

export default Nominations;
