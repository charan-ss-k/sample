
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (email) {
        await resetPassword(email);
        setSubmitted(true);
      } else {
        throw new Error("Please enter your email address");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <h1 className="text-3xl font-bold text-blue-600">Pexo Forms</h1>
            </div>
            <CardTitle className="text-2xl text-center">Reset your password</CardTitle>
            <CardDescription className="text-center">
              {!submitted 
                ? "Enter your email address and we'll send you a link to reset your password" 
                : "Check your email for a password reset link"}
            </CardDescription>
          </CardHeader>
          
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
                <div className="mt-4 text-center text-sm">
                  <Link to="/sign-in" className="text-blue-600 hover:underline">
                    Back to sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="mb-4">We've sent a password reset link to <strong>{email}</strong></p>
                <p className="text-gray-500 text-sm">
                  If you don't receive an email within a few minutes, check your spam folder or try again.
                </p>
              </div>
              <div className="flex justify-center">
                <Link to="/sign-in">
                  <Button variant="outline">Back to sign in</Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
