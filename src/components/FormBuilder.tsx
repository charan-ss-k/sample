
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  GripVertical, 
  Type, 
  AlignLeft, 
  ListChecks, 
  ChevronDown,
  ToggleLeft, 
  Hash,
  Upload
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options: string[];
}

interface FormBuilderProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
  questions: Question[];
  updateQuestion: (id: string, updates: any) => void;
  deleteQuestion: (id: string) => void;
}

const FormBuilder = ({
  formTitle,
  setFormTitle,
  questions,
  updateQuestion,
  deleteQuestion,
}: FormBuilderProps) => {
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  
  const getQuestionIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-5 w-5 text-gray-500" />;
      case "textarea":
        return <AlignLeft className="h-5 w-5 text-gray-500" />;
      case "multiple_choice":
        return <ListChecks className="h-5 w-5 text-gray-500" />;
      case "dropdown":
        return <ChevronDown className="h-5 w-5 text-gray-500" />;
      case "number":
        return <Hash className="h-5 w-5 text-gray-500" />;
      case "file":
        return <Upload className="h-5 w-5 text-gray-500" />;
      default:
        return <Type className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleOptionChange = (questionId: string, index: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[index] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOptions = [...question.options, `Option ${question.options.length + 1}`];
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, index: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 1) {
      const newOptions = question.options.filter((_, i) => i !== index);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <Input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-2xl font-bold border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Untitled Form"
          />
        </CardContent>
      </Card>

      {questions.map((question) => (
        <Card key={question.id} className="relative">
          <div className="absolute top-4 left-4 cursor-move">
            <GripVertical className="h-5 w-5 text-gray-300" />
          </div>
          
          <CardContent className="pt-6 pl-12">
            <div className="flex items-center gap-2 mb-4">
              {getQuestionIcon(question.type)}
              <Input
                value={question.label}
                onChange={(e) =>
                  updateQuestion(question.id, { label: e.target.value })
                }
                className="font-medium border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Question"
              />
              <div className="flex items-center ml-auto space-x-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`required-${question.id}`} className="text-sm">
                    Required
                  </Label>
                  <Switch
                    id={`required-${question.id}`}
                    checked={question.required}
                    onCheckedChange={(checked) =>
                      updateQuestion(question.id, { required: checked })
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Options for multiple choice and dropdown */}
            {(question.type === "multiple_choice" || question.type === "dropdown") && (
              <div className="space-y-2 pl-7">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(question.id, index, e.target.value)}
                      className="border-none p-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder={`Option ${index + 1}`}
                    />
                    {question.options.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(question.id, index)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-6 text-blue-600"
                  onClick={() => addOption(question.id)}
                >
                  Add option
                </Button>
              </div>
            )}

            {/* Preview of other input types */}
            {question.type === "text" && (
              <div className="pl-7 mt-2">
                <Input disabled placeholder="Short answer text" className="bg-gray-50" />
              </div>
            )}
            
            {question.type === "textarea" && (
              <div className="pl-7 mt-2">
                <div className="border rounded h-24 bg-gray-50"></div>
              </div>
            )}
            
            {question.type === "number" && (
              <div className="pl-7 mt-2">
                <Input type="number" disabled placeholder="0" className="bg-gray-50" />
              </div>
            )}
            
            {question.type === "file" && (
              <div className="pl-7 mt-2">
                <div className="border border-dashed rounded-md p-3 bg-gray-50 text-center text-gray-400">
                  <Upload className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-xs">File Upload</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FormBuilder;
