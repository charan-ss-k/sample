import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options: string[];
}

interface FormPreviewProps {
  title: string;
  questions: Question[];
  isShared?: boolean;
  formId?: string;
}

const FormPreview = ({ title, questions, isShared = false, formId = "preview" }: FormPreviewProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileUploads, setFileUploads] = useState<Record<string, File | null>>({});

  const handleInputChange = (questionId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleFileChange = (questionId: string, files: FileList | null) => {
    if (files && files.length > 0) {
      setFileUploads((prev) => ({
        ...prev,
        [questionId]: files[0],
      }));
      setFormData((prev) => ({
        ...prev,
        [questionId]: files[0].name,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields = questions
      .filter(q => q.required && !formData[q.id])
      .map(q => q.label);
    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
      });
      return;
    }
    const submission = {
      id: `response-${Date.now()}`,
      formId: formId,
      data: formData,
      files: Object.keys(fileUploads).map(key => ({
        questionId: key,
        fileName: fileUploads[key]?.name,
        fileSize: fileUploads[key]?.size,
        fileType: fileUploads[key]?.type,
      })),
      submittedAt: new Date().toISOString()
    };
    const responsesJson = localStorage.getItem(`responses_${formId}`) || "[]";
    const responses = JSON.parse(responsesJson);
    responses.push(submission);
    localStorage.setItem(`responses_${formId}`, JSON.stringify(responses));
    toast({
      title: "Form submitted",
      description: "Thank you for your response!",
    });
    setFormData({});
    setFileUploads({});
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case "text":
        return (
          <Input
            id={question.id}
            value={formData[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Your answer"
          />
        );
      case "textarea":
        return (
          <Textarea
            id={question.id}
            value={formData[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Your answer"
          />
        );
      case "multiple_choice":
        return (
          <RadioGroup
            value={formData[question.id] || ""}
            onValueChange={(value) => handleInputChange(question.id, value)}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-option-${index}`} />
                <Label htmlFor={`${question.id}-option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "dropdown":
        return (
          <Select
            value={formData[question.id] || ""}
            onValueChange={(value) => handleInputChange(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "number":
        return (
          <Input
            id={question.id}
            type="number"
            value={formData[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, Number(e.target.value))}
            placeholder="0"
          />
        );
      case "file":
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              <label htmlFor={`file-${question.id}`} className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 mb-1">Click to upload or drag and drop</span>
                {fileUploads[question.id] ? (
                  <span className="text-sm font-medium text-blue-600">{fileUploads[question.id]?.name}</span>
                ) : (
                  <span className="text-xs text-gray-400">Supported formats: PDF, DOC, JPG, PNG</span>
                )}
              </label>
              <input 
                id={`file-${question.id}`}
                type="file" 
                className="hidden"
                onChange={(e) => handleFileChange(question.id, e.target.files)}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {isShared && (
        <div className="bg-blue-50 p-4 mb-6 rounded-md">
          <h2 className="text-lg font-medium text-blue-700 mb-2">Pexo Forms</h2>
          <p className="text-sm text-blue-600">This form is shared with you to collect responses.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-base font-medium flex">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderQuestionInput(question)}
          </div>
        ))}

        <div className="pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default FormPreview;
