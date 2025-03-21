import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, LogOut, FileText, Upload, Edit, Plus } from "lucide-react";
import FormBuilder from "@/components/FormBuilder";
import FormPreview from "@/components/FormPreview";
import FormShare from "@/components/FormShare";
import ResponsesTable from "@/components/ResponsesTable";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface Response {
  id: string;
  formId: string;
  submittedAt: string;
  data: Record<string, any>;
}

const Index = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", type: "text", label: "Name", required: true, options: [] },
  ]);
  const [activeTab, setActiveTab] = useState("edit");
  const [responses, setResponses] = useState<Response[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Load forms from localStorage
  useEffect(() => {
    const loadForms = () => {
      const formDatabaseJson = localStorage.getItem("formDatabase") || "[]";
      const formDatabase = JSON.parse(formDatabaseJson);
      
      if (formDatabase.length > 0) {
        setForms(formDatabase);
        
        // If no form is selected, select the first one
        if (!selectedFormId) {
          setSelectedFormId(formDatabase[0].id);
          setFormTitle(formDatabase[0].title);
          setQuestions(formDatabase[0].questions || []);
        }
      } else {
        // Create a default form if none exist
        const defaultForm = {
          id: Date.now().toString(),
          title: "Untitled Form",
          questions: [{ id: "1", type: "text", label: "Name", required: true, options: [] }]
        };
        
        localStorage.setItem("formDatabase", JSON.stringify([defaultForm]));
        setForms([defaultForm]);
        setSelectedFormId(defaultForm.id);
        setFormTitle(defaultForm.title);
        setQuestions(defaultForm.questions);
      }
    };
    
    loadForms();
  }, []);

  // Load current form when selected form changes
  useEffect(() => {
    if (selectedFormId) {
      const form = forms.find(f => f.id === selectedFormId);
      if (form) {
        setFormTitle(form.title);
        setQuestions(form.questions || []);
        
        // Load responses for this form
        loadResponses(selectedFormId);
      }
    }
  }, [selectedFormId, forms]);

  // Save form when changes are made
  useEffect(() => {
    if (selectedFormId) {
      saveCurrentForm();
    }
  }, [formTitle, questions]);

  const saveCurrentForm = () => {
    if (!selectedFormId) return;
    
    const updatedForms = forms.map(form => {
      if (form.id === selectedFormId) {
        return {
          ...form,
          title: formTitle,
          questions: [...questions]
        };
      }
      return form;
    });
    
    setForms(updatedForms);
    localStorage.setItem("formDatabase", JSON.stringify(updatedForms));
  };

  const createNewForm = () => {
    const newForm = {
      id: Date.now().toString(),
      title: newFormTitle || "Untitled Form",
      questions: [{ id: "1", type: "text", label: "Name", required: true, options: [] }]
    };
    
    const updatedForms = [...forms, newForm];
    setForms(updatedForms);
    localStorage.setItem("formDatabase", JSON.stringify(updatedForms));
    
    setSelectedFormId(newForm.id);
    setFormTitle(newForm.title);
    setQuestions(newForm.questions);
    setIsCreateFormOpen(false);
    setNewFormTitle("");
    setActiveTab("edit");
    
    toast({
      title: "Form created",
      description: "New form has been created"
    });
  };

  const deleteForm = (formId: string) => {
    const updatedForms = forms.filter(form => form.id !== formId);
    
    // Also remove from publicDatabase if it exists there
    const publicDatabaseJson = localStorage.getItem("publicDatabase") || "[]";
    const publicDatabase = JSON.parse(publicDatabaseJson);
    const updatedPublicDatabase = publicDatabase.filter((f: any) => f.id !== formId);
    localStorage.setItem("publicDatabase", JSON.stringify(updatedPublicDatabase));
    
    if (updatedForms.length === 0) {
      // Create a default form if all forms are deleted
      const defaultForm = {
        id: Date.now().toString(),
        title: "Untitled Form",
        questions: [{ id: "1", type: "text", label: "Name", required: true, options: [] }]
      };
      
      setForms([defaultForm]);
      localStorage.setItem("formDatabase", JSON.stringify([defaultForm]));
      setSelectedFormId(defaultForm.id);
      setFormTitle(defaultForm.title);
      setQuestions(defaultForm.questions);
    } else {
      setForms(updatedForms);
      localStorage.setItem("formDatabase", JSON.stringify(updatedForms));
      
      // If the deleted form was selected, select the first form
      if (selectedFormId === formId) {
        setSelectedFormId(updatedForms[0].id);
        setFormTitle(updatedForms[0].title);
        setQuestions(updatedForms[0].questions);
      }
    }
    
    toast({
      title: "Form deleted",
      description: "The form has been permanently deleted",
      variant: "destructive"
    });
  };

  const loadResponses = (formId: string) => {
    // In a real app, you would fetch responses from a database
    // For demo, let's store responses in localStorage
    const responsesJson = localStorage.getItem(`responses_${formId}`) || "[]";
    const parsedResponses = JSON.parse(responsesJson);
    setResponses(parsedResponses);
  };

  const addQuestion = (type: string) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      label: `Question ${questions.length + 1}`,
      required: false,
      options: type === "multiple_choice" || type === "dropdown" ? ["Option 1", "Option 2"] : [],
    };
    
    setQuestions([...questions, newQuestion]);
    toast({
      title: "Question added",
      description: `Added a new ${type} question`,
    });
  };

  const updateQuestion = (id: string, updates: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast({
      title: "Question deleted",
      description: "The question has been removed from your form",
      variant: "destructive",
    });
  };

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Pexo Forms</h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-gray-600">
                  Hello, {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Forms</h2>
          <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create New Form
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Form</DialogTitle>
                <DialogDescription>
                  Enter a title for your new form.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="new-form-title">Form Title</Label>
                <Input 
                  id="new-form-title" 
                  value={newFormTitle} 
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  placeholder="Untitled Form"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={createNewForm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {forms.length > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>My Forms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {forms.map(form => (
                    <div
                      key={form.id}
                      className={`flex justify-between items-center p-2 rounded ${selectedFormId === form.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                    >
                      <button
                        onClick={() => {
                          setSelectedFormId(form.id);
                          setActiveTab("edit");
                        }}
                        className="text-left flex-grow truncate"
                      >
                        {form.title}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this form?")) {
                            deleteForm(form.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              {selectedFormId && (
                <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex justify-between items-center mb-6">
                    <TabsList>
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="responses">Responses</TabsTrigger>
                    </TabsList>
                    
                    {activeTab === "preview" && (
                      <FormShare formId={selectedFormId} formTitle={formTitle} />
                    )}
                  </div>

                  <TabsContent value="edit">
                    <div className="grid md:grid-cols-4 gap-6">
                      <Card className="md:col-span-1">
                        <CardHeader>
                          <CardTitle>Question Types</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => addQuestion("text")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Text
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => addQuestion("textarea")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Long Text
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => addQuestion("multiple_choice")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Multiple Choice
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => addQuestion("dropdown")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Dropdown
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => addQuestion("number")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Number
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => addQuestion("file")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <Upload className="mr-2 h-4 w-4" />
                            File Upload
                          </Button>
                        </CardContent>
                      </Card>

                      <div className="md:col-span-3">
                        <FormBuilder
                          formTitle={formTitle}
                          setFormTitle={setFormTitle}
                          questions={questions}
                          updateQuestion={updateQuestion}
                          deleteQuestion={deleteQuestion}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    <Card>
                      <CardContent className="pt-6">
                        <FormPreview title={formTitle} questions={questions} formId={selectedFormId} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="responses">
                    <Card>
                      <CardContent className="pt-6">
                        {responses.length > 0 ? (
                          <ResponsesTable 
                            responses={responses} 
                            questions={questions.map(q => ({ id: q.id, label: q.label, type: q.type }))}
                          />
                        ) : (
                          <div className="text-center py-10">
                            <h3 className="text-xl font-medium text-gray-500 mb-4">No responses yet</h3>
                            <p className="text-gray-400 mb-6">Share your form to collect responses</p>
                            <Button variant="outline" onClick={() => setActiveTab("preview")}>
                              <FileText className="mr-2 h-4 w-4" />
                              Preview Form
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
