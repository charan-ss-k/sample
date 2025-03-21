import { useEffect, useState } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import FormPreview from "@/components/FormPreview";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options: string[];
}

interface Form {
  id: string;
  title: string;
  questions: Question[];
}

const SharedForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated, preserving the full path
  if (!user?.isAuthenticated) {
    // Use encodeURIComponent to ensure the URL is properly encoded
    const redirectPath = encodeURIComponent(location.pathname);
    return <Navigate to={`/sign-in?redirectTo=${redirectPath}`} replace />;
  }

  useEffect(() => {
    const fetchForm = () => {
      try {
        // Get form from localStorage
        const formDatabaseJson = localStorage.getItem("formDatabase") || "[]";
        const formDatabase = JSON.parse(formDatabaseJson);
        
        // Find the form with the matching ID
        const foundForm = formDatabase.find((f: Form) => f.id === formId);
        
        if (foundForm && foundForm.questions) {
          setForm(foundForm);
        } else {
          setError('Form not found');
        }
      } catch (err) {
        setError('Failed to load form');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    } else {
      setError('Invalid form ID');
      setLoading(false);
    }
  }, [formId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-xl font-medium text-red-500 mb-4">Form Not Found</h3>
              <p className="text-gray-500">The form you are looking for does not exist or has been removed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <FormPreview
            title={form.title}
            questions={form.questions}
            isShared={true}
            formId={form.id}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedForm;
