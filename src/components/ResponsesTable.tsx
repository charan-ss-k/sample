
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Response {
  id: string;
  formId: string;
  submittedAt: string;
  data: Record<string, any>;
}

interface ResponsesTableProps {
  responses: Response[];
  questions: Array<{ id: string; label: string; type: string }>;
}

const ResponsesTable = ({ responses, questions }: ResponsesTableProps) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const { isPublisher } = useAuth();

  // If not a publisher, don't show responses
  if (!isPublisher) {
    return (
      <div className="text-center py-12 border rounded-md">
        <p className="text-gray-500">You don't have permission to view responses</p>
      </div>
    );
  }

  const handleRowSelect = (responseId: string) => {
    setSelectedRows((prev) =>
      prev.includes(responseId)
        ? prev.filter((id) => id !== responseId)
        : [...prev, responseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === responses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(responses.map((r) => r.id));
    }
  };

  const exportToExcel = () => {
    setExporting(true);
    
    try {
      // Create CSV content
      const headers = ["Submitted At", ...questions.map(q => q.label)];
      
      let csvContent = headers.join(",") + "\n";
      
      // Filter responses if rows are selected
      const dataToExport = selectedRows.length > 0 
        ? responses.filter(r => selectedRows.includes(r.id))
        : responses;
      
      // Add data rows
      dataToExport.forEach(response => {
        const row = [
          new Date(response.submittedAt).toLocaleString(),
          ...questions.map(question => {
            // Format the cell value properly for CSV
            const value = response.data[question.id] || "";
            // Escape quotes and wrap in quotes if it contains a comma
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
        ];
        csvContent += row.join(",") + "\n";
      });
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set up download link
      link.setAttribute('href', url);
      link.setAttribute('download', `form-responses-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      // Add to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Responses exported",
        description: "Your data has been downloaded as a CSV file",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your data",
      });
    } finally {
      setExporting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Form Responses</h2>
        <Button 
          onClick={exportToExcel}
          disabled={responses.length === 0 || exporting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : "Export to CSV"}
        </Button>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <p className="text-gray-500">No responses yet</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === responses.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Submitted At</TableHead>
                  {questions.map((question) => (
                    <TableHead key={question.id}>{question.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(response.id)}
                        onChange={() => handleRowSelect(response.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(response.submittedAt)}
                    </TableCell>
                    {questions.map((question) => (
                      <TableCell key={question.id}>
                        {response.data[question.id] || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsesTable;
