
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Share, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface FormShareProps {
  formId: string;
  formTitle: string;
}

const FormShare = ({ formId, formTitle }: FormShareProps) => {
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formExists, setFormExists] = useState(false);

  const shareableLink = `${window.location.origin}/form/${formId}`;

  useEffect(() => {
    // Check if the form exists in localStorage
    const existingFormsJson = localStorage.getItem("formDatabase") || "[]";
    const existingForms = JSON.parse(existingFormsJson);
    const form = existingForms.find((f: any) => f.id === formId);

    if (form) {
      setFormExists(true);
      
      // Check if form is already in publicDatabase
      const publicDatabaseJson = localStorage.getItem("publicDatabase") || "[]";
      const publicDatabase = JSON.parse(publicDatabaseJson);
      const isAlreadyPublic = publicDatabase.some((f: any) => f.id === formId);
      setIsPublic(isAlreadyPublic);
    } else {
      setFormExists(false);
      setIsPublic(false);
    }
  }, [formId]);

  const handleCopyLink = () => {
    if (!formExists) {
      toast({
        variant: "destructive",
        title: "Form not found",
        description: "The form you are trying to share does not exist.",
      });
      return;
    }

    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Shareable link has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishToggle = (checked: boolean) => {
    setIsPublic(checked);

    const existingFormsJson = localStorage.getItem("formDatabase") || "[]";
    const existingForms = JSON.parse(existingFormsJson);

    let form = existingForms.find((f: any) => f.id === formId);

    if (!form) {
      toast({
        variant: "destructive",
        title: "Form not found",
        description: "The form you are trying to share does not exist.",
      });
      return;
    }

    const publicDatabaseJson = localStorage.getItem("publicDatabase") || "[]";
    const publicDatabase = JSON.parse(publicDatabaseJson);

    if (checked) {
      // Add the current form to publicDatabase if not already there
      if (!publicDatabase.some((f: any) => f.id === formId)) {
        publicDatabase.push({ id: formId, title: formTitle });
        localStorage.setItem("publicDatabase", JSON.stringify(publicDatabase));
      }

      toast({
        title: "Form published",
        description: "Your form is now publicly accessible",
      });
    } else {
      // Remove the form from publicDatabase
      const updatedPublicDatabase = publicDatabase.filter((f: any) => f.id !== formId);
      localStorage.setItem("publicDatabase", JSON.stringify(updatedPublicDatabase));

      toast({
        title: "Form unpublished",
        description: "Your form is now private",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
          <DialogDescription>
            Make your form public and share it with others.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="public-form" className="text-sm font-medium">
              Public form
            </Label>
            <Switch
              id="public-form"
              checked={isPublic}
              onCheckedChange={handlePublishToggle}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm font-medium">
              Shareable link
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="link"
                value={shareableLink}
                readOnly
                className="flex-1"
                disabled={!isPublic || !formExists}
              />
              <Button
                size="icon"
                onClick={handleCopyLink}
                disabled={!isPublic || !formExists}
                className={copied ? "bg-green-600" : ""}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormShare;
