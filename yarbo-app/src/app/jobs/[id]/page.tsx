"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Job {
  id: string;
  title?: string;
  department?: string;
  location?: string;
  salary?: string;
  description?: string;
  // Add other relevant job fields here
}

interface ApiResponse {
  success: boolean;
  data?: Job | null;
  error?: string;
  details?: string;
  message?: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchJob = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/jobs?id=${id}`);
          const result: ApiResponse = await response.json();

          if (response.ok && result.success && result.data) {
            setJob(result.data);
          } else if (response.status === 404 || (result.success === false && result.error && result.details?.toLowerCase().includes('not found'))) {
            setError(`Job with ID "${id}" not found.`);
            setJob(null);
          } else {
            setError(result.error || result.details || 'Failed to fetch job details.');
            setJob(null);
          }
        } catch (err) {
          setError('An unexpected error occurred. Please try again.');
          setJob(null);
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    } else {
      setError("No job ID provided in the URL.");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading job details...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">{error}</p>
        <Link href="/jobs" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-4">
        <p>Job data is not available.</p>
        <Link href="/jobs" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{job.title || 'Job Title Not Available'}</h1>
      <div className="space-y-2">
        <p><strong>ID:</strong> {job.id}</p>
        <p><strong>Department:</strong> {job.department || 'N/A'}</p>
        <p><strong>Location:</strong> {job.location || 'N/A'}</p>
        <p><strong>Salary:</strong> {job.salary || 'N/A'}</p>
        <p><strong>Description:</strong></p>
        <div className="prose max-w-none">
            {job.description ? (
                <p>{job.description}</p>
            ) : (
                <p>No description provided.</p>
            )}
        </div>
      </div>
      <Link href="/jobs" className="text-blue-500 hover:underline mt-6 inline-block">
        Back to Jobs
      </Link>
    </div>
  );
}
