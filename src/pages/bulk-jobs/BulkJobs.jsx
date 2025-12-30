import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge, ProgressBar, Table } from "react-bootstrap";
import { BiCloudUpload, BiTrash, BiStop } from "react-icons/bi";

import { fetchBulkJobs, cancelBulkJob } from "../../store/slices/bulkJobsSlice";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";
import AppButton from "../../components/common/AppButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/common/Card";

/* =====================
   Helpers
===================== */
const getStatusVariant = (status) => {
  switch (status) {
    case "queued":
      return "secondary";
    case "processing":
      return "info";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    case "cancelled":
      return "dark";
    default:
      return "secondary";
  }
};

const isJobRunning = (job) =>
  job.status === "queued" || job.status === "processing";

const canCancel = (job) =>
  job.status === "queued" || job.status === "processing";

/* =====================
   Component
===================== */
const BulkJobs = () => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  const { jobs = [], loading } = useSelector((state) => state.bulkJobs || {});

  /* =====================
     Initial fetch
  ===================== */
  useEffect(() => {
    dispatch(fetchBulkJobs());
  }, [dispatch]);

  /* =====================
     Conditional polling
  ===================== */
  useEffect(() => {
    const hasRunningJobs = jobs.some(isJobRunning);

    // 🛑 stop polling if no running jobs
    if (!hasRunningJobs && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    // ▶️ start polling once
    if (hasRunningJobs && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        dispatch(fetchBulkJobs());
      }, 5000);
    }

    return () => {};
  }, [jobs, dispatch]);

  /* =====================
     Cleanup on unmount
  ===================== */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /* =====================
     Cancel job
  ===================== */
  const handleCancel = (jobId) => {
    dispatch(cancelBulkJob(jobId)).then(() => {
      dispatch(fetchBulkJobs());
    });
  };

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Bulk Jobs"
        subtitle="Upload & delete background jobs"
      />

      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
        </CardHeader>

        <CardBody>
          {jobs.length === 0 ? (
            <div className="text-muted text-center py-4">No bulk jobs yet</div>
          ) : (
            <Table hover responsive align="middle">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Success</th>
                  <th>Failed</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => {
                  const progress = job.total
                    ? Math.round((job.processed / job.total) * 100)
                    : 0;

                  return (
                    <tr key={job.id}>
                      <td>
                        {job.type === "upload" ? (
                          <BiCloudUpload />
                        ) : (
                          <BiTrash />
                        )}{" "}
                        {job.type.toUpperCase()}
                      </td>

                      <td>
                        <Badge bg={getStatusVariant(job.status)}>
                          {job.status}
                        </Badge>
                      </td>

                      <td style={{ minWidth: 220 }}>
                        <ProgressBar
                          now={progress}
                          label={`${progress}%`}
                          animated={job.status === "processing"}
                        />
                      </td>

                      <td>{job.success_count}</td>
                      <td>{job.failure_count}</td>

                      <td className="d-flex gap-2">
                        {/* Download errors */}
                        {job.error_file && (
                          <AppButton
                            size="sm"
                            variant="outline-danger"
                            href={job.error_file}
                          >
                            Errors
                          </AppButton>
                        )}

                        {/* Cancel */}
                        {canCancel(job) && (
                          <AppButton
                            size="sm"
                            variant="outline-warning"
                            icon={BiStop}
                            onClick={() => handleCancel(job.id)}
                          >
                            Cancel
                          </AppButton>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default BulkJobs;
